#!/usr/bin/env node
/**
 * Experience Cognitive Load & Fluency Weekly Reporter
 *
 * Integrates deterministic cognitive scores into weekly SXO reporting.
 * Identifies routes for monthly LLM Page Experience Auditor review.
 *
 * Consumes: tmp/cognitive-scores.json
 * Produces: docs/status/experience-cognitive-report.latest.{json,md}
 */
import fs from 'node:fs'
import path from 'node:path'
import { writeLatestReportFiles, postSlackText } from './lib/agent-report-kit.mjs'

const ROOT = process.cwd()
const SCORES_PATH = path.join(ROOT, 'tmp', 'cognitive-scores.json')
const OUTPUT_DIR = path.join(ROOT, 'docs', 'status')

function readCognitiveScores() {
  if (!fs.existsSync(SCORES_PATH)) {
    return { available: false, report: {} }
  }
  try {
    const report = JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8'))
    return { available: true, report }
  } catch (err) {
    console.error(`Failed to read cognitive scores: ${err.message}`)
    return { available: false, report: {} }
  }
}

function analyzeLoadAndFluency(scoreData) {
  if (!scoreData.available) {
    return { available: false }
  }

  const scores = scoreData.report.scores || []
  const analysis = {
    available: true,
    generatedAt: scoreData.report.generatedAt,
    totalRoutes: scoreData.report.summary?.routesScored ?? 0,
    gradeDistribution: scoreData.report.summary?.gradeDistribution ?? {},
  }

  // Identify candidates for LLM audit
  const auditCandidates = {
    loadD_or_worse: [],
    fluencyD_or_worse: [],
    dashboardNonCompliant: [],
  }

  for (const score of scores) {
    if (score.load?.grade && score.load.grade >= 'D') {
      auditCandidates.loadD_or_worse.push({ route: score.route, grade: score.load.grade, score: score.load.score })
    }
    if (score.fluency?.grade && score.fluency.grade >= 'D') {
      auditCandidates.fluencyD_or_worse.push({ route: score.route, grade: score.fluency.grade, score: score.fluency.score })
    }
    if (score.tier === 'dashboard' && score.fluency?.grade && score.fluency.grade < 'A') {
      auditCandidates.dashboardNonCompliant.push({ route: score.route, tier: score.tier, fluency: score.fluency.grade, load: score.load.grade })
    }
  }

  analysis.auditCandidates = {
    load_issues: auditCandidates.loadD_or_worse.slice(0, 5),
    fluency_issues: auditCandidates.fluencyD_or_worse.slice(0, 5),
    dashboard_compliance: auditCandidates.dashboardNonCompliant,
  }

  // Top performers
  analysis.topPerformers = {
    load: scores.filter((s) => s.load?.grade === 'A').slice(0, 5),
    fluency: scores.filter((s) => s.fluency?.grade === 'A').slice(0, 5),
  }

  return analysis
}

function buildMarkdown(analysis) {
  const lines = []
  lines.push('# Cognitive Load & Fluency Report')
  lines.push('')

  if (!analysis.available) {
    lines.push('⚠️ Cognitive scores not available')
    return lines.join('\n')
  }

  lines.push('## Overview')
  lines.push(`- Routes scored: **${analysis.totalRoutes}**`)
  lines.push(`- Load grades: ${JSON.stringify(analysis.gradeDistribution.load || {})}`)
  lines.push(`- Fluency grades: ${JSON.stringify(analysis.gradeDistribution.fluency || {})}`)
  lines.push('')

  if (analysis.auditCandidates.load_issues.length > 0) {
    lines.push('## Load Issues (D or worse)')
    for (const route of analysis.auditCandidates.load_issues) {
      lines.push(`- **${route.route}** [${route.grade}] - score: ${route.score.toFixed(0)}`)
    }
    lines.push('')
  }

  if (analysis.auditCandidates.fluency_issues.length > 0) {
    lines.push('## Fluency Issues (D or worse)')
    for (const route of analysis.auditCandidates.fluency_issues) {
      lines.push(`- **${route.route}** [${route.grade}] - score: ${route.score.toFixed(1)}`)
    }
    lines.push('')
  }

  if (analysis.auditCandidates.dashboard_compliance.length > 0) {
    lines.push('## Dashboard Compliance Issues')
    lines.push('Routes that do not meet A- or better fluency requirement:')
    for (const route of analysis.auditCandidates.dashboard_compliance) {
      lines.push(`- **${route.route}**: fluency=${route.fluency}, load=${route.load}`)
    }
    lines.push('')
  } else if (analysis.totalRoutes > 0) {
    lines.push('## Dashboard Compliance')
    lines.push('✅ All dashboard routes meet fluency and load requirements')
    lines.push('')
  }

  if (analysis.topPerformers.fluency.length > 0) {
    lines.push('## Best Fluency Scores (A grade)')
    for (const route of analysis.topPerformers.fluency) {
      lines.push(`- **${route.route}**: ${route.fluency?.score.toFixed(1)}`)
    }
    lines.push('')
  }

  if (analysis.topPerformers.load.length > 0) {
    lines.push('## Best Load Scores (A grade)')
    for (const route of analysis.topPerformers.load) {
      lines.push(`- **${route.route}**: ${route.load?.score.toFixed(0)}`)
    }
  }

  return lines.join('\n')
}

