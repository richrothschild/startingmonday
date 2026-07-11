#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'trust-weekly.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'trust-weekly.latest.md')
const WORKFLOW_ID = 'trust-integrity-agent.yml'

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
      'User-Agent': 'startingmonday-trust-weekly-report',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status} for ${pathname}: ${text.slice(0, 300)}`)
  }

  return res.json()
}

async function getRunsSince(sinceIso) {
  const runs = []
  const maxPages = 120
  const perPage = 100

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await gh(`/actions/workflows/${WORKFLOW_ID}/runs?branch=main&status=completed&per_page=${perPage}&page=${page}`)
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

function buildMarkdown(report) {
  const lines = []
  lines.push('# Trust Weekly Issues Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Window: ${report.window.start} to ${report.window.end}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total runs: ${report.summary.totalRuns}`)
  lines.push(`- Issue runs: ${report.summary.issueRuns}`)
  lines.push(`- Issue rate: ${report.summary.issueRate}`)
  lines.push(`- Latest conclusion: ${report.summary.latestConclusion ?? 'n/a'}`)
  lines.push(`- Latest run age: ${report.summary.latestAgeMinutes ?? 'n/a'}m`)
  lines.push('')
  lines.push('## Recommended Actions')
  lines.push('')
  for (const action of report.recommendedActions) lines.push(`- ${action}`)
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.summary.issueRuns === 0
    ? '*Trust weekly report: no workflow issues*'
    : `*Trust weekly report: ${report.summary.issueRuns} issue run(s) detected*`

  return [
    headline,
    `Channel: ${report.channel}`,
    `Window: ${report.window.start} to ${report.window.end}`,
    '',
    '*Summary*',
    `- Total runs: ${report.summary.totalRuns}`,
    `- Issue runs: ${report.summary.issueRuns}`,
    `- Issue rate: ${report.summary.issueRate}`,
    `- Latest: ${report.summary.latestConclusion ?? 'n/a'} (${report.summary.latestAgeMinutes ?? 'n/a'}m old)`,
    '',
    '*Recommended actions*',
    ...report.recommendedActions.map((action) => `- ${action}`),
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

  const runs = await getRunsSince(start)
  const issueRuns = runs.filter((run) => issueConclusions.has(run.conclusion ?? '')).length
  const latest = runs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null

  const summary = {
    totalRuns: runs.length,
    issueRuns,
    issueRate: runs.length === 0 ? 0 : Number((issueRuns / runs.length).toFixed(3)),
    latestConclusion: latest?.conclusion ?? null,
    latestAgeMinutes: latest ? ageMinutes(latest.created_at) : null,
    latestRunUrl: latest?.html_url ?? null,
  }

  const recommendedActions = []
  if (summary.totalRuns === 0) {
    recommendedActions.push('Dispatch trust-integrity-agent.yml manually and verify scheduler health.')
  }
  if (summary.issueRuns > 0) {
    recommendedActions.push('Inspect latest trust-integrity findings and remediate parity/title/landmark contract violations.')
  }
  if (summary.latestConclusion === 'success' && summary.issueRuns === 0) {
    recommendedActions.push('Maintain current trust-agent cadence and tighten contract probes only after stable trend continuity.')
  }

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    window: { start, end },
    summary,
    recommendedActions,
  }

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true })
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(reportMdPath, buildMarkdown(report), 'utf8')

  await postSlack(buildSlackText(report))
  console.log('Trust weekly issues report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
