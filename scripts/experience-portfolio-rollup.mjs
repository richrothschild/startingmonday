#!/usr/bin/env node
import path from 'node:path'
import { experienceWorkflows } from './lib/experience-workflows.mjs'
import { ageMinutes, ghJson, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'experience-portfolio-rollup.latest.md')

async function gh(pathname) {
  return ghJson({
    owner,
    repo,
    token,
    pathname,
    userAgent: 'startingmonday-experience-portfolio-rollup',
  })
}

function severityForRow(row) {
  if (row.status === 'failed' || row.status === 'missing') return 'P1'
  if (row.status === 'stale') return 'P1'
  return 'ok'
}

function scoreForRow(row) {
  if (row.status === 'failed') return 100
  if (row.status === 'missing') return 95
  if (row.status === 'stale') return 80 + Math.min(20, row.ageMinutes ?? 0)
  return 0
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

    const currentAge = ageMinutes(latest.created_at)
    const status = currentAge > workflow.maxAgeMinutes
      ? 'stale'
      : latest.conclusion !== 'success'
        ? 'failed'
        : 'healthy'

    rows.push({
      id: workflow.id,
      name: workflow.name,
      status,
      ageMinutes: currentAge,
      conclusion: latest.conclusion,
      url: latest.html_url,
      maxAgeMinutes: workflow.maxAgeMinutes,
      recommendation: workflow.recommendation,
    })
  }
  return rows
}

function buildIssueRows(workflowHealth) {
  return workflowHealth
    .filter((row) => row.status !== 'healthy')
    .map((row) => ({
      agent: row.name,
      severity: severityForRow(row),
      status: row.status,
      conclusion: row.conclusion ?? 'n/a',
      ageMinutes: row.ageMinutes,
      suggestedAction: row.recommendation,
      evidence: row.ageMinutes === null
        ? 'No completed run found on main.'
        : `Latest ${row.conclusion ?? 'n/a'} run is ${row.ageMinutes}m old (threshold ${row.maxAgeMinutes ?? 'n/a'}m).`,
      score: scoreForRow(row),
      url: row.url,
    }))
    .sort((a, b) => b.score - a.score || a.agent.localeCompare(b.agent))
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Experience Portfolio Rollup')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Agents tracked: ${report.summary.trackedAgents}`)
  lines.push(`Open issues: ${report.summary.openIssues}`)
  lines.push('')
  lines.push('## Portfolio Health')
  lines.push('')
  for (const row of report.workflowHealth) {
    const age = row.ageMinutes === null ? 'n/a' : `${row.ageMinutes}m`
    lines.push(`- ${row.name}: status=${row.status}, conclusion=${row.conclusion ?? 'n/a'}, age=${age}`)
  }
  lines.push('')
  lines.push('## Prioritized Issues')
  lines.push('')
  if (report.issues.length === 0) {
    lines.push('- None')
  } else {
    for (const issue of report.issues) {
      lines.push(`- [${issue.severity}] ${issue.agent}: ${issue.status}`)
      lines.push(`  Evidence: ${issue.evidence}`)
      lines.push(`  Action: ${issue.suggestedAction}`)
    }
  }
  lines.push('')
  lines.push('## Cross-Agent Mitigations')
  lines.push('')
  for (const mitigation of report.mitigations) {
    lines.push(`- ${mitigation}`)
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.issues.length === 0
    ? '*Experience portfolio rollup: all tracked agents healthy*'
    : `*Experience portfolio rollup: ${report.issues.length} open issue(s) across agents*`

  const issueLines = report.issues.length === 0
    ? ['- None']
    : report.issues.slice(0, 10).map((issue) => `- [${issue.severity}] ${issue.agent}: ${issue.status} — ${issue.suggestedAction}`)

  return [
    headline,
    `Channel: ${report.channel}`,
    `Tracked agents: ${report.summary.trackedAgents}`,
    '',
    '*Prioritized issues*',
    ...issueLines,
    '',
    '*Cross-agent mitigations*',
    ...report.mitigations.map((mitigation) => `- ${mitigation}`),
  ].join('\n')
}

async function main() {
  const workflowHealth = await getWorkflowHealth()
  const issues = buildIssueRows(workflowHealth)

  const mitigations = [
    'Treat stale or failed agents as observability debt: rerun the affected workflow, inspect its latest artifact, and assign an owner before the next cycle.',
    'When multiple agents point at the same surface, fix the shared route/root cause before tuning thresholds or silencing alerts.',
    'Use the agent recommendation text as the immediate next action, then reflect long-lived fixes back into SES thresholds or baseline configs.',
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    summary: {
      trackedAgents: workflowHealth.length,
      openIssues: issues.length,
      healthyAgents: workflowHealth.filter((row) => row.status === 'healthy').length,
    },
    workflowHealth,
    issues,
    mitigations,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  const posted = await postSlackText({ webhookUrl: slackWebhook, text: buildSlackText(report) })
  if (!posted) console.log('No Slack webhook configured; skipping Slack post.')

  console.log(`Experience portfolio rollup completed (${report.summary.trackedAgents} agents, open issues=${report.summary.openIssues}).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
