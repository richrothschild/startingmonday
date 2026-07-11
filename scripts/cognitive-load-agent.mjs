#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'
const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-load.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-load.latest.md')

function gradeForIssueCount(issueCount) {
  if (issueCount <= 1) return 'A-'
  if (issueCount <= 2) return 'B+'
  if (issueCount <= 3) return 'B'
  if (issueCount <= 4) return 'C+'
  return 'C'
}

function classifyTier(route) {
  if (route.startsWith('/dashboard')) return 'dashboard'
  if (route === '/' || route.startsWith('/pricing') || route.startsWith('/demo') || route.startsWith('/blog') || route.startsWith('/method-and-evidence') || route.startsWith('/signup')) {
    return 'funnel'
  }
  return 'public'
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Cognitive Load Agent Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Pages scanned: ${report.totalPages}`)
  lines.push(`Pages with issues: ${report.pagesWithIssues}`)
  lines.push(`Total issues: ${report.totalIssues}`)
  lines.push('')
  lines.push('## Tier Summary')
  lines.push('')
  for (const [tier, summary] of Object.entries(report.byTier)) {
    lines.push(`- ${tier}: pages=${summary.pages}, issues=${summary.issues}, avgIssueCount=${summary.avgIssueCount}, worstGrade=${summary.worstGrade}`)
  }
  lines.push('')
  lines.push('## Top Findings')
  lines.push('')
  for (const row of report.topFindings) {
    lines.push(`- ${row.route}: grade=${row.grade}, issues=${row.issueCount}`)
    for (const issue of row.issues) lines.push(`  - ${issue}`)
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.pagesWithIssues === 0
    ? '*Cognitive load agent: no issues detected*'
    : `*Cognitive load agent: ${report.pagesWithIssues} page(s) with issues*`

  const tierLines = Object.entries(report.byTier).map(([tier, summary]) => {
    return `- ${tier}: pages=${summary.pages}, issues=${summary.issues}, worstGrade=${summary.worstGrade}`
  })

  const topLines = report.topFindings.slice(0, 8).map((row) => `- ${row.route}: ${row.issueCount} issue(s), grade ${row.grade}`)

  return [
    headline,
    `Channel: ${report.channel}`,
    `Pages scanned: ${report.totalPages}`,
    '',
    '*Tier summary*',
    ...tierLines,
    '',
    '*Top findings*',
    ...(topLines.length > 0 ? topLines : ['- None']),
  ].join('\n')
}

async function main() {
  const raw = execFileSync(process.execPath, ['scripts/check-cognitive-load-all-pages.mjs', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })

  const parsed = JSON.parse(raw)
  const pages = (parsed.pages ?? []).map((row) => ({
    ...row,
    tier: classifyTier(row.route),
    grade: gradeForIssueCount(row.issueCount ?? 0),
  }))

  const byTier = {}
  for (const row of pages) {
    if (!byTier[row.tier]) {
      byTier[row.tier] = { pages: 0, issues: 0, avgIssueCount: 0, worstGrade: 'A-' }
    }
    byTier[row.tier].pages += 1
    byTier[row.tier].issues += row.issueCount
    const grades = ['A-', 'B+', 'B', 'C+', 'C']
    if (grades.indexOf(row.grade) > grades.indexOf(byTier[row.tier].worstGrade)) {
      byTier[row.tier].worstGrade = row.grade
    }
  }

  for (const summary of Object.values(byTier)) {
    summary.avgIssueCount = summary.pages === 0 ? 0 : Number((summary.issues / summary.pages).toFixed(2))
  }

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    totalPages: parsed.totalPages ?? pages.length,
    pagesWithIssues: parsed.pagesWithIssues ?? 0,
    totalIssues: parsed.totalIssues ?? 0,
    byTier,
    topFindings: pages
      .filter((row) => row.issueCount > 0)
      .sort((a, b) => b.issueCount - a.issueCount || a.route.localeCompare(b.route))
      .slice(0, 20),
    pages,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  const posted = await postSlackText({ webhookUrl: slackWebhook, text: buildSlackText(report) })
  if (!posted) console.log('No Slack webhook configured; skipping Slack post.')

  console.log(`Cognitive load agent completed (${report.totalPages} pages, ${report.totalIssues} issues).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
