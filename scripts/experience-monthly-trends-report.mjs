#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { experienceWorkflows } from './lib/experience-workflows.mjs'
import { ghJson, daysAgoIso, getRunsSince, postSlackText, writeLatestReportFiles, loadSES } from './lib/agent-report-kit.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'experience-monthly.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'experience-monthly.latest.md')
const portfolioHistoryPath = path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.history.json')
const vitalsReportPath = path.join(process.cwd(), 'docs', 'status', 'experience-vitals.latest.json')
const ses = loadSES(path.join(process.cwd(), 'config', 'site-experience-standard.json'))

const issueConclusions = new Set(['failure', 'timed_out', 'cancelled', 'action_required'])

async function gh(pathname) {
  return ghJson({
    owner,
    repo,
    token,
    pathname,
    userAgent: 'startingmonday-experience-monthly-trends',
  })
}

function summarizeWindow(runs, startIso, endIso) {
  const inWindow = runs.filter((run) => run.created_at >= startIso && run.created_at < endIso)
  if (inWindow.length === 0) return { total: 0, issues: 0, issueRate: 0 }

  const issues = inWindow.filter((run) => issueConclusions.has(run.conclusion ?? '')).length
  return {
    total: inWindow.length,
    issues,
    issueRate: Number((issues / inWindow.length).toFixed(3)),
  }
}

function classifyTrend(currentRate, previousRate) {
  const delta = Number((currentRate - previousRate).toFixed(3))
  if (delta >= 0.05) return { label: 'worse', delta }
  if (delta <= -0.05) return { label: 'improving', delta }
  return { label: 'flat', delta }
}

function recommendationForTrend(workflow, trend) {
  if (trend.label === 'worse') {
    return `Issue rate worsened by ${(trend.delta * 100).toFixed(1)} points. ${workflow.recommendation}`
  }

  if (trend.label === 'improving') {
    return `Issue rate improved by ${(Math.abs(trend.delta) * 100).toFixed(1)} points. Capture corrective controls and keep them in place.`
  }

  return 'Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.'
}

function readPortfolioHistory() {
  if (!fs.existsSync(portfolioHistoryPath)) {
    return { available: false, runs: [] }
  }
  const parsed = JSON.parse(fs.readFileSync(portfolioHistoryPath, 'utf8'))
  return {
    available: true,
    runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    updatedAt: parsed.updatedAt ?? null,
  }
}

function readVitalsReport() {
  if (!fs.existsSync(vitalsReportPath)) {
    return { available: false, byTier: {} }
  }
  try {
    const vitals = JSON.parse(fs.readFileSync(vitalsReportPath, 'utf8'))
    const byTier = {}
    for (const [tier, stats] of Object.entries(vitals.summary?.byTier ?? {})) {
      byTier[tier] = stats
    }
    return {
      available: true,
      generatedAt: vitals.generatedAt,
      totalBreaches: vitals.summary?.totalBreaches ?? 0,
      byTier,
      results: vitals.results ?? [],
    }
  } catch {
    return { available: false, byTier: {} }
  }
}

function analyzeCWVBreaches(vitalsReport) {
  if (!vitalsReport.available) {
    return {
      available: false,
      totalBreaches: 0,
      byMetric: {},
      byTier: {},
    }
  }

  const byMetric = {}
  const byTier = {}

  for (const result of vitalsReport.results) {
    if (!result.budget?.breaches) continue
    if (!byTier[result.tier]) {
      byTier[result.tier] = { count: 0, routes: [] }
    }
    byTier[result.tier].count += 1
    byTier[result.tier].routes.push(result.route)

    for (const breach of result.budget.breaches) {
      const metric = breach.split(' ')[0]
      byMetric[metric] = (byMetric[metric] ?? 0) + 1
    }
  }

  return {
    available: true,
    totalBreaches: vitalsReport.totalBreaches,
    byMetric,
    byTier,
  }
}

function monthlyPortfolioTrend(history) {
  if (!history.available || history.runs.length < 2) {
    return { available: false, openedDelta: 0, resolvedDelta: 0, latestClusterCount: 0 }
  }

  const latest = history.runs[history.runs.length - 1]
  const previous = history.runs[Math.max(0, history.runs.length - 8)]

  const latestSigs = new Set(latest?.topSignatures ?? [])
  const previousSigs = new Set(previous?.topSignatures ?? [])

  const openedDelta = [...latestSigs].filter((sig) => !previousSigs.has(sig)).length
  const resolvedDelta = [...previousSigs].filter((sig) => !latestSigs.has(sig)).length

  return {
    available: true,
    openedDelta,
    resolvedDelta,
    latestClusterCount: latest?.routeClusterCount ?? 0,
  }
}

