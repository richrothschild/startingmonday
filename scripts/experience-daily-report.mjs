#!/usr/bin/env node
import fs from 'node:fs'
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
const vitalsReportPath = path.join(process.cwd(), 'docs', 'status', 'experience-vitals.latest.json')

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

function readVitalsSummary() {
  if (!fs.existsSync(vitalsReportPath)) {
    return { available: false, breaches: 0, byTier: {} }
  }
  try {
    const vitals = JSON.parse(fs.readFileSync(vitalsReportPath, 'utf8'))
    const byTier = {}
    for (const [tier, stats] of Object.entries(vitals.summary?.byTier ?? {})) {
      byTier[tier] = stats.breaches ?? 0
    }
    return {
      available: true,
      breaches: vitals.summary?.totalBreaches ?? 0,
      byTier,
    }
  } catch {
    return { available: false, breaches: 0, byTier: {} }
  }
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

  if (report.vitalsSummary.available) {
    lines.push('')
    lines.push('## Core Web Vitals (CWV) Status')
    lines.push('')
    lines.push(`- Total breaches: ${report.vitalsSummary.breaches}`)
    for (const [tier, count] of Object.entries(report.vitalsSummary.byTier)) {
      lines.push(`  - ${tier}: ${count} breach(es)`)
    }
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

  const vitalsLine = report.vitalsSummary.available
    ? `CWV breaches: ${report.vitalsSummary.breaches} route(s)`
    : 'CWV: no recent data'

  const riskLines = report.riskRows.map((row) => `- [${row.status}] ${row.risk}`)
  const missingLines = report.missing.map((item) => `- ${item}`)

  return [
    top,
    `Channel: ${report.channel}`,
    vitalsLine,
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
  const vitalsSummary = readVitalsSummary()
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
    vitalsSummary,
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
