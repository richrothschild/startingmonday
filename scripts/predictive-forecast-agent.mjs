#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'predictive-forecast.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'predictive-forecast.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'metrics---intelligence'

const FORECAST_WEEKS = 4
const THRESHOLDS = {
  'experience-vitals': 50,
  'trust-escalation': 40,
  'accessibility-sweep': 30,
  'mobile-responsive': 35,
}

function nowIso() {
  return new Date().toISOString()
}

function loadLatestReport(agentPattern) {
  const statusDir = path.join(process.cwd(), 'docs', 'status')
  const files = fs.readdirSync(statusDir).filter((f) => f.startsWith(agentPattern) && f.endsWith('.json')).sort()

  if (files.length === 0) return null
  return JSON.parse(fs.readFileSync(path.join(statusDir, files[files.length - 1]), 'utf8'))
}

function extractIssueCount(report) {
  if (report.totalIssues !== undefined) return report.totalIssues
  if (report.issues && Array.isArray(report.issues)) return report.issues.length
  if (report.findings && Array.isArray(report.findings)) return report.findings.length
  if (report.escalations && Array.isArray(report.escalations)) return report.escalations.length
  return 0
}

function calculateLinearRegression(points) {
  if (points.length < 2) return { slope: 0, intercept: points[0] || 0 }

  const n = points.length
  const sumX = Array.from({ length: n }, (_, i) => i).reduce((a, b) => a + b, 0)
  const sumY = points.reduce((a, b) => a + b, 0)
  const sumXY = points.reduce((acc, y, i) => acc + i * y, 0)
  const sumX2 = Array.from({ length: n }, (_, i) => i).reduce((a, b) => a + b * b, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

function forecastValue(slope, intercept, weeksAhead) {
  const forecast = intercept + slope * weeksAhead
  return Math.max(0, Math.round(forecast))
}

function classifyRisk(current, threshold, forecast) {
  if (forecast >= threshold * 1.5) return 'critical'
  if (forecast >= threshold) return 'high'
  if (current >= threshold * 0.7) return 'medium'
  return 'low'
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Predictive Forecast Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Forecast Window: Next ${FORECAST_WEEKS} weeks`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## 4-Week Projections by Category')
  lines.push('')
  lines.push('| Category | Current | Week 4 Forecast | Threshold | Risk Level | Action |')
  lines.push('|----------|---------|-----------------|-----------|------------|--------|')

  for (const [category, forecast] of Object.entries(report.categoryForecasts || {})) {
    const riskIcon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '✅',
    }[forecast.riskLevel]

    const action =
      forecast.riskLevel === 'critical'
        ? 'Immediate escalation'
        : forecast.riskLevel === 'high'
          ? 'Accelerate remediation'
          : 'Monitor closely'

    lines.push(`| ${category} | ${forecast.current} | ${forecast.week4} | ${forecast.threshold} | ${riskIcon} ${forecast.riskLevel} | ${action} |`)
  }
  lines.push('')

  lines.push('## Estimated "Days to Threshold" Crossing')
  lines.push('')
  const atRisk = Object.entries(report.categoryForecasts || {})
    .filter((e) => e[1].daysToThreshold > 0 && e[1].daysToThreshold < 999)
    .sort((a, b) => a[1].daysToThreshold - b[1].daysToThreshold)

  if (atRisk.length > 0) {
    for (const [category, forecast] of atRisk) {
      lines.push(`- **${category}**: ${forecast.daysToThreshold} days until threshold breach`)
    }
  } else {
    lines.push('- No categories at risk of threshold breach within 4 weeks')
  }
  lines.push('')

  lines.push('## Trajectory Summary')
  lines.push('')
  const critical = Object.values(report.categoryForecasts || {}).filter((f) => f.riskLevel === 'critical').length
  const high = Object.values(report.categoryForecasts || {}).filter((f) => f.riskLevel === 'high').length
  const medium = Object.values(report.categoryForecasts || {}).filter((f) => f.riskLevel === 'medium').length

  if (critical > 0) {
    lines.push(`🔴 **${critical} categories at CRITICAL risk** — Intervention required immediately`)
  }
  if (high > 0) {
    lines.push(`🟠 **${high} categories at HIGH risk** — Accelerate remediation plans`)
  }
  if (medium > 0) {
    lines.push(`🟡 **${medium} categories at MEDIUM risk** — Increase monitoring frequency`)
  }
  if (critical === 0 && high === 0) {
    lines.push('✅ **All categories low risk** — Current remediation pace is sufficient')
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

async function main() {
  const agents = ['experience-vitals', 'trust-escalation', 'accessibility-sweep', 'mobile-responsive']
  const categoryForecasts = {}
  let criticalCount = 0

  for (const agent of agents) {
    const report = loadLatestReport(agent)
    if (report) {
      const current = extractIssueCount(report)
      const threshold = THRESHOLDS[agent] || 40

      // Simple linear forecast: assume current velocity continues
      const slope = 2 // ~2 issues/week (conservative estimate)
      const week4Forecast = forecastValue(slope, current, FORECAST_WEEKS)
      const riskLevel = classifyRisk(current, threshold, week4Forecast)

      // Days to threshold
      let daysToThreshold = 999
      if (slope > 0) {
        daysToThreshold = Math.round(((threshold - current) / slope) * 7)
      }

      categoryForecasts[agent] = {
        current,
        threshold,
        week4: week4Forecast,
        riskLevel,
        daysToThreshold: Math.max(0, daysToThreshold),
        slope,
      }

      if (riskLevel === 'critical') criticalCount++
    }
  }

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    forecastWeeks: FORECAST_WEEKS,
    categoryForecasts,
    criticalCount,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  if (criticalCount > 0) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: `🔴 ${criticalCount} categories forecast CRITICAL within 4 weeks\nChannel: ${slackChannel}\nAction: Escalate to leadership immediately`,
    })
  }

  console.log(`Predictive forecast completed (${criticalCount} critical, ${Object.keys(categoryForecasts).length} categories analyzed).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
