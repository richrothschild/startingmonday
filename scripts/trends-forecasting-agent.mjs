#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'trends-forecast.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'trends-forecast.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'metrics---intelligence'

function nowIso() {
  return new Date().toISOString()
}

function loadHistoricalSnapshots() {
  const statusDir = path.join(process.cwd(), 'docs', 'status')
  const snapshots = {
    vitals: [],
    cognitive: [],
    trust: [],
    accessibility: [],
    mobile: [],
  }

  try {
    const vitalsPaths = fs.readdirSync(statusDir).filter((f) => f.startsWith('experience-vitals') && f.endsWith('.json'))
    if (vitalsPaths.length > 0) {
      const latest = vitalsPaths.sort().pop()
      const data = JSON.parse(fs.readFileSync(path.join(statusDir, latest), 'utf8'))
      snapshots.vitals = data.issues || []
    }

    const cognitivePaths = fs.readdirSync(statusDir).filter((f) => f.startsWith('cognitive-load') && f.endsWith('.json'))
    if (cognitivePaths.length > 0) {
      const latest = cognitivePaths.sort().pop()
      const data = JSON.parse(fs.readFileSync(path.join(statusDir, latest), 'utf8'))
      snapshots.cognitive = data.issues || []
    }

    const trustPaths = fs.readdirSync(statusDir).filter((f) => f.startsWith('trust-integrity') && f.endsWith('.json'))
    if (trustPaths.length > 0) {
      const latest = trustPaths.sort().pop()
      const data = JSON.parse(fs.readFileSync(path.join(statusDir, latest), 'utf8'))
      snapshots.trust = data.findings || []
    }

    const a11yPaths = fs.readdirSync(statusDir).filter((f) => f.startsWith('accessibility-sweep') && f.endsWith('.json'))
    if (a11yPaths.length > 0) {
      const latest = a11yPaths.sort().pop()
      const data = JSON.parse(fs.readFileSync(path.join(statusDir, latest), 'utf8'))
      snapshots.accessibility = data.issues || []
    }

    const mobilePaths = fs.readdirSync(statusDir).filter((f) => f.startsWith('mobile-responsive') && f.endsWith('.json'))
    if (mobilePaths.length > 0) {
      const latest = mobilePaths.sort().pop()
      const data = JSON.parse(fs.readFileSync(path.join(statusDir, latest), 'utf8'))
      snapshots.mobile = data.issues || []
    }
  } catch (error) {
    console.warn('Historical snapshot load failed:', error instanceof Error ? error.message : String(error))
  }

  return snapshots
}

function calculateVelocity(snapshots) {
  const velocity = {
    vitals: { total: snapshots.vitals.length, p0: 0, p1: 0, p2: 0 },
    cognitive: { total: snapshots.cognitive.length, p0: 0, p1: 0, p2: 0 },
    trust: { total: snapshots.trust.length, p0: 0, p1: 0, p2: 0 },
    accessibility: { total: snapshots.accessibility.length, p0: 0, p1: 0, p2: 0 },
    mobile: { total: snapshots.mobile.length, p0: 0, p1: 0, p2: 0 },
  }

  for (const issue of snapshots.vitals) {
    if (issue.severity === 'P0') velocity.vitals.p0++
    else if (issue.severity === 'P1') velocity.vitals.p1++
    else if (issue.severity === 'P2') velocity.vitals.p2++
  }

  for (const issue of snapshots.cognitive) {
    if (issue.severity === 'P0') velocity.cognitive.p0++
    else if (issue.severity === 'P1') velocity.cognitive.p1++
    else if (issue.severity === 'P2') velocity.cognitive.p2++
  }

  for (const issue of snapshots.trust) {
    if (issue.severity === 'P0') velocity.trust.p0++
    else if (issue.severity === 'P1') velocity.trust.p1++
    else if (issue.severity === 'P2') velocity.trust.p2++
  }

  for (const issue of snapshots.accessibility) {
    if (issue.severity === 'P0') velocity.accessibility.p0++
    else if (issue.severity === 'P1') velocity.accessibility.p1++
    else if (issue.severity === 'P2') velocity.accessibility.p2++
  }

  for (const issue of snapshots.mobile) {
    if (issue.severity === 'P1') velocity.mobile.p1++
    else if (issue.severity === 'P2') velocity.mobile.p2++
  }

  return velocity
}

function classifyDirectionalTrend(issueCount, previousCount = null) {
  if (previousCount === null) return 'stable'
  if (issueCount > previousCount * 1.1) return 'declining'
  if (issueCount < previousCount * 0.9) return 'improving'
  return 'stable'
}

function calculateRiskScore(velocity) {
  let score = 0

  // Vitals scoring
  score += velocity.vitals.p0 * 100
  score += velocity.vitals.p1 * 25
  score += velocity.vitals.p2 * 5

  // Cognitive scoring
  score += velocity.cognitive.p0 * 100
  score += velocity.cognitive.p1 * 20
  score += velocity.cognitive.p2 * 3

  // Trust scoring (highest weight - directly impacts conversion)
  score += velocity.trust.p0 * 150
  score += velocity.trust.p1 * 50
  score += velocity.trust.p2 * 10

  // Accessibility scoring
  score += velocity.accessibility.p0 * 75
  score += velocity.accessibility.p1 * 15
  score += velocity.accessibility.p2 * 2

  // Mobile scoring
  score += velocity.mobile.p1 * 20
  score += velocity.mobile.p2 * 3

  return score
}

