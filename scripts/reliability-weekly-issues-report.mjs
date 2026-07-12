#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { reliabilityWorkflows } from './lib/reliability-workflows.mjs'
import { ageMinutes, ghJson, daysAgoIso, getRunsSince, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'reliability-weekly.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'reliability-weekly.latest.md')

const issueConclusions = new Set(['failure', 'timed_out', 'cancelled', 'action_required'])

async function gh(pathname) {
  return ghJson({
    owner,
    repo,
    token,
    pathname,
    userAgent: 'startingmonday-reliability-weekly-report',
  })
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
      workflow: 'Global reliability posture',
      action: 'Keep weekly verification cadence and investigate any freshness drift before it becomes an incident.',
    })
  }

  return actions
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Reliability Weekly Issues Report')
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
    ? '*Weekly reliability report: no open workflow issues*'
    : `*Weekly reliability report: ${issueWorkflows.length} workflow(s) with issues*`

  const issueLines = issueWorkflows.length === 0
    ? ['- None']
    : issueWorkflows.map((summary) => `- ${summary.name}: ${summary.issues.join('; ')}`)

  const actionLines = report.recommendedActions.map((action) => `- ${action.workflow}: ${action.action}`)

  return [
    top,
    `Channel: ${report.channel}`,
    `Window: ${report.window.start} to ${report.window.end}`,
    '',
    '*Issues*',
    ...issueLines,
    '',
    '*Recommended actions*',
    ...actionLines,
  ].join('\n')
}

async function postSlack(text) {
  await postSlackText({ webhookUrl: slackWebhook, text })
}

async function main() {
  const end = new Date().toISOString()
  const start = daysAgoIso(7)

  const workflowSummaries = []
  for (const workflow of reliabilityWorkflows) {
    const runs = await getRunsSince(gh, workflow.id, start)
    workflowSummaries.push(buildWorkflowSummary(workflow, runs))
  }

  const recommendedActions = buildRecommendedActions(workflowSummaries)

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    window: { start, end },
    workflowSummaries,
    recommendedActions,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlack(buildSlackText(report))
  console.log('Reliability weekly issues report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
