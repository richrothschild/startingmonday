#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'historical-trends.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'historical-trends.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'metrics---intelligence'

const WINDOW_WEEKS = 4

function nowIso() {
  return new Date().toISOString()
}

function getHistoricalSnapshots(agentPattern) {
  const statusDir = path.join(process.cwd(), 'docs', 'status')
  if (!fs.existsSync(statusDir)) return []

  const files = fs
    .readdirSync(statusDir)
    .filter((f) => f.startsWith(agentPattern) && f.endsWith('.json'))
    .sort()
    .slice(-WINDOW_WEEKS) // Last 4 weeks

  return files.map((file) => {
    const content = JSON.parse(fs.readFileSync(path.join(statusDir, file), 'utf8'))
    const timestamp = content.generatedAt || nowIso()
    return { file, timestamp, content }
  })
}

function extractIssueCount(report) {
  if (report.totalIssues !== undefined) return report.totalIssues
  if (report.issues && Array.isArray(report.issues)) return report.issues.length
  if (report.findings && Array.isArray(report.findings)) return report.findings.length
  if (report.escalations && Array.isArray(report.escalations)) return report.escalations.length
  return 0
}

function calculateMovingAverage(snapshots) {
  if (snapshots.length === 0) return null

  const sum = snapshots.reduce((acc, s) => acc + s.count, 0)
  return Math.round(sum / snapshots.length)
}

function calculateVelocity(snapshots) {
  if (snapshots.length < 2) return 0

  const first = snapshots[0].count
  const last = snapshots[snapshots.length - 1].count
  const deltaPerWeek = (last - first) / (snapshots.length - 1)

  return Math.round(deltaPerWeek * 10) / 10
}

function calculateTrendLine(snapshots) {
  if (snapshots.length < 2) return 'flat'

  const velocity = calculateVelocity(snapshots)
  const threshold = 0.5

  if (velocity > threshold) return 'accelerating'
  if (velocity < -threshold) return 'decelerating'
  return 'flat'
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Historical Trends Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Window: Last ${WINDOW_WEEKS} weeks`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Category Trends (4-Week Analysis)')
  lines.push('')
  lines.push('| Category | Current | Avg | Velocity | Trend | Direction |')
  lines.push('|----------|---------|-----|----------|-------|-----------|')

  for (const [category, analysis] of Object.entries(report.categoryTrends || {})) {
    const trend = {
      accelerating: '📈',
      decelerating: '📉',
      flat: '➡️',
    }[analysis.trendLine]
    const direction = {
      accelerating: 'Getting worse',
      decelerating: 'Getting better',
      flat: 'Stable',
    }[analysis.trendLine]
    const velocity = analysis.velocity >= 0 ? `+${analysis.velocity}` : String(analysis.velocity)
    lines.push(`| ${category} | ${analysis.current} | ${analysis.movingAverage} | ${velocity}/wk | ${trend} | ${direction} |`)
  }
  lines.push('')

  lines.push('## Velocity by Severity (Last 4 weeks)')
  lines.push('')
  if (report.severityVelocity) {
    lines.push(`- **P0 Velocity**: ${report.severityVelocity.p0 >= 0 ? '+' : ''}${report.severityVelocity.p0}/week`)
    lines.push(`- **P1 Velocity**: ${report.severityVelocity.p1 >= 0 ? '+' : ''}${report.severityVelocity.p1}/week`)
    lines.push(`- **P2 Velocity**: ${report.severityVelocity.p2 >= 0 ? '+' : ''}${report.severityVelocity.p2}/week`)
  }
  lines.push('')

  lines.push('## Risk Trajectory')
  lines.push('')
  const accelerating = Object.values(report.categoryTrends || {}).filter((t) => t.trendLine === 'accelerating').length
  const decelerating = Object.values(report.categoryTrends || {}).filter((t) => t.trendLine === 'decelerating').length

  if (accelerating > 0) {
    lines.push(`⚠️ **${accelerating} categories accelerating** — Issues increasing week-over-week`)
  }
  if (decelerating > 0) {
    lines.push(`✅ **${decelerating} categories decelerating** — Issues decreasing week-over-week`)
  }
  if (accelerating === 0 && decelerating === 0) {
    lines.push('➡️ **All categories flat** — Consistent issue count week-over-week')
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

async function main() {
  const agents = ['experience-vitals', 'trust-escalation', 'accessibility-sweep', 'mobile-responsive']

  const categoryTrends = {}
  let totalSnapshots = 0

  for (const agent of agents) {
    const snapshots = getHistoricalSnapshots(`${agent}.latest`)

    if (snapshots.length > 0) {
      const countSnapshots = snapshots.map((s) => ({
        count: extractIssueCount(s.content),
        timestamp: s.timestamp,
      }))

      const current = countSnapshots[countSnapshots.length - 1].count
      const movingAverage = calculateMovingAverage(countSnapshots)
      const velocity = calculateVelocity(countSnapshots)
      const trendLine = calculateTrendLine(countSnapshots)

      categoryTrends[agent] = {
        current,
        movingAverage,
        velocity,
        trendLine,
        snapshotCount: countSnapshots.length,
      }

      totalSnapshots = Math.max(totalSnapshots, countSnapshots.length)
    }
  }

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    windowWeeks: WINDOW_WEEKS,
    categoryTrends,
    snapshotsAvailable: totalSnapshots,
    severityVelocity: {
      p0: 0,
      p1: 0,
      p2: 0,
    },
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  const accelerating = Object.values(categoryTrends).filter((t) => t.trendLine === 'accelerating').length
  if (accelerating > 0) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: `⚠️ ${accelerating} categories accelerating\nChannel: ${slackChannel}\nAction: Review root causes and implement mitigation`,
    })
  }

  console.log(`Historical trends analyzed (${totalSnapshots} snapshots, ${accelerating} accelerating).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
