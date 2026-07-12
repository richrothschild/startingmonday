#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { ghJson, daysAgoIso, getRunsSince, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const owner = process.env.GITHUB_REPOSITORY?.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const token = process.env.GITHUB_TOKEN || ''

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'trust-monthly.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'trust-monthly.latest.md')
const WORKFLOW_ID = 'trust-integrity-agent.yml'

const issueConclusions = new Set(['failure', 'timed_out', 'cancelled', 'action_required'])

async function gh(pathname) {
  return ghJson({
    owner,
    repo,
    token,
    pathname,
    userAgent: 'startingmonday-trust-monthly-report',
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

function buildMarkdown(report) {
  const lines = []
  lines.push('# Trust Monthly Trends Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Current window: ${report.currentWindow.start} to ${report.currentWindow.end}`)
  lines.push(`Previous window: ${report.previousWindow.start} to ${report.previousWindow.end}`)
  lines.push('')
  lines.push('## Trend Summary')
  lines.push('')
  lines.push(`- Trend: ${report.trend.label}`)
  lines.push(`- Delta issue rate: ${report.trend.delta}`)
  lines.push(`- Current issue rate: ${report.current.issueRate}`)
  lines.push(`- Previous issue rate: ${report.previous.issueRate}`)
  lines.push(`- Current runs: ${report.current.total}`)
  lines.push(`- Previous runs: ${report.previous.total}`)
  lines.push('')
  lines.push('## Recommended Action')
  lines.push('')
  lines.push(`- ${report.recommendedAction}`)
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.trend.label === 'worse'
    ? '*Trust monthly trends: worsening*'
    : report.trend.label === 'improving'
      ? '*Trust monthly trends: improving*'
      : '*Trust monthly trends: flat*'
  const executiveSummary = report.trend.label === 'worse'
    ? `Trust issue rate worsened by ${report.trend.delta}; prioritize root-cause remediation for recurring integrity failures.`
    : report.trend.label === 'improving'
      ? `Trust issue rate improved by ${Math.abs(report.trend.delta)}; preserve the controls that reduced failures.`
      : 'Trust issue rate is flat; continue monitoring and tighten controls only after sustained stability.'

  return [
    headline,
    `Channel: ${report.channel}`,
    '',
    '*Executive summary*',
    `- ${executiveSummary}`,
    `Current issue rate: ${report.current.issueRate}`,
    `Previous issue rate: ${report.previous.issueRate}`,
    `Delta: ${report.trend.delta}`,
    '',
    '*Recommended action*',
    `- ${report.recommendedAction}`,
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

  const runs = await getRunsSince(gh, WORKFLOW_ID, previousStart)
  const current = summarizeWindow(runs, currentStart, currentEnd)
  const previous = summarizeWindow(runs, previousStart, previousEnd)
  const trend = classifyTrend(current.issueRate, previous.issueRate)

  const recommendedAction = trend.label === 'worse'
    ? 'Issue rate worsened. Triage recurring trust-agent failures and fix the underlying parity/title/landmark regressions before tightening thresholds.'
    : trend.label === 'improving'
      ? 'Issue rate improved. Preserve current controls and document what reduced trust-agent failures.'
      : 'Trend is stable. Maintain cadence and review trust-agent failure clusters for early weak signals.'

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    currentWindow: { start: currentStart, end: currentEnd },
    previousWindow: { start: previousStart, end: previousEnd },
    current,
    previous,
    trend,
    recommendedAction,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  await postSlack(buildSlackText(report))
  console.log('Trust monthly trends report completed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