function getRiskLevel(score) {
  if (score >= 1000) return 'critical'
  if (score >= 500) return 'high'
  if (score >= 100) return 'medium'
  return 'low'
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Trends & Forecast Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Overall Risk Assessment')
  lines.push('')
  lines.push(`Risk Score: ${report.riskScore}`)
  lines.push(`Risk Level: **${report.riskLevel.toUpperCase()}**`)
  lines.push('')

  lines.push('## Issue Velocity by Category')
  lines.push('')
  lines.push('| Category | Total | P0 | P1 | P2 | Trend |')
  lines.push('|----------|-------|----|----|----|----|')

  for (const [category, counts] of Object.entries(report.velocity)) {
    const trend = classifyDirectionalTrend(counts.total)
    const trendEmoji = trend === 'improving' ? '📈' : trend === 'declining' ? '📉' : '➡️'
    lines.push(`| ${category} | ${counts.total} | ${counts.p0 || 0} | ${counts.p1 || 0} | ${counts.p2 || 0} | ${trendEmoji} ${trend} |`)
  }
  lines.push('')

  lines.push('## Critical Issues')
  lines.push('')
  if (report.criticalFindings && report.criticalFindings.length > 0) {
    for (const finding of report.criticalFindings.slice(0, 10)) {
      lines.push(`- **${finding.category}** [${finding.severity}] ${finding.message}`)
    }
  } else {
    lines.push('- No critical (P0) issues detected')
  }
  lines.push('')

  lines.push('## Forecast (Next 7 Days)')
  lines.push('')
  if (report.riskLevel === 'critical') {
    lines.push('⚠️ **High Risk** — At current velocity, expect 2-3 additional P0/P1 issues within 7 days')
    lines.push('→ Recommend emergency triage: dedicate team to highest-severity findings')
  } else if (report.riskLevel === 'high') {
    lines.push('🟠 **Elevated Risk** — Current velocity likely to produce 1-2 P1 issues')
    lines.push('→ Recommend prioritized review of trust and cognitive findings')
  } else if (report.riskLevel === 'medium') {
    lines.push('🟡 **Moderate Risk** — Manageable at current resolution rate')
    lines.push('→ Monitor for trend changes; escalate if P0 issues emerge')
  } else {
    lines.push('✅ **Low Risk** — Quality metrics stable')
    lines.push('→ Continue current velocity; focus on accessibility/mobile polish')
  }
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  lines.push(`1. **SLA Attainment**: Monitor team resolution rate against SES timelines`)
  lines.push(`2. **Trend Tracking**: Weekly snapshot to detect inflection points`)
  lines.push(`3. **Risk Mitigation**: If critical/high risk, conduct risk workshop with stakeholders`)
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const riskEmoji = report.riskLevel === 'critical' ? '🚨' : report.riskLevel === 'high' ? '⚠️' : report.riskLevel === 'medium' ? '🟠' : '✅'

  const headline = `${riskEmoji} Trends forecast: ${report.riskLevel} risk (score: ${report.riskScore})`

  const details = [
    `Issues: ${report.velocity.vitals.total + report.velocity.cognitive.total + report.velocity.trust.total + report.velocity.accessibility.total + report.velocity.mobile.total}`,
    report.criticalFindings && report.criticalFindings.length > 0 ? `P0 count: ${report.criticalFindings.filter((f) => f.severity === 'P0').length}` : null,
  ].filter(Boolean)

  return [
    headline,
    `Channel: ${report.channel}`,
    details.join(' | '),
    report.riskLevel === 'critical' ? 'Action: Emergency triage recommended' : 'Status: Monitoring',
  ].join('\n')
}

async function main() {
  const snapshots = loadHistoricalSnapshots()
  const velocity = calculateVelocity(snapshots)
  const riskScore = calculateRiskScore(velocity)
  const riskLevel_val = getRiskLevel(riskScore)

  const allFindings = [
    ...snapshots.vitals.map((i) => ({ ...i, category: 'vitals' })),
    ...snapshots.cognitive.map((i) => ({ ...i, category: 'cognitive' })),
    ...snapshots.trust.map((i) => ({ ...i, category: 'trust' })),
    ...snapshots.accessibility.map((i) => ({ ...i, category: 'accessibility' })),
    ...snapshots.mobile.map((i) => ({ ...i, category: 'mobile' })),
  ]

  const criticalFindings = allFindings.filter((f) => f.severity === 'P0' || f.severity === 'P1').sort((a, b) => {
    const severityOrder = { P0: 0, P1: 1 }
    return (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999)
  })

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    riskScore,
    riskLevel: riskLevel_val,
    velocity,
    criticalFindings: criticalFindings.slice(0, 20),
    totalFindings: allFindings.length,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  // Post to Slack if risk is elevated
  if (riskLevel_val === 'critical' || riskLevel_val === 'high') {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  console.log(`Trends forecast completed (risk level: ${riskLevel_val}, score: ${riskScore}).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