function ownerFromSignature(signature) {
  if (!signature || typeof signature !== 'string') return 'platform-experience'
  if (signature.includes('|journey-source-stale|') || signature.includes('|journey-source-missing|') || signature.includes('|journey-source-invalid-timestamp|')) return 'synthetic-ops'
  if (signature.includes('|trust-source-stale|') || signature.includes('|trust-source-missing|') || signature.includes('|trust-source-invalid-timestamp|')) return 'trust-intel'
  if (signature.includes('|vitals-source-stale|') || signature.includes('|vitals-source-missing|') || signature.includes('|vitals-source-invalid-timestamp|')) return 'performance-platform'
  if (signature.includes('|cognitive-source-stale|') || signature.includes('|cognitive-source-missing|') || signature.includes('|cognitive-source-invalid-timestamp|')) return 'content-design'
  if (signature.includes('|sentinel-source-stale|') || signature.includes('|sentinel-source-missing|') || signature.includes('|sentinel-source-invalid-timestamp|')) return 'design-systems'
  if (signature.includes('|signal-parity|') || signature.includes('|relative-time|') || signature.includes('|title|') || signature.includes('|landmark|')) return 'trust-intel'
  if (signature.includes('|vitals-budget|')) return 'performance-platform'
  if (signature.includes('|cognitive-load|') || signature.includes('|cognitive-fluency|') || signature.includes('|cognitive-load-threshold|')) return 'content-design'
  if (signature.includes('|palette-conformance|') || signature.includes('|typography-discipline|') || signature.includes('|accent-restraint|')) return 'design-systems'
  if (signature.includes('|availability|') || signature.includes('|coverage|') || signature.includes('|debt-ratchet|') || signature.includes('|quarantine|')) return 'platform-reliability'
  if (signature.startsWith('/dashboard')) return 'dashboard-experience'
  return 'platform-experience'
}

function isSourceStalenessSignature(signature) {
  if (typeof signature !== 'string') return false
  return (
    signature.includes('-source-stale|') ||
    signature.includes('-source-missing|') ||
    signature.includes('-source-invalid-timestamp|')
  )
}

function classifyDirectionality(delta) {
  if (delta >= 1) return 'worse'
  if (delta <= -1) return 'improving'
  return 'flat'
}

