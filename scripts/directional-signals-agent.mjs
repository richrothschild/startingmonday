#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'directional-signals.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'directional-signals.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'metrics---intelligence'

const TREND_THRESHOLD = 0.1 // 10% change threshold for inflection detection

function nowIso() {
  return new Date().toISOString()
}

function loadLatestAndPreviousReports(agentPattern) {
  const statusDir = path.join(process.cwd(), 'docs', 'status')
  const files = fs.readdirSync(statusDir).filter((f) => f.startsWith(agentPattern) && f.endsWith('.json')).sort()

  if (files.length === 0) return { latest: null, previous: null }

  const latest = files[files.length - 1]
  const previous = files.length > 1 ? files[files.length - 2] : null

  const latestData = JSON.parse(fs.readFileSync(path.join(statusDir, latest), 'utf8'))
  const previousData = previous ? JSON.parse(fs.readFileSync(path.join(statusDir, previous), 'utf8')) : null

  return { latest: latestData, previous: previousData }
}

function classifyTrend(current, previous) {
  if (previous === null) return 'baseline'
  if (typeof current !== 'number' || typeof previous !== 'number') return 'unknown'

  const percentChange = (current - previous) / previous
  const absPctChange = Math.abs(percentChange)

  if (absPctChange < TREND_THRESHOLD) return 'stable'
  if (percentChange > TREND_THRESHOLD) return 'declining'
  if (percentChange < -TREND_THRESHOLD) return 'improving'
  return 'stable'
}

function extractIssueCount(report) {
  if (report.totalIssues !== undefined) return report.totalIssues
  if (report.issues && Array.isArray(report.issues)) return report.issues.length
  if (report.findings && Array.isArray(report.findings)) return report.findings.length
  if (report.escalations && Array.isArray(report.escalations)) return report.escalations.length
  return 0
}

function calculateTrendDaysToFailure(currentCount, previousCount, budget = 100) {
  // Estimate days until issue count exceeds budget
  if (currentCount >= budget) return 0 // Already failed
  if (previousCount === null || previousCount === 0) return 999 // Unknown trend

  const dailyVelocity = (currentCount - previousCount) / 7 // Assume weekly snapshots
  if (dailyVelocity <= 0) return 999 // Improving, won't fail

  const daysToFailure = (budget - currentCount) / dailyVelocity
  return Math.max(0, Math.round(daysToFailure))
}

