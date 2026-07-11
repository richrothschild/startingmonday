#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { experienceWorkflows } from './lib/experience-workflows.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'experience-weekly.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'experience-weekly.latest.md')
const portfolioHistoryPath = path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.history.json')

const issueConclusions = new Set(['failure', 'timed_out', 'cancelled', 'action_required'])

function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function ageMinutes(isoTime) {
  return Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000)
}

async function gh(pathname) {
  if (!owner || !repo || !token) throw new Error('Missing GITHUB_REPOSITORY or GITHUB_TOKEN')
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'startingmonday-experience-weekly-report',
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

function buildWorkflowSummary(workflow, runs) {
  if (runs.length === 0) {
    return {
      id: workflow.id,
      name: workflow.name,
      totalRuns: 0,
      issueRuns: 0,
      issueRate: 0,
      stale: true,
      latestConclusion: null,
      recommendation: workflow.recommendation,
      issues: ['no completed runs in last 7 days'],
    }
  }

  const issueRuns = runs.filter((run) => issueConclusions.has(run.conclusion ?? '')).length
  const latest = runs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  const stale = ageMinutes(latest.created_at) > workflow.maxAgeMinutes

  const issues = []
  if (issueRuns > 0) issues.push(`${issueRuns} non-success runs in the last 7 days`)
  if (stale) issues.push(`latest run is stale (${ageMinutes(latest.created_at)}m old)`)

  const issueRate = Number((issueRuns / runs.length).toFixed(3))

  return {
    id: workflow.id,
    name: workflow.name,
    totalRuns: runs.length,
    issueRuns,
    issueRate,
    stale,
    latestConclusion: latest.conclusion,
    latestRunUrl: latest.html_url,
    recommendation: workflow.recommendation,
    issues,
  }
}

function buildRecommendedActions(summaries) {
  const actions = []
  for (const summary of summaries) {
    if (summary.issues.length === 0) continue
    actions.push({ workflow: summary.name, action: summary.recommendation })
  }

  if (actions.length === 0) {
    actions.push({
      workflow: 'Global experience posture',
      action: 'Maintain cadence and review any route-tier regressions before they harden into debt.',
    })
  }

  return actions
}

function readPortfolioHistory() {
  if (!fs.existsSync(portfolioHistoryPath)) {
    return { available: false, runs: [], lastOpenSignatures: [] }
  }
  const parsed = JSON.parse(fs.readFileSync(portfolioHistoryPath, 'utf8'))
  return {
    available: true,
    runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    lastOpenSignatures: Array.isArray(parsed.lastOpenSignatures) ? parsed.lastOpenSignatures : [],
    updatedAt: parsed.updatedAt ?? null,
  }
}

function portfolioWeeklyDelta(history) {
  if (!history.available || history.runs.length < 2) {
    return { available: false, newlyOpened: 0, stillOpen: 0, resolved: 0 }
  }
  const latest = history.runs[history.runs.length - 1]?.topSignatures ?? []
  const previous = history.runs[history.runs.length - 2]?.topSignatures ?? []
  const previousSet = new Set(previous)
  const latestSet = new Set(latest)
  const newlyOpened = latest.filter((sig) => !previousSet.has(sig)).length
  const stillOpen = latest.filter((sig) => previousSet.has(sig)).length
  const resolved = previous.filter((sig) => !latestSet.has(sig)).length
  return { available: true, newlyOpened, stillOpen, resolved }
}

function ownerFromSignature(signature) {
  if (!signature || typeof signature !== 'string') return 'platform-experience'
  if (signature.includes('|signal-parity|') || signature.includes('|relative-time|') || signature.includes('|title|') || signature.includes('|landmark|')) return 'trust-intel'
  if (signature.includes('|vitals-budget|')) return 'performance-platform'
  if (signature.includes('|cognitive-load|') || signature.includes('|cognitive-fluency|') || signature.includes('|cognitive-load-threshold|')) return 'content-design'
  if (signature.includes('|palette-conformance|') || signature.includes('|typography-discipline|') || signature.includes('|accent-restraint|')) return 'design-systems'
  if (signature.includes('|availability|') || signature.includes('|coverage|') || signature.includes('|debt-ratchet|') || signature.includes('|quarantine|')) return 'platform-reliability'
  if (signature.startsWith('/dashboard')) return 'dashboard-experience'
  return 'platform-experience'
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

function buildMarkdown(report) {
  const lines = []
  lines.push('# Experience Weekly Issues Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Window: ${report.window.start} to ${report.window.end}`)
  lines.push('')
  lines.push('## Issues By Workflow')
  lines.push('')

  for (const summary of report.workflowSummaries) {
    lines.push(`- ${summary.name}: runs=${summary.totalRuns}, issues=${summary.issueRuns}, issueRate=${summary.issueRate}, stale=${summary.stale}`)
    if (summary.issues.length > 0) {
      for (const issue of summary.issues) lines.push(`  Issue: ${issue}`)
    }
  }

  lines.push('')
  lines.push('## Portfolio Signature Delta')
  lines.push('')
  if (!report.portfolioDelta.available) {
    lines.push('- Signature delta unavailable (insufficient portfolio history).')
  } else {
    lines.push(`- New signatures: ${report.portfolioDelta.newlyOpened}`)
    lines.push(`- Repeated signatures: ${report.portfolioDelta.stillOpen}`)
    lines.push(`- Resolved signatures: ${report.portfolioDelta.resolved}`)
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
  lines.push('## Recommended Actions')
  lines.push('')
  for (const action of report.recommendedActions) {
    lines.push(`- ${action.workflow}: ${action.action}`)
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const issueWorkflows = report.workflowSummaries.filter((summary) => summary.issues.length > 0)
  const top = issueWorkflows.length === 0
    ? '*Weekly experience report: no open workflow issues*'
    : `*Weekly experience report: ${issueWorkflows.length} workflow(s) with issues*`

  const issueLines = issueWorkflows.length === 0
    ? ['- None']
    : issueWorkflows.map((summary) => `- ${summary.name}: ${summary.issues.join('; ')}`)

  const actionLines = report.recommendedActions.map((action) => `- ${action.workflow}: ${action.action}`)

  return [
    top,
    `Channel: ${report.channel}`,
    `Window: ${report.window.start} to ${report.window.end}`,
    `Signature delta: new=${report.portfolioDelta.newlyOpened}, repeated=${report.portfolioDelta.stillOpen}, resolved=${report.portfolioDelta.resolved}`,
    `Top owner exposure: ${report.ownerLeaderboard[0]?.owner ?? 'n/a'} (${report.ownerLeaderboard[0]?.openSignatures ?? 0})`,
    '',
    '*Issues*',
    ...issueLines,
    '',
    '*Recommended actions*',
    ...actionLines,
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
  const end = new Date().toISOString()
  const start = daysAgoIso(7)

  const workflowSummaries = []
  for (const workflow of experienceWorkflows) {
    const runs = await getRunsSince(workflow.id, start)
    workflowSummaries.push(buildWorkflowSummary(workflow, runs))
  }

  const recommendedActions = buildRecommendedActions(workflowSummaries)
  const portfolioHistory = readPortfolioHistory()
  const portfolioDelta = portfolioWeeklyDelta(portfolioHistory)
  const ownerLeaderboardRows = ownerLeaderboard(portfolioHistory)

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    window: { start, end },
    workflowSummaries,
    recommendedActions,
    portfolioDelta,
    ownerLeaderboard: ownerLeaderboardRows,
  }

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true })
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(reportMdPath, buildMarkdown(report), 'utf8')

  await postSlack(buildSlackText(report))
  console.log('Experience weekly issues report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
