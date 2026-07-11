#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'team-comparison.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'team-comparison.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'metrics---intelligence'

function nowIso() {
  return new Date().toISOString()
}

function loadCoachingReport() {
  const coachingPath = path.join(process.cwd(), 'docs', 'status', 'team-coaching.latest.json')
  if (!fs.existsSync(coachingPath)) return null
  return JSON.parse(fs.readFileSync(coachingPath, 'utf8'))
}

function calculateTeamMetrics(teamMetrics) {
  const metrics = {
    average: {},
    median: {},
    bestInClass: {},
    worstInClass: {},
  }

  const teams = teamMetrics || []

  // Calculate averages
  const avgP0 = teams.reduce((sum, t) => sum + (t.p0 || 0), 0) / (teams.length || 1)
  const avgP1 = teams.reduce((sum, t) => sum + (t.p1 || 0), 0) / (teams.length || 1)
  const avgP2 = teams.reduce((sum, t) => sum + (t.p2 || 0), 0) / (teams.length || 1)
  const avgTotal = teams.reduce((sum, t) => sum + (t.total || 0), 0) / (teams.length || 1)
  const avgSLA = teams.length > 0 ? teams.reduce((sum, t) => sum + ((t.onTime / (t.onTime + t.overdue || 1)) * 100 || 0), 0) / teams.length : 100

  metrics.average = {
    p0: Math.round(avgP0 * 10) / 10,
    p1: Math.round(avgP1 * 10) / 10,
    p2: Math.round(avgP2 * 10) / 10,
    total: Math.round(avgTotal),
    slaPercentage: Math.round(avgSLA),
  }

  // Best and worst performers
  if (teams.length > 0) {
    const byTotal = [...teams].sort((a, b) => (a.total || 0) - (b.total || 0))
    metrics.bestInClass = byTotal[0]
    metrics.worstInClass = byTotal[byTotal.length - 1]
  }

  return metrics
}

function classifyTeamPerformance(team, benchmark) {
  const totalDiff = (team.total || 0) - benchmark.average.total
  const slaDiff = (((team.onTime / (team.onTime + team.overdue || 1)) * 100) || 0) - benchmark.average.slaPercentage

  if (totalDiff > 10 && slaDiff < -10) return 'underperforming'
  if (totalDiff < -10 && slaDiff > 10) return 'exceeding'
  if (totalDiff > 5 || slaDiff < -5) return 'below_average'
  if (totalDiff < -5 || slaDiff > 5) return 'above_average'
  return 'average'
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Team Comparison Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Benchmark Metrics (All Teams)')
  lines.push('')
  lines.push('| Metric | Average | Best | Worst |')
  lines.push('|--------|---------|------|-------|')
  lines.push(`| Total Issues | ${report.benchmark.average.total} | ${report.benchmark.bestInClass?.total || '—'} | ${report.benchmark.worstInClass?.total || '—'} |`)
  lines.push(`| P0 Violations | ${report.benchmark.average.p0.toFixed(1)} | ${report.benchmark.bestInClass?.p0 || '—'} | ${report.benchmark.worstInClass?.p0 || '—'} |`)
  lines.push(`| SLA Attainment | ${report.benchmark.average.slaPercentage}% | ${report.benchmark.bestInClass?.slaPercentage || '—'}% | ${report.benchmark.worstInClass?.slaPercentage || '—'}% |`)
  lines.push('')

  lines.push('## Team Comparison (vs Benchmark)')
  lines.push('')
  lines.push('| Team | Total | Variance | SLA | Performance | Status |')
  lines.push('|------|-------|----------|-----|-------------|--------|')

  for (const team of report.teamComparisons || []) {
    const variance = team.total - report.benchmark.average.total
    const varianceStr = variance > 0 ? `+${variance}` : String(variance)
    const perfIcon = {
      exceeding: '🟢',
      above_average: '🟡',
      average: '➡️',
      below_average: '🟠',
      underperforming: '🔴',
    }[team.performance]
    lines.push(
      `| ${team.team} | ${team.total} | ${varianceStr} | ${team.sla}% | ${perfIcon} ${team.performance} | ${team.p0 > 0 ? '⚠️ P0' : '✅ OK'} |`,
    )
  }
  lines.push('')

  lines.push('## Top Performers')
  lines.push('')
  const topPerformers = report.teamComparisons.filter((t) => t.performance === 'exceeding').slice(0, 3)
  if (topPerformers.length > 0) {
    for (const team of topPerformers) {
      lines.push(`✅ **${team.team}**: ${team.total} issues (${team.sla}% SLA) — Best in class`)
    }
  } else {
    lines.push('- No teams exceeding benchmark')
  }
  lines.push('')

  lines.push('## Teams Needing Support')
  lines.push('')
  const needSupport = report.teamComparisons.filter((t) => t.performance === 'underperforming' || t.performance === 'below_average').slice(0, 3)
  if (needSupport.length > 0) {
    for (const team of needSupport) {
      lines.push(`⚠️ **${team.team}**: ${team.total} issues (${team.sla}% SLA) — Consider coaching or resource allocation`)
    }
  } else {
    lines.push('- All teams at or above benchmark')
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

async function main() {
  const coachingReport = loadCoachingReport()

  if (!coachingReport || !coachingReport.teamMetrics) {
    console.log('Team coaching report not available; skipping team comparison.')
    return
  }

  const benchmark = calculateTeamMetrics(coachingReport.teamMetrics)

  const teamComparisons = (coachingReport.teamMetrics || []).map((team) => ({
    team: team.team,
    total: team.total || 0,
    p0: team.p0 || 0,
    p1: team.p1 || 0,
    p2: team.p2 || 0,
    sla: team.total > 0 ? Math.round(((team.onTime || 0) / team.total) * 100) : 100,
    performance: classifyTeamPerformance(team, benchmark),
  }))

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    benchmark,
    teamComparisons: teamComparisons.sort((a, b) => a.total - b.total),
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  const underperforming = teamComparisons.filter((t) => t.performance === 'underperforming')
  if (underperforming.length > 0) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: `⚠️ ${underperforming.length} team(s) underperforming vs benchmark\nChannel: ${slackChannel}\nAction: Recommend coaching or resource review`,
    })
  }

  console.log(`Team comparison analysis completed (${teamComparisons.length} teams, ${underperforming.length} underperforming).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