function buildSlackText(analysis) {
  const lines = []
  lines.push(':brain: Cognitive Load & Fluency Weekly Report')
  lines.push('')

  if (!analysis.available) {
    lines.push('⚠️ Scores not available')
    return lines.join('\n')
  }

  const issues = (analysis.auditCandidates?.load_issues?.length ?? 0) + (analysis.auditCandidates?.fluency_issues?.length ?? 0)
  const dashboardIssues = analysis.auditCandidates?.dashboard_compliance?.length ?? 0

  if (issues === 0 && dashboardIssues === 0) {
    lines.push('✅ All routes pass cognitive load and fluency thresholds')
  } else {
    lines.push(`:rotating_light: ${issues} routes with load/fluency issues`)
    if (dashboardIssues > 0) {
      lines.push(`:warning: ${dashboardIssues} dashboard routes below A- fluency`)
    }
  }

  lines.push(`Routes scored: ${analysis.totalRoutes}`)
  lines.push(`Grades: ${JSON.stringify(analysis.gradeDistribution.load || {})} (load), ${JSON.stringify(analysis.gradeDistribution.fluency || {})} (fluency)`)

  if ((analysis.auditCandidates?.load_issues?.length ?? 0) > 0) {
    lines.push('')
    lines.push('Load issues (D or worse):')
    for (const route of (analysis.auditCandidates?.load_issues ?? []).slice(0, 3)) {
      lines.push(`• ${route.route} [${route.grade}]`)
    }
  }

  if ((analysis.auditCandidates?.fluency_issues?.length ?? 0) > 0) {
    lines.push('')
    lines.push('Fluency issues (D or worse):')
    for (const route of (analysis.auditCandidates?.fluency_issues ?? []).slice(0, 3)) {
      lines.push(`• ${route.route} [${route.grade}]`)
    }
  }

  return lines.join('\n')
}

async function main() {
  const scoreData = readCognitiveScores()
  const analysis = analyzeLoadAndFluency(scoreData)
  const markdown = buildMarkdown(analysis)
  const slackText = buildSlackText(analysis)

  const report = {
    generatedAt: new Date().toISOString(),
    analysis,
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  await writeLatestReportFiles({
    jsonPath: path.join(OUTPUT_DIR, 'experience-cognitive-report.latest.json'),
    markdownPath: path.join(OUTPUT_DIR, 'experience-cognitive-report.latest.md'),
    report,
    markdown,
  })

  console.log('Cognitive load & fluency report generated')
  console.log(`- routes scored: ${analysis.totalRoutes}`)
  console.log(`- load issues: ${analysis.auditCandidates?.load_issues?.length ?? 0}`)
  console.log(`- fluency issues: ${analysis.auditCandidates?.fluency_issues?.length ?? 0}`)
  console.log(`- dashboard compliance issues: ${analysis.auditCandidates?.dashboard_compliance?.length ?? 0}`)

  const webhook = process.env.SLACK_WEBHOOK_URL
  if (webhook) {
    await postSlackText({ webhookUrl: webhook, text: slackText })
  }
}

await main()
