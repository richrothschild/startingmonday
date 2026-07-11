#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'team-coaching.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'team-coaching.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'metrics---intelligence'

const TEAM_ESCALATION_THRESHOLDS = {
  'content-design': { p0Threshold: 3, p1Threshold: 10, overallThreshold: 20 },
  'ui-delivery': { p0Threshold: 2, p1Threshold: 8, overallThreshold: 15 },
  'platform-reliability': { p0Threshold: 4, p1Threshold: 12, overallThreshold: 25 },
  'a11y-platform': { p0Threshold: 5, p1Threshold: 15, overallThreshold: 30 },
  'metrics-intelligence': { p0Threshold: 2, p1Threshold: 8, overallThreshold: 15 },
}

function nowIso() {
  return new Date().toISOString()
}

function loadEscalationReport() {
  const escalationPath = path.join(process.cwd(), 'docs', 'status', 'trust-escalation.latest.json')
  if (!fs.existsSync(escalationPath)) {
    return { escalations: [] }
  }
  return JSON.parse(fs.readFileSync(escalationPath, 'utf8'))
}

function aggregateByTeam(escalations) {
  const teamMetrics = new Map()

  for (const escalation of escalations) {
    const team = escalation.assignedTeam || 'unassigned'
    if (!teamMetrics.has(team)) {
      teamMetrics.set(team, {
        team,
        p0: 0,
        p1: 0,
        p2: 0,
        total: 0,
        overdue: 0,
        onTime: 0,
        issues: [],
      })
    }

    const metrics = teamMetrics.get(team)
    metrics.total++
    metrics.issues.push({
      id: escalation.id || 'unknown',
      severity: escalation.severity || 'P2',
      contract: escalation.contractType || 'unknown',
      createdAt: escalation.createdAt || nowIso(),
    })

    switch (escalation.severity) {
      case 'P0':
        metrics.p0++
        break
      case 'P1':
        metrics.p1++
        break
      case 'P2':
        metrics.p2++
        break
    }

    // Simple overdue detection: if issue created > 24h ago and severity is P0/P1, mark as overdue
    const createdTime = new Date(escalation.createdAt || nowIso()).getTime()
    const nowTime = Date.now()
    const hoursOld = (nowTime - createdTime) / (1000 * 60 * 60)

    const slaDuration = { P0: 1, P1: 4, P2: 24 }[escalation.severity || 'P2'] || 24
    if (hoursOld > slaDuration) {
      metrics.overdue++
    } else {
      metrics.onTime++
    }
  }

  return Array.from(teamMetrics.values())
}

function classifyTeamHealth(team) {
  const thresholds = TEAM_ESCALATION_THRESHOLDS[team.team] || TEAM_ESCALATION_THRESHOLDS['metrics-intelligence']

  if (team.p0 >= thresholds.p0Threshold) return 'critical'
  if (team.p1 >= thresholds.p1Threshold) return 'high'
  if (team.total >= thresholds.overallThreshold) return 'medium'
  return 'healthy'
}

