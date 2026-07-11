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

function fluencyScoreForMetrics(metrics) {
  let score = 100
  const avgSentenceWords = metrics?.avgSentenceWords ?? 0
  const headingCount = metrics?.headingCount ?? 0
  const paragraphCount = metrics?.paragraphCount ?? 0
  const ctaCount = metrics?.ctaCount ?? 0
  const longParagraphCount = metrics?.longParagraphCount ?? 0

  if (avgSentenceWords > 16) score -= Math.min(30, (avgSentenceWords - 16) * 3)
  if (headingCount === 0 && paragraphCount > 4) score -= 18
  if (headingCount > 0 && paragraphCount / headingCount > 10) score -= 12
  if (ctaCount > 12) score -= Math.min(15, (ctaCount - 12) * 1.5)
  if (longParagraphCount > 3) score -= Math.min(20, (longParagraphCount - 3) * 4)

  return Math.max(0, Math.round(score))
}

function gradeForFluencyScore(score) {
  if (score >= 90) return 'A-'
  if (score >= 80) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C+'
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
    lines.push(`- ${tier}: pages=${summary.pages}, issues=${summary.issues}, avgIssueCount=${summary.avgIssueCount}, worstLoadGrade=${summary.worstGrade}, avgFluencyScore=${summary.avgFluencyScore}, worstFluencyGrade=${summary.worstFluencyGrade}`)
  }
  lines.push('')
  lines.push('## Top Findings')
  lines.push('')
  for (const row of report.topFindings) {
    lines.push(`- ${row.route}: loadGrade=${row.grade}, fluencyGrade=${row.fluency.grade}, fluencyScore=${row.fluency.score}, issues=${row.issueCount}`)
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
    return `- ${tier}: pages=${summary.pages}, issues=${summary.issues}, worstLoadGrade=${summary.worstGrade}, worstFluencyGrade=${summary.worstFluencyGrade}`
  })

  const topLines = report.topFindings.slice(0, 8).map((row) => `- ${row.route}: ${row.issueCount} issue(s), load ${row.grade}, fluency ${row.fluency.grade} (${row.fluency.score})`)

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
    fluency: {
      score: fluencyScoreForMetrics(row.metrics ?? {}),
      grade: gradeForFluencyScore(fluencyScoreForMetrics(row.metrics ?? {})),
    },
  }))

  const byTier = {}
  for (const row of pages) {
    if (!byTier[row.tier]) {
      byTier[row.tier] = { pages: 0, issues: 0, avgIssueCount: 0, avgFluencyScore: 0, worstGrade: 'A-', worstFluencyGrade: 'A-' }
    }
    byTier[row.tier].pages += 1
    byTier[row.tier].issues += row.issueCount
    byTier[row.tier].avgFluencyScore += row.fluency.score
    const grades = ['A-', 'B+', 'B', 'C+', 'C']
    if (grades.indexOf(row.grade) > grades.indexOf(byTier[row.tier].worstGrade)) {
      byTier[row.tier].worstGrade = row.grade
    }
    if (grades.indexOf(row.fluency.grade) > grades.indexOf(byTier[row.tier].worstFluencyGrade)) {
      byTier[row.tier].worstFluencyGrade = row.fluency.grade
    }
  }

  for (const summary of Object.values(byTier)) {
    summary.avgIssueCount = summary.pages === 0 ? 0 : Number((summary.issues / summary.pages).toFixed(2))
    summary.avgFluencyScore = summary.pages === 0 ? 0 : Number((summary.avgFluencyScore / summary.pages).toFixed(1))
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
