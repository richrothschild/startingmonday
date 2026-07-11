#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { loadSES, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'

const auditorOutcomesPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-fluency-auditor-outcomes.latest.json')
const scoreMapPath = path.join(process.cwd(), 'config', 'cognitive-fluency-score-adjustments.json')
const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-fluency-auditor-feedback.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-fluency-auditor-feedback.latest.md')

function loadAuditorOutcomes() {
  if (!fs.existsSync(auditorOutcomesPath)) {
    return { routes: [], totalReviewed: 0, generatedAt: null }
  }
  return JSON.parse(fs.readFileSync(auditorOutcomesPath, 'utf8'))
}

function loadScoreMap() {
  if (!fs.existsSync(scoreMapPath)) {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      adjustments: {},
      issueTypeWeights: {
        'cognitive-load-density': 1.5,
        'choice-overload': 2.0,
        'trust-spillover': 2.5,
        'typography-inconsistency': 0.8,
        'layout-regression': 1.2,
      },
      routeMultipliers: {
        dashboard: 1.25,
        funnel: 1.5,
        public: 1.0,
        admin: 0.8,
      },
    }
  }
  return JSON.parse(fs.readFileSync(scoreMapPath, 'utf8'))
}

function reconcileOutcomeWithDeterministic(outcome, deterministic) {
  const delta = {
    route: outcome.route,
    auditorGrade: outcome.grade,
    determinisiticGrade: deterministic?.grade ?? 'unknown',
    agreementLevel: 'unknown',
    confidenceAdjustment: 1.0,
    suggestedIssueTypes: [],
    reconciliationNote: '',
  }

  const gradeOrder = ['A-', 'B+', 'B', 'C+', 'C']
  const auditorRank = gradeOrder.indexOf(outcome.grade ?? 'C')
  const deterministicRank = gradeOrder.indexOf(deterministic?.grade ?? 'C')

  if (auditorRank === deterministicRank) {
    delta.agreementLevel = 'exact'
    delta.confidenceAdjustment = 1.1 // Boost confidence if auditor agrees
    delta.reconciliationNote = 'Auditor and deterministic grades align; increase confidence in deterministic model for this route pattern.'
  } else if (Math.abs(auditorRank - deterministicRank) === 1) {
    delta.agreementLevel = 'within-one-grade'
    delta.confidenceAdjustment = 0.95 // Slight penalty for within-one mismatch
    delta.reconciliationNote = 'Auditor and deterministic differ by one grade; investigate whether deterministic thresholds need tuning for this pattern.'
  } else {
    delta.agreementLevel = 'major-delta'
    delta.confidenceAdjustment = 0.75 // Significant penalty for major mismatches
    delta.reconciliationNote = 'Large discrepancy detected; prioritize auditor grade as ground truth and retrain deterministic rules.'

    // Suggest issue types from auditor that deterministic missed
    if (outcome.findings) {
      for (const finding of outcome.findings) {
        if (finding.category === 'cognitive-load') delta.suggestedIssueTypes.push('cognitive-load-density')
        if (finding.category === 'choice-overload') delta.suggestedIssueTypes.push('choice-overload')
        if (finding.category === 'trust') delta.suggestedIssueTypes.push('trust-spillover')
      }
    }
  }

  return delta
}

