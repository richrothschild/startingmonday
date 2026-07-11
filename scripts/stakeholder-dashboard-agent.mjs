#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'stakeholder-dashboard.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'stakeholder-dashboard.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_EXECUTIVE_CHANNEL || 'metrics---intelligence'

function nowIso() {
  return new Date().toISOString()
}

function loadLatestReport(agentPattern) {
  const statusDir = path.join(process.cwd(), 'docs', 'status')
  const files = fs.readdirSync(statusDir).filter((f) => f.startsWith(agentPattern) && f.endsWith('.json')).sort()

  if (files.length === 0) return null

  const latest = files[files.length - 1]
  return JSON.parse(fs.readFileSync(path.join(statusDir, latest), 'utf8'))
}

function aggregateVitals(vitalsReport) {
  if (!vitalsReport) return { p0: 0, p1: 0, p2: 0, total: 0, status: 'unknown' }

  const tiers = vitalsReport.tiers || []
  let p0 = 0,
    p1 = 0,
    p2 = 0

  for (const tier of tiers) {
    const violations = tier.violations || []
    for (const v of violations) {
      if (v.severity === 'P0') p0++
      else if (v.severity === 'P1') p1++
      else p2++
    }
  }

  const total = p0 + p1 + p2
  const status = p0 > 0 ? 'critical' : p1 > 0 ? 'degraded' : p2 > 0 ? 'caution' : 'healthy'
  return { p0, p1, p2, total, status }
}

function aggregateTrust(trustReport) {
  if (!trustReport) return { p0: 0, p1: 0, p2: 0, total: 0, status: 'unknown' }

  const escalations = trustReport.escalations || []
  let p0 = 0,
    p1 = 0,
    p2 = 0

  for (const e of escalations) {
    if (e.severity === 'P0') p0++
    else if (e.severity === 'P1') p1++
    else p2++
  }

  const total = p0 + p1 + p2
  const status = p0 > 0 ? 'critical' : p1 > 0 ? 'degraded' : p2 > 0 ? 'caution' : 'healthy'
  return { p0, p1, p2, total, status }
}

function aggregateAccessibility(a11yReport) {
  if (!a11yReport) return { p0: 0, p1: 0, p2: 0, total: 0, status: 'unknown' }

  const issues = a11yReport.issues || []
  let p0 = 0,
    p1 = 0,
    p2 = 0

  for (const issue of issues) {
    if (issue.severity === 'P0') p0++
    else if (issue.severity === 'P1') p1++
    else p2++
  }

  const total = p0 + p1 + p2
  const status = p0 > 0 ? 'critical' : p1 > 0 ? 'degraded' : p2 > 0 ? 'caution' : 'healthy'
  return { p0, p1, p2, total, status }
}

function aggregateMobile(mobileReport) {
  if (!mobileReport) return { p0: 0, p1: 0, p2: 0, total: 0, status: 'unknown' }

  const issues = mobileReport.issues || []
  let p0 = 0,
    p1 = 0,
    p2 = 0

  for (const issue of issues) {
    if (issue.severity === 'P0') p0++
    else if (issue.severity === 'P1') p1++
    else p2++
  }

  const total = p0 + p1 + p2
  const status = p0 > 0 ? 'critical' : p1 > 0 ? 'degraded' : p2 > 0 ? 'caution' : 'healthy'
  return { p0, p1, p2, total, status }
}

