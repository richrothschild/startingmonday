#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'
const branch = process.env.SEEDING_REF || 'main'
const dryRun = process.env.SEEDING_DRY_RUN === 'true'

const workflows = [
  'route-inventory-agent.yml',
  'trust-integrity-agent.yml',
  'experience-vitals-agent.yml',
  'cognitive-load-agent.yml',
  'experience-portfolio-rollup.yml',
  'experience-weekly-issues-report.yml',
  'experience-monthly-trends-report.yml',
  'cognitive-calibration-loop.yml',
]

function dispatchWorkflow(workflow, ref) {
  if (dryRun) {
    return {
      workflow,
      ref,
      dispatched: false,
      runUrl: null,
      runId: null,
      status: 'dry-run',
      error: null,
    }
  }

  try {
    const output = execFileSync('gh', ['workflow', 'run', workflow, '--ref', ref], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: { ...process.env, GH_PAGER: 'cat' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+\/actions\/runs\/(\d+)/)
    return {
      workflow,
      ref,
      dispatched: true,
      runUrl: urlMatch ? urlMatch[0] : null,
      runId: urlMatch ? Number(urlMatch[1]) : null,
      status: 'dispatched',
      error: null,
    }
  } catch (error) {
    return {
      workflow,
      ref,
      dispatched: false,
      runUrl: null,
      runId: null,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Experience Seeding Checklist')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Branch: ${report.ref}`)
  lines.push(`Dry run: ${report.dryRun}`)
  lines.push(`Dispatched: ${report.summary.dispatched}`)
  lines.push(`Failures: ${report.summary.failures}`)
  lines.push('')
  lines.push('## Workflow dispatch results')
  lines.push('')
  for (const row of report.results) {
    const suffix = row.runUrl ? ` (${row.runUrl})` : ''
    lines.push(`- ${row.workflow}: ${row.status}${suffix}`)
    if (row.error) lines.push(`  Error: ${row.error}`)
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.summary.failures > 0
    ? '*Experience seeding checklist completed with failures*'
    : '*Experience seeding checklist completed*'
  const rows = report.results.map((row) => {
    const runPart = row.runId ? ` run=${row.runId}` : ''
    return `- ${row.workflow}: ${row.status}${runPart}`
  })

  return [
    headline,
    `Channel: ${report.channel}`,
    `Branch: ${report.ref}`,
    `Dry run: ${report.dryRun}`,
    `Dispatched: ${report.summary.dispatched}`,
    `Failures: ${report.summary.failures}`,
    '',
    '*Results*',
    ...rows,
  ].join('\n')
}

async function main() {
  const results = workflows.map((workflow) => dispatchWorkflow(workflow, branch))
  const dispatched = results.filter((row) => row.status === 'dispatched').length
  const failures = results.filter((row) => row.status === 'failed').length

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    ref: branch,
    dryRun,
    summary: {
      total: workflows.length,
      dispatched,
      failures,
    },
    results,
  }

  writeLatestReportFiles({
    jsonPath: 'docs/status/experience-seeding-checklist.latest.json',
    markdownPath: 'docs/status/experience-seeding-checklist.latest.md',
    report,
    markdown: buildMarkdown(report),
  })

  const posted = await postSlackText({ webhookUrl: slackWebhook, text: buildSlackText(report) })
  if (!posted) console.log('No Slack webhook configured; skipping Slack post.')

  if (failures > 0) {
    console.error(`Seeding checklist completed with ${failures} dispatch failure(s).`)
    process.exit(1)
  }

  console.log(`Seeding checklist completed (${dispatched}/${workflows.length} dispatched).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