function analyzeRouteLevel(reports) {
  const routeMetrics = new Map()

  // Aggregate by route
  for (const report of reports) {
    if (report.issues) {
      for (const issue of report.issues) {
        const route = issue.route || 'unknown'
        if (!routeMetrics.has(route)) {
          routeMetrics.set(route, {
            route,
            total: 0,
            p0: 0,
            p1: 0,
            p2: 0,
          })
        }

        const metrics = routeMetrics.get(route)
        metrics.total++
        if (issue.severity === 'P0') metrics.p0++
        if (issue.severity === 'P1') metrics.p1++
        if (issue.severity === 'P2') metrics.p2++
      }
    }
  }

  return Array.from(routeMetrics.values())
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Directional Signals Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Category Trends')
  lines.push('')
  lines.push('| Category | Current | Previous | Trend | Days to Failure |')
  lines.push('|----------|---------|----------|-------|-----------------|')

  for (const [category, analysis] of Object.entries(report.categoryAnalysis || {})) {
    const trend = analysis.trend === 'improving' ? '📈' : analysis.trend === 'declining' ? '📉' : '➡️'
    const daysStr = analysis.daysToFailure >= 999 ? '∞' : String(analysis.daysToFailure)
    lines.push(
      `| ${category} | ${analysis.currentCount} | ${analysis.previousCount || '—'} | ${trend} ${analysis.trend} | ${daysStr} |`,
    )
  }
  lines.push('')

  lines.push('## Route Analysis')
  lines.push('')
  if (report.routeAnalysis && report.routeAnalysis.length > 0) {
    // Sort by total issues
    const sorted = report.routeAnalysis.sort((a, b) => b.total - a.total)

    for (const route of sorted.slice(0, 15)) {
      const status = route.p0 > 0 ? '🔴 P0' : route.p1 > 0 ? '🟠 P1' : '🟡 P2'
      lines.push(`- **${route.route}** [${status}]: ${route.total} issues (P0=${route.p0}, P1=${route.p1}, P2=${route.p2})`)
    }
  } else {
    lines.push('- No route-level issues tracked')
  }
  lines.push('')

  lines.push('## Inflection Points')
  lines.push('')
  const inflectionPoints = report.categoryAnalysis
    ? Object.entries(report.categoryAnalysis).filter(([_k, v]) => v.trend !== 'stable' && v.trend !== 'baseline')
    : []

  if (inflectionPoints.length > 0) {
    for (const [category, analysis] of inflectionPoints) {
      const direction = analysis.trend === 'improving' ? 'Improving' : 'Declining'
      const pctChange = analysis.previousCount
        ? Math.round(((analysis.currentCount - analysis.previousCount) / analysis.previousCount) * 100)
        : 0
      lines.push(`- **${category}**: ${direction} (${pctChange > 0 ? '+' : ''}${pctChange}% change)`)
    }
  } else {
    lines.push('- No significant inflection points detected')
  }
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  const decliningCount = inflectionPoints.filter(([_k, v]) => v.trend === 'declining').length
  if (decliningCount > 0) {
    lines.push(`⚠️ **${decliningCount} categories declining** — Investigate root causes immediately`)
  }
  const improvingCount = inflectionPoints.filter(([_k, v]) => v.trend === 'improving').length
  if (improvingCount > 0) {
    lines.push(`📈 **${improvingCount} categories improving** — Document and scale what's working`)
  }
  if (decliningCount === 0 && improvingCount === 0) {
    lines.push('✅ All categories stable — Continue current monitoring cadence')
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const categoryAnalysis = report.categoryAnalysis || {}
  const declining = Object.values(categoryAnalysis).filter((a) => a.trend === 'declining').length
  const improving = Object.values(categoryAnalysis).filter((a) => a.trend === 'improving').length

  const headline = declining > 0 ? `⚠️ ${declining} categories declining` : improving > 0 ? `📈 ${improving} categories improving` : '✅ All categories stable'

  const details = [declining > 0 ? `Declining: ${declining}` : null, improving > 0 ? `Improving: ${improving}` : null].filter(Boolean)

  return [
    headline,
    `Channel: ${report.channel}`,
    details.join(' | '),
    declining > 0 ? 'Action: Investigate root causes' : 'Status: On track',
  ].join('\n')
}

async function main() {
  const agents = ['experience-vitals', 'cognitive-load', 'trust-integrity', 'accessibility-sweep', 'mobile-responsive']

  const categoryAnalysis = {}
  const allReports = []

  for (const agent of agents) {
    const { latest, previous } = loadLatestAndPreviousReports(`${agent}.latest`)

    if (latest) {
      allReports.push(latest)

      const currentCount = extractIssueCount(latest)
      const previousCount = previous ? extractIssueCount(previous) : null
      const trend = classifyTrend(currentCount, previousCount)
      const daysToFailure = calculateTrendDaysToFailure(currentCount, previousCount || 0, 500) // Budget: 500 issues

      categoryAnalysis[agent] = {
        currentCount,
        previousCount: previousCount || null,
        trend,
        daysToFailure,
      }
    }
  }

  const routeAnalysis = analyzeRouteLevel(allReports)

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    categoryAnalysis,
    routeAnalysis,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  // Post to Slack if declining trends detected
  const declining = Object.values(categoryAnalysis).filter((a) => a.trend === 'declining').length
  if (declining > 0) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  console.log(`Directional signals analysis completed (${declining} declining, ${Object.values(categoryAnalysis).filter((a) => a.trend === 'improving').length} improving).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
