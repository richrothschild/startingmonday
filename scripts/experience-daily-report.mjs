#!/usr/bin/env node
import path from 'node:path'
import { experienceWorkflows } from './lib/experience-workflows.mjs'
import { ageMinutes, ghJson, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'experience-daily.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'experience-daily.latest.md')

async function gh(pathname) {
  return ghJson({
    owner,
    repo,
    token,
    pathname,
    userAgent: 'startingmonday-experience-daily-report',
  })
}

async function getWorkflowHealth() {
  const rows = []
  for (const workflow of experienceWorkflows) {
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
        recommendation: workflow.recommendation,
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
      recommendation: workflow.recommendation,
    })
  }
  return rows
}

function buildRiskRows(healthRows) {
  const hasIssues = healthRows.some((row) => row.status !== 'healthy')
  return [
    {
      key: 'partial-scan-claims',
      risk: 'Route compliance claims drift from full-site reality when inventory cadence slips.',
      mitigation: 'Route Inventory Agent runs daily and is freshness-monitored by watchdog.',
      status: hasIssues ? 'elevated' : 'controlled',
    },
    {
      key: 'incident-signal-loss',
      risk: 'High-volume style/availability findings become noise and true regressions are missed.',
      mitigation: 'Incident correlation and quarantine/debt ratchet keep findings actionable.',
      status: hasIssues ? 'elevated' : 'controlled',
    },
    {
      key: 'post-deploy-blind-spot',
      risk: 'Experience regressions ship after green CI if live-route checks are stale.',
      mitigation: 'Sentinel and dashboard baseline cadence with explicit freshness thresholds.',
      status: hasIssues ? 'elevated' : 'controlled',
    },
  ]
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Experience Daily Report')
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
    ? '*Experience daily report: healthy*'
    : `*Experience daily report: ${unhealthy.length} issue(s) detected*`

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
  await postSlackText({ webhookUrl: slackWebhook, text })
}

async function main() {
  const workflowHealth = await getWorkflowHealth()
  const riskRows = buildRiskRows(workflowHealth)
  const missing = [
    'Cross-route trust integrity trend history with 7-day and 30-day drift deltas on parity/title/landmark contracts.',
    'Deterministic cognitive fluency/load score persisted per route tier with grade-band trending.',
    'Experience baseline review bot that proposes ratcheted stricter thresholds after 30 stable days.',
    'Field-vs-lab experience delta tracker for route-level LCP/INP confidence checks.',
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    workflowHealth,
    riskRows,
    missing,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlack(buildSlackText(report))

  console.log('Experience daily report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