function generateCoachingRecommendations(team) {
  const health = classifyTeamHealth(team)
  const recommendations = []

  if (team.p0 > 0) {
    recommendations.push(`🔴 ${team.p0} P0 violation(s) — Immediate executive escalation required`)
  }

  if (team.overdue > 0) {
    const overduePct = ((team.overdue / (team.overdue + team.onTime)) * 100).toFixed(0)
    recommendations.push(`⏰ ${team.overdue} overdue (${overduePct}%) — Review SLA compliance process`)
  }

  if (team.p1 > 0) {
    recommendations.push(`🟠 ${team.p1} P1 issue(s) — Add to next sprint; prioritize high-impact fixes`)
  }

  if (health === 'critical') {
    recommendations.push('💡 Recommendation: Pair with metrics-intelligence team for triage process improvement')
  }

  if (health === 'high') {
    recommendations.push('💡 Recommendation: Run 30-min team huddle to align on blockers and dependencies')
  }

  if (health === 'medium') {
    recommendations.push('💡 Recommendation: Schedule backlog refinement to address emerging patterns')
  }

  if (health === 'healthy' && team.total === 0) {
    recommendations.push('✅ No open violations — Continue current pace')
  }

  return recommendations
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Team Coaching Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Team Health Summary')
  lines.push('')
  lines.push('| Team | Health | P0 | P1 | P2 | Total | Overdue | SLA% |')
  lines.push('|------|--------|----|----|-----|-------|---------|------|')

  for (const team of report.teamMetrics) {
    const health = classifyTeamHealth(team)
    const healthIcon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      healthy: '✅',
    }[health]
    const slaPct = team.total > 0 ? ((team.onTime / team.total) * 100).toFixed(0) : '100'
    lines.push(`| ${team.team} | ${healthIcon} ${health} | ${team.p0} | ${team.p1} | ${team.p2} | ${team.total} | ${team.overdue} | ${slaPct}% |`)
  }
  lines.push('')

  lines.push('## Coaching Recommendations by Team')
  lines.push('')
  for (const team of report.teamMetrics) {
    const recommendations = generateCoachingRecommendations(team)
    lines.push(`### ${team.team}`)
    lines.push('')
    if (recommendations.length > 0) {
      for (const rec of recommendations) {
        lines.push(`- ${rec}`)
      }
    } else {
      lines.push('- Status good; continue current pace')
    }
    lines.push('')
  }

  lines.push('## Repeat Offenders')
  lines.push('')
  const repeatOffenders = report.teamMetrics.filter((t) => t.total >= (TEAM_ESCALATION_THRESHOLDS[t.team]?.overallThreshold || 15))
  if (repeatOffenders.length > 0) {
    for (const team of repeatOffenders.sort((a, b) => b.total - a.total)) {
      lines.push(`- **${team.team}**: ${team.total} open issues (P0=${team.p0}, P1=${team.p1})`)
    }
  } else {
    lines.push('- No repeat offenders detected')
  }
  lines.push('')

  lines.push('## Action Items')
  lines.push('')
  const p0Teams = report.teamMetrics.filter((t) => t.p0 > 0)
  if (p0Teams.length > 0) {
    lines.push(`**Executive Escalation (${p0Teams.length} team(s))**: `)
    for (const team of p0Teams) {
      lines.push(`- ${team.team}: ${team.p0} P0 violation(s) — Executive alignment required`)
    }
    lines.push('')
  }

  const huddle = report.teamMetrics.filter((t) => classifyTeamHealth(t) === 'high')
  if (huddle.length > 0) {
    lines.push(`**Team Huddles (${huddle.length} team(s))**:`)
    for (const team of huddle) {
      lines.push(`- ${team.team}: Schedule 30-min to discuss blockers and dependencies`)
    }
    lines.push('')
  }

  const backlog = report.teamMetrics.filter((t) => classifyTeamHealth(t) === 'medium')
  if (backlog.length > 0) {
    lines.push(`**Backlog Refinement (${backlog.length} team(s))**:`)
    for (const team of backlog) {
      lines.push(`- ${team.team}: Review ${team.total} open issues for pattern identification`)
    }
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const p0Teams = report.teamMetrics.filter((t) => t.p0 > 0)
  const overdueTeams = report.teamMetrics.filter((t) => t.overdue > 0)
  const healthyTeams = report.teamMetrics.filter((t) => classifyTeamHealth(t) === 'healthy').length

  const headline =
    p0Teams.length > 0
      ? `🔴 ${p0Teams.length} teams with P0 violations`
      : overdueTeams.length > 0
        ? `⏰ ${overdueTeams.length} teams with SLA overages`
        : `✅ ${healthyTeams} teams healthy`

  return [headline, `Teams: ${report.teamMetrics.length}`, p0Teams.length > 0 ? 'Action: Immediate executive escalation' : 'Status: SLA on track'].join('\n')
}

async function main() {
  const escalationReport = loadEscalationReport()
  const teamMetrics = aggregateByTeam(escalationReport.escalations || [])

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    teamMetrics,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  // Post to Slack if any P0 violations exist
  const p0Teams = teamMetrics.filter((t) => t.p0 > 0)
  if (p0Teams.length > 0) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  console.log(`Team coaching analysis completed (${p0Teams.length} teams with P0, ${teamMetrics.filter((t) => t.overdue > 0).length} teams with overdue issues).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