function buildAdjustments(outcomes, scoreMap, deterministicReport) {
  const adjustments = {}
  const reconciliations = []

  for (const outcome of outcomes.routes || []) {
    const correspondingDeterministic = deterministicReport?.pages?.find((p) => p.route === outcome.route)
    const reconciliation = reconcileOutcomeWithDeterministic(outcome, correspondingDeterministic)
    reconciliations.push(reconciliation)

    if (reconciliation.agreementLevel === 'major-delta') {
      // Create adjustment to boost future scores for this route pattern
      const routePrefix = outcome.route.split('/')[1] // e.g., 'dashboard', 'pricing'
      adjustments[outcome.route] = {
        auditorGrade: outcome.grade,
        confidenceBoost: reconciliation.confidenceAdjustment,
        requiredIssueTypes: reconciliation.suggestedIssueTypes,
        rationale: reconciliation.reconciliationNote,
        appliedAt: new Date().toISOString(),
      }
    }
  }

  return { adjustments, reconciliations }
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Cognitive Fluency Auditor Feedback Loop')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push(`Outcomes processed: ${report.reconciliations.length}`)
  lines.push(`Agreement rate (exact + within-one): ${report.agreementRate.toFixed(1)}%`)
  lines.push('')

  lines.push('## Reconciliation Summary')
  lines.push('')
  lines.push(`- Exact match: ${report.agreementCounts.exact}`)
  lines.push(`- Within one grade: ${report.agreementCounts.withinOne}`)
  lines.push(`- Major delta: ${report.agreementCounts.majorDelta}`)
  lines.push('')

  lines.push('## Reconciliation Details')
  lines.push('')
  for (const recon of report.reconciliations.slice(0, 20)) {
    lines.push(`### ${recon.route}`)
    lines.push(`- Auditor: ${recon.auditorGrade}`)
    lines.push(`- Deterministic: ${recon.deterministicGrade}`)
    lines.push(`- Agreement: ${recon.agreementLevel}`)
    lines.push(`- Confidence adjustment: ${recon.confidenceAdjustment.toFixed(2)}x`)
    lines.push(`- Note: ${recon.reconciliationNote}`)
    if (recon.suggestedIssueTypes.length > 0) {
      lines.push(`- Suggested types: ${recon.suggestedIssueTypes.join(', ')}`)
    }
    lines.push('')
  }

  lines.push('## Adjustments Applied')
  lines.push('')
  if (Object.keys(report.adjustments).length === 0) {
    lines.push('- None (all routes within acceptable agreement range)')
  } else {
    for (const [route, adj] of Object.entries(report.adjustments).slice(0, 10)) {
      lines.push(`- ${route}: boost=${adj.confidenceBoost.toFixed(2)}x, types=[${adj.requiredIssueTypes.join(', ')}]`)
    }
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  return [
    `*Cognitive fluency auditor feedback processed*`,
    `Outcomes: ${report.reconciliations.length}`,
    `Agreement rate: ${report.agreementRate.toFixed(1)}%`,
    '',
    '*Agreement breakdown*',
    `- Exact: ${report.agreementCounts.exact}`,
    `- Within one grade: ${report.agreementCounts.withinOne}`,
    `- Major delta: ${report.agreementCounts.majorDelta}`,
    '',
    `Adjustments: ${Object.keys(report.adjustments).length}`,
  ].join('\n')
}

async function main() {
  const outcomes = loadAuditorOutcomes()
  if (!outcomes.routes || outcomes.routes.length === 0) {
    console.log('No auditor outcomes found; skipping feedback loop.')
    return
  }

  const scoreMap = loadScoreMap()

  // Load corresponding deterministic report
  const cognitiveReportPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-load.latest.json')
  const deterministicReport = fs.existsSync(cognitiveReportPath)
    ? JSON.parse(fs.readFileSync(cognitiveReportPath, 'utf8'))
    : null

  const { adjustments, reconciliations } = buildAdjustments(outcomes, scoreMap, deterministicReport)

  // Count agreement levels
  const agreementCounts = {
    exact: reconciliations.filter((r) => r.agreementLevel === 'exact').length,
    withinOne: reconciliations.filter((r) => r.agreementLevel === 'within-one-grade').length,
    majorDelta: reconciliations.filter((r) => r.agreementLevel === 'major-delta').length,
  }

  const agreementRate = reconciliations.length > 0
    ? (((agreementCounts.exact + agreementCounts.withinOne) / reconciliations.length) * 100)
    : 0

  const report = {
    generatedAt: new Date().toISOString(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    reconciliations,
    agreementCounts,
    agreementRate,
    adjustments,
    outcomesProcessed: outcomes.routes.length,
    scoreMapVersion: scoreMap.version,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  // Save updated score adjustments
  const updatedScoreMap = {
    ...scoreMap,
    lastUpdatedAt: new Date().toISOString(),
    adjustments: { ...scoreMap.adjustments, ...report.adjustments },
  }
  fs.mkdirSync(path.dirname(scoreMapPath), { recursive: true })
  fs.writeFileSync(scoreMapPath, `${JSON.stringify(updatedScoreMap, null, 2)}\n`, 'utf8')

  await postSlackText({
    webhookUrl: slackWebhook,
    text: buildSlackText(report),
  })

  console.log(`Cognitive fluency auditor feedback processed (${reconciliations.length} outcomes, ${agreementRate.toFixed(1)}% agreement rate).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
