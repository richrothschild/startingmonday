#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { experienceWorkflows } from './lib/experience-workflows.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'experience-monthly.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'experience-monthly.latest.md')
const portfolioHistoryPath = path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.history.json')

const issueConclusions = new Set(['failure', 'timed_out', 'cancelled', 'action_required'])

function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

async function gh(pathname) {
  if (!owner || !repo || !token) throw new Error('Missing GITHUB_REPOSITORY or GITHUB_TOKEN')
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'startingmonday-experience-monthly-trends',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status} for ${pathname}: ${text.slice(0, 300)}`)
  }

  return res.json()
}

async function getRunsSince(workflowId, sinceIso) {
  const runs = []
  const maxPages = 120
  const perPage = 100

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await gh(`/actions/workflows/${workflowId}/runs?branch=main&status=completed&per_page=${perPage}&page=${page}`)
    const pageRuns = data.workflow_runs ?? []

    if (pageRuns.length === 0) break

    let shouldStop = false
    for (const run of pageRuns) {
      if (run.created_at < sinceIso) {
        shouldStop = true
        continue
      }
      runs.push(run)
    }

    if (shouldStop) break
  }

  return runs
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

  return [
    headline,
    `Channel: ${report.channel}`,
    `Current window: ${report.currentWindow.start} to ${report.currentWindow.end}`,
    `Cluster signature trend: opened=${report.portfolioTrend.openedDelta}, resolved=${report.portfolioTrend.resolvedDelta}, latestClusters=${report.portfolioTrend.latestClusterCount}`,
    '',
    '*Trends*',
    ...trendLines,
    '',
    '*Recommended actions*',
    ...(actionLines.length > 0 ? actionLines : ['- No urgent corrective actions. Maintain current controls.']),
  ].join('\n')
}

async function postSlack(text) {
  if (!slackWebhook) {
    console.log('No Slack webhook configured; skipping Slack post.')
    return
  }

  await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}

async function main() {
  const currentEnd = new Date().toISOString()
  const currentStart = daysAgoIso(30)
  const previousStart = daysAgoIso(60)
  const previousEnd = currentStart

  const trends = []

  for (const workflow of experienceWorkflows) {
    const runs = await getRunsSince(workflow.id, previousStart)
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

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    currentWindow: { start: currentStart, end: currentEnd },
    previousWindow: { start: previousStart, end: previousEnd },
    trends,
    summary,
    portfolioTrend,
  }

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true })
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(reportMdPath, buildMarkdown(report), 'utf8')

  await postSlack(buildSlackText(report))
  console.log('Experience monthly trends report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