function extractTopOverdueIssues(trustReport, coachingReport) {
  const topIssues = []

  if (trustReport && trustReport.escalations) {
    for (const e of trustReport.escalations.slice(0, 10)) {
      const createdTime = new Date(e.createdAt || nowIso()).getTime()
      const nowTime = Date.now()
      const hoursOld = (nowTime - createdTime) / (1000 * 60 * 60)

      const slaDuration = { P0: 1, P1: 4, P2: 24 }[e.severity || 'P2'] || 24
      const isOverdue = hoursOld > slaDuration

      topIssues.push({
        id: e.id || 'unknown',
        severity: e.severity || 'P2',
        team: e.assignedTeam || 'unassigned',
        contract: e.contractType || 'unknown',
        hoursOld: Math.round(hoursOld),
        isOverdue,
      })
    }
  }

  return topIssues.slice(0, 10)
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Stakeholder Dashboard')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Executive Summary')
  lines.push('')
  const healthIcon = {
    critical: '🔴',
    degraded: '🟠',
    caution: '🟡',
    healthy: '✅',
  }
  const overallStatus = [
    report.vitalsStatus,
    report.trustStatus,
    report.a11yStatus,
    report.mobileStatus,
  ].find((s) => s === 'critical') || [report.vitalsStatus, report.trustStatus, report.a11yStatus, report.mobileStatus].find((s) => s === 'degraded') || 'healthy'

  lines.push(`**Overall Health**: ${healthIcon[overallStatus]} ${overallStatus.toUpperCase()}`)
  lines.push('')
  lines.push(`- P0 Violations: ${report.totalP0} (${report.totalP0 > 0 ? '🔴 CRITICAL' : '✅ none'})`)
  lines.push(`- P1 Violations: ${report.totalP1} (${report.totalP1 > 5 ? '🟠 HIGH' : report.totalP1 > 0 ? '🟡 MEDIUM' : '✅ none'})`)
  lines.push(`- P2 Violations: ${report.totalP2}`)
  lines.push(`- Overdue Issues: ${report.overdueCount} (${report.overdueCount > 0 ? '⏰ ACTION REQUIRED' : '✅ on track'})`)
  lines.push('')

  lines.push('## Category Breakdown')
  lines.push('')
  lines.push('| Category | Status | P0 | P1 | P2 | Total |')
  lines.push('|----------|--------|----|----|-----|-------|')
  lines.push(`| Core Web Vitals | ${healthIcon[report.vitalsStatus]} | ${report.vitalsMetrics.p0} | ${report.vitalsMetrics.p1} | ${report.vitalsMetrics.p2} | ${report.vitalsMetrics.total} |`)
  lines.push(`| Trust & Integrity | ${healthIcon[report.trustStatus]} | ${report.trustMetrics.p0} | ${report.trustMetrics.p1} | ${report.trustMetrics.p2} | ${report.trustMetrics.total} |`)
  lines.push(`| Accessibility | ${healthIcon[report.a11yStatus]} | ${report.a11yMetrics.p0} | ${report.a11yMetrics.p1} | ${report.a11yMetrics.p2} | ${report.a11yMetrics.total} |`)
  lines.push(`| Mobile Experience | ${healthIcon[report.mobileStatus]} | ${report.mobileMetrics.p0} | ${report.mobileMetrics.p1} | ${report.mobileMetrics.p2} | ${report.mobileMetrics.total} |`)
  lines.push('')

  lines.push('## Top 10 Overdue Issues')
  lines.push('')
  if (report.topOverdueIssues.length > 0) {
    for (const issue of report.topOverdueIssues) {
      const overdueLabel = issue.isOverdue ? '⏰ OVERDUE' : '✅ on-time'
      lines.push(`- **[${issue.severity}] ${issue.id}** (${issue.team}): ${issue.hoursOld}h old [${overdueLabel}]`)
      lines.push(`  Contract: ${issue.contract}`)
    }
  } else {
    lines.push('- No critical issues tracked')
  }
  lines.push('')

  lines.push('## Recommended Actions')
  lines.push('')
  if (report.totalP0 > 0) {
    lines.push(`🔴 **CRITICAL**: ${report.totalP0} P0 violations require immediate executive escalation`)
  }
  if (report.overdueCount > 0) {
    lines.push(`⏰ **ACTION**: ${report.overdueCount} issues are overdue SLA — escalate to team leads`)
  }
  if (report.totalP1 > 5) {
    lines.push('🟠 **HIGH PRIORITY**: Review P1 backlog and prioritize high-impact fixes')
  }
  if (report.totalP0 === 0 && report.overdueCount === 0) {
    lines.push('✅ **STATUS**: All categories healthy — continue current pace')
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const healthIcon = report.totalP0 > 0 ? '🔴' : report.totalP1 > 5 ? '🟠' : '✅'
  const headline = report.totalP0 > 0 ? 'P0 VIOLATIONS' : report.overdueCount > 0 ? 'SLA OVERAGES' : 'All Healthy'

  return [
    `${healthIcon} ${headline}`,
    `P0=${report.totalP0} P1=${report.totalP1} P2=${report.totalP2}`,
    `Overdue=${report.overdueCount}`,
    report.totalP0 > 0 ? 'Action: Executive escalation required' : 'Status: On track',
  ].join('\n')
}

async function main() {
  const vitalsReport = loadLatestReport('experience-vitals')
  const trustReport = loadLatestReport('trust-escalation')
  const a11yReport = loadLatestReport('accessibility-sweep')
  const mobileReport = loadLatestReport('mobile-responsive')
  const coachingReport = loadLatestReport('team-coaching')

  const vitalsMetrics = aggregateVitals(vitalsReport)
  const trustMetrics = aggregateTrust(trustReport)
  const a11yMetrics = aggregateAccessibility(a11yReport)
  const mobileMetrics = aggregateMobile(mobileReport)

  const totalP0 = vitalsMetrics.p0 + trustMetrics.p0 + a11yMetrics.p0 + mobileMetrics.p0
  const totalP1 = vitalsMetrics.p1 + trustMetrics.p1 + a11yMetrics.p1 + mobileMetrics.p1
  const totalP2 = vitalsMetrics.p2 + trustMetrics.p2 + a11yMetrics.p2 + mobileMetrics.p2

  const topOverdueIssues = extractTopOverdueIssues(trustReport, coachingReport)
  const overdueCount = topOverdueIssues.filter((i) => i.isOverdue).length

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    vitalsMetrics,
    vitalsStatus: vitalsMetrics.status,
    trustMetrics,
    trustStatus: trustMetrics.status,
    a11yMetrics,
    a11yStatus: a11yMetrics.status,
    mobileMetrics,
    mobileStatus: mobileMetrics.status,
    totalP0,
    totalP1,
    totalP2,
    overdueCount,
    topOverdueIssues,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  // Post to Slack if P0 or significant overdue
  if (totalP0 > 0 || overdueCount > 2) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  console.log(`Stakeholder dashboard generated (P0=${totalP0}, P1=${totalP1}, P2=${totalP2}, overdue=${overdueCount}).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
