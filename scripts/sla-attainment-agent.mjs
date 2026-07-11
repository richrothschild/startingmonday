#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'sla-attainment.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'sla-attainment.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'metrics---intelligence'

// SLA definitions per SES
const SLA_DEFINITIONS = {
  P0: { minutes: 60, emoji: '🚨' }, // P0: 1 hour
  P1: { minutes: 240, emoji: '⚠️' }, // P1: 4 hours
  P2: { minutes: 1440, emoji: '🟡' }, // P2: 24 hours
}

function nowIso() {
  return new Date().toISOString()
}

function loadEscalationFindings() {
  const escalationPath = path.join(process.cwd(), 'docs', 'status', 'trust-escalation.latest.json')
  if (!fs.existsSync(escalationPath)) return []

  try {
    const data = JSON.parse(fs.readFileSync(escalationPath, 'utf8'))
    return data.escalations || []
  } catch (error) {
    console.warn('Escalation load failed:', error instanceof Error ? error.message : String(error))
    return []
  }
}

function calculateTeamMetrics(escalations) {
  const teamStats = new Map()

  for (const escalation of escalations) {
    const team = escalation.team || 'unknown'
    if (!teamStats.has(team)) {
      teamStats.set(team, {
        team,
        total: 0,
        p0: 0,
        p1: 0,
        p2: 0,
        overdue: 0,
        resolved: 0,
      })
    }

    const stats = teamStats.get(team)
    stats.total++

    if (escalation.severity === 'P0') stats.p0++
    if (escalation.severity === 'P1') stats.p1++
    if (escalation.severity === 'P2') stats.p2++

    // Check SLA
    if (escalation.ttlMinutes && escalation.ttlMinutes < 0) {
      stats.overdue++
    }
  }

  return Array.from(teamStats.values())
}

function calculateSLAAttainment(escalations) {
  const results = {
    p0: { total: 0, onTime: 0, overdue: 0, attainment: 0 },
    p1: { total: 0, onTime: 0, overdue: 0, attainment: 0 },
    p2: { total: 0, onTime: 0, overdue: 0, attainment: 0 },
    overall: { total: 0, onTime: 0, overdue: 0, attainment: 0 },
  }

  for (const escalation of escalations) {
    const severity = escalation.severity || 'P2'
    results[severity].total++
    results.overall.total++

    const isOverdue = escalation.ttlMinutes && escalation.ttlMinutes < 0
    if (isOverdue) {
      results[severity].overdue++
      results.overall.overdue++
    } else {
      results[severity].onTime++
      results.overall.onTime++
    }
  }

  // Calculate percentages
  for (const level of ['p0', 'p1', 'p2', 'overall']) {
    if (results[level].total > 0) {
      results[level].attainment = Math.round((results[level].onTime / results[level].total) * 100)
    }
  }

  return results
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# SLA Attainment Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Overall SLA Performance')
  lines.push('')
  const overall = report.slaMetrics.overall
  lines.push(`**On-Time Rate: ${overall.attainment}%** (${overall.onTime}/${overall.total})`)
  if (overall.overdue > 0) {
    lines.push(`**Overdue Issues: ${overall.overdue}** ⚠️`)
  }
  lines.push('')

  lines.push('## By Severity')
  lines.push('')
  lines.push('| Severity | Total | On-Time | Overdue | Attainment |')
  lines.push('|----------|-------|---------|---------|-----------|')

  for (const level of ['p0', 'p1', 'p2']) {
    const metric = report.slaMetrics[level]
    const status = metric.attainment >= 90 ? '✅' : metric.attainment >= 70 ? '🟡' : '🔴'
    lines.push(`| ${level.toUpperCase()} | ${metric.total} | ${metric.onTime} | ${metric.overdue} | ${status} ${metric.attainment}% |`)
  }
  lines.push('')

  lines.push('## By Team')
  lines.push('')
  if (report.teamMetrics && report.teamMetrics.length > 0) {
    lines.push('| Team | Total | P0 | P1 | P2 | Overdue |')
    lines.push('|------|-------|----|----|----|----|')

    for (const team of report.teamMetrics) {
      const overdueStr = team.overdue > 0 ? `${team.overdue} ⚠️` : '—'
      lines.push(`| ${team.team} | ${team.total} | ${team.p0} | ${team.p1} | ${team.p2} | ${overdueStr} |`)
    }
  } else {
    lines.push('- No escalations tracked yet')
  }
  lines.push('')

  lines.push('## SLA Definitions')
  lines.push('')
  lines.push('| Severity | Target | Status |')
  lines.push('|----------|--------|--------|')
  for (const [severity, def] of Object.entries(SLA_DEFINITIONS)) {
    lines.push(`| ${severity} | ${def.minutes}min (${(def.minutes / 60).toFixed(1)}h) | ${def.emoji} |`)
  }
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  if (report.slaMetrics.overall.attainment >= 90) {
    lines.push('✅ **SLA Performance Excellent** — On-time rate above 90%')
  } else if (report.slaMetrics.overall.attainment >= 70) {
    lines.push('🟡 **SLA Performance Fair** — 70-89% on-time; review team capacity')
  } else {
    lines.push('🔴 **SLA Performance Poor** — Below 70%; escalate staffing or triage rules')
  }
  lines.push('')
  if (report.slaMetrics.p0.overdue > 0) {
    lines.push(`⚠️ **CRITICAL**: ${report.slaMetrics.p0.overdue} P0 issues overdue — Immediate action required`)
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const overall = report.slaMetrics.overall
  const performanceEmoji = overall.attainment >= 90 ? '✅' : overall.attainment >= 70 ? '🟡' : '🔴'

  const headline = `${performanceEmoji} SLA Attainment: ${overall.attainment}% (${overall.onTime}/${overall.total})`

  const details = [
    `P0: ${report.slaMetrics.p0.attainment}%`,
    `P1: ${report.slaMetrics.p1.attainment}%`,
    `P2: ${report.slaMetrics.p2.attainment}%`,
  ]

  if (report.slaMetrics.overall.overdue > 0) {
    details.push(`Overdue: ${report.slaMetrics.overall.overdue}`)
  }

  return [
    headline,
    `Channel: ${report.channel}`,
    details.join(' | '),
    report.slaMetrics.overall.attainment < 70 ? 'Status: Review required' : 'Status: On track',
  ].join('\n')
}

async function main() {
  const escalations = loadEscalationFindings()
  const slaMetrics = calculateSLAAttainment(escalations)
  const teamMetrics = calculateTeamMetrics(escalations)

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    totalEscalations: escalations.length,
    slaMetrics,
    teamMetrics: teamMetrics.sort((a, b) => b.total - a.total),
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  // Post to Slack if SLA attainment is below 80%
  if (slaMetrics.overall.attainment < 80) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  console.log(`SLA attainment report completed (${slaMetrics.overall.attainment}% on-time, ${slaMetrics.overall.overdue} overdue).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
