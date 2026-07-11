#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const trustReportPath = path.join(process.cwd(), 'docs', 'status', 'trust-integrity.latest.json')
const escalationPath = path.join(process.cwd(), 'docs', 'status', 'trust-escalation.latest.json')
const escalationMdPath = path.join(process.cwd(), 'docs', 'status', 'trust-escalation.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'reliability---service'

// Route mapping: which team owns which contract violation
const routingMap = {
  'signal-parity': {
    team: 'metrics-intelligence',
    channel: 'metrics-intelligence',
    severity: 'P0',
    escalation: true,
    description: 'Dashboard signal count mismatches across briefing, signals index, and dashboard',
  },
  'relative-time': {
    team: 'content-design',
    channel: 'content-design',
    severity: 'P1',
    escalation: true,
    description: 'Stale free-text relative time phrases in dashboard context',
  },
  'title-pattern': {
    team: 'ui-delivery',
    channel: 'ui-delivery',
    severity: 'P2',
    escalation: false,
    description: 'Page title does not match expected pattern: {label} - Starting Monday',
  },
  'landmark-missing': {
    team: 'a11y-platform',
    channel: 'accessibility',
    severity: 'P1',
    escalation: true,
    description: 'Missing or multiple main landmarks on route',
  },
  'http-status': {
    team: 'platform-reliability',
    channel: 'platform-eng',
    severity: 'P0',
    escalation: true,
    description: 'Route returned non-2xx HTTP status code',
  },
}

function loadTrustReport() {
  if (!fs.existsSync(trustReportPath)) {
    return { findings: [], routes: [] }
  }
  return JSON.parse(fs.readFileSync(trustReportPath, 'utf8'))
}

function classifyFinding(finding) {
  const message = (finding.message ?? '').toLowerCase()

  if (message.includes('http') || message.includes('status')) {
    return 'http-status'
  }
  if (message.includes('signal') && message.includes('parity')) {
    return 'signal-parity'
  }
  if (message.includes('signal') && message.includes('count')) {
    return 'signal-parity'
  }
  if (message.includes('relative') || message.includes('days since')) {
    return 'relative-time'
  }
  if (message.includes('title')) {
    return 'title-pattern'
  }
  if (message.includes('main') || message.includes('landmark')) {
    return 'landmark-missing'
  }

  return 'unknown'
}

function buildEscalations(trustReport) {
  const escalations = []

  for (const finding of trustReport.findings ?? []) {
    const classification = classifyFinding(finding)
    const routing = routingMap[classification] || {
      team: 'platform-experience',
      channel: 'reliability---service',
      severity: finding.severity || 'P2',
      escalation: false,
      description: 'Trust contract violation',
    }

    const escalation = {
      route: finding.route,
      contract: classification,
      severity: finding.severity || routing.severity,
      message: finding.message,
      team: routing.team,
      channel: routing.channel,
      escalation: routing.escalation,
      escalationReason: routing.description,
      discoveredAt: new Date().toISOString(),
      ttl: calculateTTL(routing.severity),
      suggestedAction: suggestedActionForClassification(classification),
    }

    escalations.push(escalation)
  }

  return escalations
}

function calculateTTL(severity) {
  if (severity === 'P0') return 60 // 1 hour SLA
  if (severity === 'P1') return 4 * 60 // 4 hours SLA
  return 24 * 60 // 24 hours SLA
}

function suggestedActionForClassification(classification) {
  const actions = {
    'signal-parity': 'Audit signal source queries and reconcile count differences across dashboard, briefing, and signals index',
    'relative-time': 'Replace free-text relative time phrases with deterministic date anchors in dashboard context',
    'title-pattern': 'Update page title meta to match pattern: {label} - Starting Monday',
    'landmark-missing': 'Verify main landmark exists exactly once per route and is the primary content area',
    'http-status': 'Debug route availability; check auth, database, and API dependencies',
  }
  return actions[classification] || 'Investigate trust contract violation'
}

function buildEscalationSummary(escalations) {
  const summary = {
    total: escalations.length,
    byTeam: {},
    bySeverity: {
      P0: 0,
      P1: 0,
      P2: 0,
    },
    requiresEscalation: [],
    teams: new Set(),
  }

  for (const escalation of escalations) {
    summary.bySeverity[escalation.severity] = (summary.bySeverity[escalation.severity] ?? 0) + 1
    summary.byTeam[escalation.team] = (summary.byTeam[escalation.team] ?? 0) + 1
    summary.teams.add(escalation.team)

    if (escalation.escalation) {
      summary.requiresEscalation.push({
        team: escalation.team,
        channel: escalation.channel,
        severity: escalation.severity,
        count: 1,
      })
    }
  }

  summary.teams = Array.from(summary.teams)
  return summary
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Trust Escalation Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Summary')
  lines.push('')
  lines.push(`- Total findings: ${report.summary.total}`)
  lines.push(`- P0 (critical): ${report.summary.bySeverity.P0}`)
  lines.push(`- P1 (high): ${report.summary.bySeverity.P1}`)
  lines.push(`- P2 (medium): ${report.summary.bySeverity.P2}`)
  lines.push(`- Teams affected: ${report.summary.teams.join(', ') || 'None'}`)
  lines.push('')

  lines.push('## Escalations Requiring Immediate Action')
  lines.push('')
  if (report.summary.requiresEscalation.length === 0) {
    lines.push('- None')
  } else {
    for (const escalation of report.summary.requiresEscalation) {
      lines.push(`- [${escalation.severity}] ${escalation.team}: ${escalation.count} issue(s) → #${escalation.channel}`)
    }
  }
  lines.push('')

  lines.push('## All Findings by Route')
  lines.push('')
  const byRoute = new Map()
  for (const escalation of report.escalations) {
    if (!byRoute.has(escalation.route)) {
      byRoute.set(escalation.route, [])
    }
    byRoute.get(escalation.route).push(escalation)
  }

  for (const [route, findings] of byRoute) {
    lines.push(`### ${route}`)
    lines.push('')
    for (const finding of findings) {
      lines.push(`- [${finding.severity}] ${finding.contract} → @${finding.team}`)
      lines.push(`  Message: ${finding.message}`)
      lines.push(`  Action: ${finding.suggestedAction}`)
      lines.push(`  SLA: ${finding.ttl} minutes`)
      lines.push('')
    }
  }

  lines.push('## Team Assignments')
  lines.push('')
  for (const [team, count] of Object.entries(report.summary.byTeam)) {
    lines.push(`- **${team}**: ${count} finding(s)`)
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const p0Count = report.summary.bySeverity.P0
  const p1Count = report.summary.bySeverity.P1
  const headline = p0Count > 0
    ? `*Trust escalation: ${p0Count} P0 finding(s) require immediate action*`
    : `*Trust escalation: ${report.summary.total} finding(s) across team(s)*`

  const escalationLines = report.summary.requiresEscalation
    .map((e) => `- [${e.severity}] @${e.team} (#${e.channel}): ${e.count} issue(s)`)

  return [
    headline,
    `Channel: ${report.channel}`,
    `SES Version: ${report.sesVersion}`,
    `Total findings: ${report.summary.total}`,
    `Severity: P0=${p0Count} P1=${p1Count} P2=${report.summary.bySeverity.P2}`,
    '',
    '*Escalations requiring immediate action*',
    ...(escalationLines.length > 0 ? escalationLines : ['- None']),
  ].join('\n')
}

async function main() {
  const trustReport = loadTrustReport()
  const escalations = buildEscalations(trustReport)
  const summary = buildEscalationSummary(escalations)

  const report = {
    generatedAt: new Date().toISOString(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    trustReportPath,
    escalations,
    summary: {
      ...summary,
      teams: summary.teams,
    },
  }

  writeLatestReportFiles({
    jsonPath: escalationPath,
    markdownPath: escalationMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  const escalationCount = report.summary.requiresEscalation.length
  if (escalationCount > 0) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  console.log(`Trust escalation agent completed (${escalations.length} findings, ${escalationCount} escalations).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
