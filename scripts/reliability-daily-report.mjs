#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { reliabilityWorkflows } from './lib/reliability-workflows.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'reliability-daily.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'reliability-daily.latest.md')

const watchedWorkflows = reliabilityWorkflows

const riskCatalog = [
  {
    key: 'silent-degradation',
    risk: 'Primary flows are slow enough to feel broken while still technically passing.',
    mitigation: 'Track settle-time percentiles (P50/P95) and alert on variance, not only hard failures.',
  },
  {
    key: 'monitoring-drift',
    risk: 'Synthetic checks drift from live UX and stop representing real user behavior.',
    mitigation: 'Daily dashboard baseline crawl with route discovery and contract checks; review drift weekly.',
  },
  {
    key: 'alert-fatigue',
    risk: 'Too many noisy alerts cause teams to ignore real incidents.',
    mitigation: 'Classify soft vs hard failures, dedupe repeats, include owner and runbook links in alerts.',
  },
  {
    key: 'watchdog-gap',
    risk: 'A scheduled agent silently stops running.',
    mitigation: 'Watchdog freshness checks for each critical workflow with staleness thresholds.',
  },
  {
    key: 'secrets-drift',
    risk: 'Slack/webhook/auth secrets rotate or disappear, silently breaking alert delivery.',
    mitigation: 'Validate required secrets at workflow start and raise hard-fail alert when missing.',
  },
  {
    key: 'probe-account-entropy',
    risk: 'Synthetic account state drifts (limits, stale data, auth changes) and creates false failures.',
    mitigation: 'Use dedicated synthetic accounts, explicit skip reasons, and periodic account reset automation.',
  },
]

function ageMinutes(isoTime) {
  return Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000)
}

async function gh(pathname) {
  if (!owner || !repo || !token) throw new Error('Missing GITHUB_REPOSITORY or GITHUB_TOKEN')
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'startingmonday-reliability-daily-report',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status} for ${pathname}: ${text.slice(0, 300)}`)
  }
  return res.json()
}

async function getWorkflowHealth() {
  const rows = []
  for (const workflow of watchedWorkflows) {
    const data = await gh(`/actions/workflows/${workflow.id}/runs?branch=main&status=completed&per_page=5`)
    const runs = data.workflow_runs ?? []
    const latest = runs[0] ?? null

    if (!latest) {
      rows.push({
        id: workflow.id,
        name: workflow.name,
        status: 'missing',
        ageMinutes: null,
        conclusion: null,
        url: null,
      })
      continue
    }

    const age = ageMinutes(latest.created_at)
    const stale = age > workflow.maxAgeMinutes
    const failed = latest.conclusion !== 'success'

    rows.push({
      id: workflow.id,
      name: workflow.name,
      status: stale ? 'stale' : failed ? 'failed' : 'healthy',
      ageMinutes: age,
      conclusion: latest.conclusion,
      url: latest.html_url,
      maxAgeMinutes: workflow.maxAgeMinutes,
    })
  }
  return rows
}

function buildRiskRows(healthRows) {
  const hasStaleOrFailed = healthRows.some((row) => row.status === 'stale' || row.status === 'failed' || row.status === 'missing')
  return riskCatalog.map((risk) => ({
    ...risk,
    status: hasStaleOrFailed && (risk.key === 'watchdog-gap' || risk.key === 'silent-degradation') ? 'elevated' : 'controlled',
  }))
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Reliability Daily Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push('')
  lines.push('## Workflow Health')
  lines.push('')
  for (const row of report.workflowHealth) {
    const age = row.ageMinutes === null ? 'n/a' : `${row.ageMinutes}m`
    const threshold = row.maxAgeMinutes ? `${row.maxAgeMinutes}m` : 'n/a'
    lines.push(`- ${row.name}: status=${row.status}, conclusion=${row.conclusion ?? 'n/a'}, age=${age}, threshold=${threshold}`)
  }
  lines.push('')
  lines.push('## Devil\'s Advocate Risks')
  lines.push('')
  for (const row of report.riskRows) {
    lines.push(`- [${row.status}] ${row.risk}`)
    lines.push(`  Mitigation: ${row.mitigation}`)
  }
  lines.push('')
  lines.push('## Missing Guardrails')
  lines.push('')
  for (const item of report.missing) {
    lines.push(`- ${item}`)
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const unhealthy = report.workflowHealth.filter((row) => row.status !== 'healthy')
  const top = unhealthy.length === 0
    ? '*Reliability daily report: healthy*'
    : `*Reliability daily report: ${unhealthy.length} issue(s) detected*`

  const workflowLines = report.workflowHealth.map((row) => {
    const age = row.ageMinutes === null ? 'n/a' : `${row.ageMinutes}m`
    return `- ${row.name}: ${row.status} (${row.conclusion ?? 'n/a'}, age ${age})`
  })

  const riskLines = report.riskRows.map((row) => `- [${row.status}] ${row.risk}`)
  const missingLines = report.missing.map((item) => `- ${item}`)

  return [
    top,
    `Channel: ${report.channel}`,
    '',
    '*Workflow health*',
    ...workflowLines,
    '',
    '*Devil\'s advocate (what can go wrong)*',
    ...riskLines,
    '',
    '*What we are missing*',
    ...missingLines,
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
  const workflowHealth = await getWorkflowHealth()
  const riskRows = buildRiskRows(workflowHealth)
  const missing = [
    'Cross-environment parity check comparing staging vs production route performance over the same commit window.',
    'Automated alert dedupe window keyed by failure signature and route to reduce repeated noise.',
    'Monthly synthetic-account reset job to avoid data entropy and quota/limit drift in probes.',
    'Error budget burn-rate signal that escalates before hard SLO breaches.',
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    workflowHealth,
    riskRows,
    missing,
  }

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true })
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(reportMdPath, buildMarkdown(report), 'utf8')

  const slackText = buildSlackText(report)
  await postSlack(slackText)

  const shouldFail = workflowHealth.some((row) => row.status === 'failed' || row.status === 'missing')
  if (shouldFail) {
    console.error('Reliability daily report detected failed or missing critical workflows.')
    process.exit(1)
  }

  console.log('Reliability daily report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
