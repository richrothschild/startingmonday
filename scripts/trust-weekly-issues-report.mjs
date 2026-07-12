#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { ageMinutes, ghJson, daysAgoIso, getRunsSince, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'trust-weekly.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'trust-weekly.latest.md')
const WORKFLOW_ID = 'trust-integrity-agent.yml'

const issueConclusions = new Set(['failure', 'timed_out', 'cancelled', 'action_required'])

async function gh(pathname) {
  return ghJson({
    owner,
    repo,
    token,
    pathname,
    userAgent: 'startingmonday-trust-weekly-report',
  })
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
  const executiveSummary = report.summary.issueRuns === 0
    ? 'Trust weekly pipeline is stable with no detected workflow incidents.'
    : `Trust weekly issue rate is ${report.summary.issueRate}; recurring integrity failures should be remediated before threshold tightening.`

  return [
    headline,
    `Channel: ${report.channel}`,
    `Window: ${report.window.start} to ${report.window.end}`,
    '',
    '*Executive summary*',
    `- ${executiveSummary}`,
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
  await postSlackText({ webhookUrl: slackWebhook, text })
}

async function main() {
  const end = new Date().toISOString()
  const start = daysAgoIso(7)

  const runs = await getRunsSince(gh, WORKFLOW_ID, start)
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

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlack(buildSlackText(report))
  console.log('Trust weekly issues report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