function sourceStalenessDirectionality(history) {
  if (!history.available || history.runs.length < 2) {
    return {
      available: false,
      currentCount: 0,
      previousCount: 0,
      delta: 0,
      label: 'flat',
      ownerChanges: [],
    }
  }

  const latest = history.runs[history.runs.length - 1]
  const previous = history.runs[Math.max(0, history.runs.length - 8)]

  const currentSignatures = (latest?.topSignatures ?? []).filter(isSourceStalenessSignature)
  const previousSignatures = (previous?.topSignatures ?? []).filter(isSourceStalenessSignature)

  const currentOwnerCounts = new Map()
  for (const signature of currentSignatures) {
    const owner = ownerFromSignature(signature)
    currentOwnerCounts.set(owner, (currentOwnerCounts.get(owner) ?? 0) + 1)
  }

  const previousOwnerCounts = new Map()
  for (const signature of previousSignatures) {
    const owner = ownerFromSignature(signature)
    previousOwnerCounts.set(owner, (previousOwnerCounts.get(owner) ?? 0) + 1)
  }

  const allOwners = new Set([...currentOwnerCounts.keys(), ...previousOwnerCounts.keys()])
  const ownerChanges = [...allOwners]
    .map((owner) => {
      const current = currentOwnerCounts.get(owner) ?? 0
      const prev = previousOwnerCounts.get(owner) ?? 0
      return { owner, current, previous: prev, delta: current - prev }
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.owner.localeCompare(b.owner))

  const currentCount = currentSignatures.length
  const previousCount = previousSignatures.length
  const delta = currentCount - previousCount

  return {
    available: true,
    currentCount,
    previousCount,
    delta,
    label: classifyDirectionality(delta),
    ownerChanges,
  }
}

function ownerLeaderboard(history) {
  if (!history.available || history.runs.length === 0) return []
  const latest = history.runs[history.runs.length - 1]?.topSignatures ?? []
  const counts = new Map()
  for (const signature of latest) {
    const owner = ownerFromSignature(signature)
    counts.set(owner, (counts.get(owner) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([owner, openSignatures]) => ({ owner, openSignatures }))
    .sort((a, b) => b.openSignatures - a.openSignatures || a.owner.localeCompare(b.owner))
}

function baselineLifecycleReview() {
  const capturedAt = ses.capturedAt ? Date.parse(ses.capturedAt) : NaN
  const ageDays = Number.isFinite(capturedAt)
    ? Math.floor((Date.now() - capturedAt) / (24 * 60 * 60 * 1000))
    : null
  const maxAgeDays = ses.baselineLifecycle?.maxBaselineAgeDays ?? 90
  const stale = ageDays === null ? true : ageDays > maxAgeDays
  return {
    capturedAt: ses.capturedAt ?? null,
    reviewBy: ses.reviewBy ?? null,
    ageDays,
    maxAgeDays,
    stale,
    ratchetOnly: ses.baselineLifecycle?.ratchetOnly ?? true,
    requiresPullRequest: ses.baselineLifecycle?.requiresPullRequest ?? true,
    recommendation: stale
      ? 'Baseline lifecycle stale: run baseline review and submit a PR before allowing threshold drift.'
      : 'Baseline lifecycle healthy: continue ratchet-only threshold reviews on monthly cadence.',
  }
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Experience Monthly Trends Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Current window: ${report.currentWindow.start} to ${report.currentWindow.end}`)
  lines.push(`Previous window: ${report.previousWindow.start} to ${report.previousWindow.end}`)
  lines.push('')
  lines.push('## Workflow Trends')
  lines.push('')

  for (const row of report.trends) {
    lines.push(`- ${row.name}: trend=${row.trend.label}, currentIssueRate=${row.current.issueRate}, previousIssueRate=${row.previous.issueRate}, currentRuns=${row.current.total}, previousRuns=${row.previous.total}`)
    lines.push(`  Action: ${row.recommendedAction}`)
  }

  lines.push('')
  lines.push('## Portfolio Trend Summary')
  lines.push('')
  lines.push(`- Improving workflows: ${report.summary.improving}`)
  lines.push(`- Flat workflows: ${report.summary.flat}`)
  lines.push(`- Worsening workflows: ${report.summary.worse}`)
  lines.push(`- Route-cluster signature opened delta: ${report.portfolioTrend.openedDelta}`)
  lines.push(`- Route-cluster signature resolved delta: ${report.portfolioTrend.resolvedDelta}`)
  lines.push(`- Latest route cluster count: ${report.portfolioTrend.latestClusterCount}`)
  if (report.sourceStaleness.available) {
    lines.push(`- Source staleness directionality: ${report.sourceStaleness.label} (current=${report.sourceStaleness.currentCount}, previous=${report.sourceStaleness.previousCount}, delta=${report.sourceStaleness.delta})`)
  } else {
    lines.push('- Source staleness directionality: unavailable (insufficient history).')
  }
  lines.push(`- Top owner exposure: ${report.ownerLeaderboard[0]?.owner ?? 'n/a'} (${report.ownerLeaderboard[0]?.openSignatures ?? 0})`)
  lines.push('')

  if (report.cwvBreaches.available) {
    lines.push('## Core Web Vitals (CWV) Breaches')
    lines.push('')
    lines.push(`- Total breaches: ${report.cwvBreaches.totalBreaches}`)
    lines.push('')
    lines.push('### By Tier')
    for (const [tier, data] of Object.entries(report.cwvBreaches.byTier)) {
      lines.push(`- ${tier}: ${data.count} route(s) with breaches`)
    }
    lines.push('')
    lines.push('### By Metric')
    for (const [metric, count] of Object.entries(report.cwvBreaches.byMetric)) {
      lines.push(`- ${metric}: ${count} breaches`)
    }
    lines.push('')
  }

  lines.push('## Source Staleness Owner Changes')
  lines.push('')
  if (!report.sourceStaleness.available || report.sourceStaleness.ownerChanges.length === 0) {
    lines.push('- No source-staleness owner change data available.')
  } else {
    for (const row of report.sourceStaleness.ownerChanges.slice(0, 6)) {
      lines.push(`- ${row.owner}: current=${row.current}, previous=${row.previous}, delta=${row.delta}`)
    }
  }
  lines.push('')

  lines.push('## Owner Leaderboard')
  lines.push('')
  if (report.ownerLeaderboard.length === 0) {
    lines.push('- No owner exposure data available yet.')
  } else {
    for (const row of report.ownerLeaderboard) {
      lines.push(`- ${row.owner}: openSignatures=${row.openSignatures}`)
    }
  }
  lines.push('')

  lines.push('## Baseline Lifecycle Review')
  lines.push('')
  lines.push(`- Captured at: ${report.baselineReview.capturedAt ?? 'n/a'}`)
  lines.push(`- Review by: ${report.baselineReview.reviewBy ?? 'n/a'}`)
  lines.push(`- Baseline age: ${report.baselineReview.ageDays ?? 'n/a'} day(s)`)
  lines.push(`- Max baseline age: ${report.baselineReview.maxAgeDays} day(s)`)
  lines.push(`- Ratchet only: ${report.baselineReview.ratchetOnly}`)
  lines.push(`- Requires PR: ${report.baselineReview.requiresPullRequest}`)
  lines.push(`- Status: ${report.baselineReview.stale ? 'stale' : 'healthy'}`)
  lines.push(`- Recommendation: ${report.baselineReview.recommendation}`)
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.summary.worse > 0
    ? `*Monthly experience trends: ${report.summary.worse} workflow(s) worsened*`
    : '*Monthly experience trends: no worsening workflows*'

  const trendLines = report.trends.map((row) => `- ${row.name}: ${row.trend.label} (current ${row.current.issueRate}, previous ${row.previous.issueRate})`)
  const actionLines = report.trends
    .filter((row) => row.trend.label !== 'flat')
    .map((row) => `- ${row.name}: ${row.recommendedAction}`)

  const cwvLine = report.cwvBreaches.available
    ? `Core Web Vitals breaches: ${report.cwvBreaches.totalBreaches} route(s) across tiers`
    : 'Core Web Vitals: no recent data'
  const baselineLine = report.baselineReview.stale
    ? `Baseline lifecycle: stale (${report.baselineReview.ageDays ?? 'n/a'}d > ${report.baselineReview.maxAgeDays}d)`
    : `Baseline lifecycle: healthy (${report.baselineReview.ageDays ?? 'n/a'}d <= ${report.baselineReview.maxAgeDays}d)`

  return [
    headline,
    `Channel: ${report.channel}`,
    `Current window: ${report.currentWindow.start} to ${report.currentWindow.end}`,
    `Cluster signature trend: opened=${report.portfolioTrend.openedDelta}, resolved=${report.portfolioTrend.resolvedDelta}, latestClusters=${report.portfolioTrend.latestClusterCount}`,
    cwvLine,
    baselineLine,
    report.sourceStaleness.available
      ? `Source staleness directionality: ${report.sourceStaleness.label} (current=${report.sourceStaleness.currentCount}, previous=${report.sourceStaleness.previousCount}, delta=${report.sourceStaleness.delta})`
      : 'Source staleness directionality: unavailable',
    `Top owner exposure: ${report.ownerLeaderboard[0]?.owner ?? 'n/a'} (${report.ownerLeaderboard[0]?.openSignatures ?? 0})`,
    '',
    '*Trends*',
    ...trendLines,
    '',
    '*Recommended actions*',
    ...(actionLines.length > 0 ? actionLines : ['- No urgent corrective actions. Maintain current controls.']),
  ].join('\n')
}

async function postSlack(text) {
  await postSlackText({ webhookUrl: slackWebhook, text })
}

async function main() {
  const currentEnd = new Date().toISOString()
  const currentStart = daysAgoIso(30)
  const previousStart = daysAgoIso(60)
  const previousEnd = currentStart

  const trends = []

  for (const workflow of experienceWorkflows) {
    const runs = await getRunsSince(gh, workflow.id, previousStart)
    const current = summarizeWindow(runs, currentStart, currentEnd)
    const previous = summarizeWindow(runs, previousStart, previousEnd)
    const trend = classifyTrend(current.issueRate, previous.issueRate)

    trends.push({
      id: workflow.id,
      name: workflow.name,
      current,
      previous,
      trend,
      recommendedAction: recommendationForTrend(workflow, trend),
    })
  }

  const summary = {
    improving: trends.filter((row) => row.trend.label === 'improving').length,
    flat: trends.filter((row) => row.trend.label === 'flat').length,
    worse: trends.filter((row) => row.trend.label === 'worse').length,
  }

  const portfolioHistory = readPortfolioHistory()
  const portfolioTrend = monthlyPortfolioTrend(portfolioHistory)
  const sourceStaleness = sourceStalenessDirectionality(portfolioHistory)
  const ownerLeaderboardRows = ownerLeaderboard(portfolioHistory)

  const vitalsReport = readVitalsReport()
  const cwvBreaches = analyzeCWVBreaches(vitalsReport)
  const baselineReview = baselineLifecycleReview()

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    currentWindow: { start: currentStart, end: currentEnd },
    previousWindow: { start: previousStart, end: previousEnd },
    trends,
    summary,
    portfolioTrend,
    sourceStaleness,
    ownerLeaderboard: ownerLeaderboardRows,
    cwvBreaches,
    baselineReview,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlack(buildSlackText(report))
  console.log('Experience monthly trends report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
