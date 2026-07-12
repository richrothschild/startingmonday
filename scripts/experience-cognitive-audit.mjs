#!/usr/bin/env node
/**
 * Experience Cognitive Monthly LLM Audit Dispatcher
 *
 * Monthly deep-dive audits on routes with cognitive issues.
 * Runs Page Experience Auditor subagent on:
 *  - Worst-scoring 5 routes (by load or fluency)
 *  - Routes that moved a grade band since last month
 *
 * Produces: docs/status/experience-cognitive-audit.latest.{json,md}
 */
import fs from 'node:fs'
import path from 'node:path'
import { writeLatestReportFiles, postSlackText } from './lib/agent-report-kit.mjs'

const ROOT = process.cwd()
const SCORES_PATH = path.join(ROOT, 'tmp', 'cognitive-scores.json')
const AUDIT_HISTORY_PATH = path.join(ROOT, 'docs', 'status', 'experience-cognitive-audit-history.json')
const OUTPUT_DIR = path.join(ROOT, 'docs', 'status')

function readCognitiveScores() {
  if (!fs.existsSync(SCORES_PATH)) {
    return { available: false, scores: [] }
  }
  try {
    const report = JSON.parse(fs.readFileSync(SCORES_PATH, 'utf8'))
    return { available: true, scores: report.scores || [] }
  } catch (err) {
    console.error(`Failed to read cognitive scores: ${err.message}`)
    return { available: false, scores: [] }
  }
}

function readAuditHistory() {
  if (!fs.existsSync(AUDIT_HISTORY_PATH)) {
    return {}
  }
  try {
    return JSON.parse(fs.readFileSync(AUDIT_HISTORY_PATH, 'utf8'))
  } catch (err) {
    console.warn(`Failed to read audit history: ${err.message}`)
    return {}
  }
}

function identifyAuditCandidates(currentScores, previousHistory) {
  const candidates = {
    worstLoad: [],
    worstFluency: [],
    gradeBandMovers: [],
  }

  // Get worst-5 load
  const loadSorted = [...currentScores].sort((a, b) => (b.load?.score ?? 0) - (a.load?.score ?? 0))
  candidates.worstLoad = loadSorted.slice(0, 5).map((s) => ({
    route: s.route,
    grade: s.load?.grade,
    score: s.load?.score,
    reason: 'worst-load',
  }))

  // Get worst-5 fluency
  const fluencySorted = [...currentScores].sort((a, b) => (a.fluency?.score ?? 100) - (b.fluency?.score ?? 100))
  candidates.worstFluency = fluencySorted.slice(0, 5).map((s) => ({
    route: s.route,
    grade: s.fluency?.grade,
    score: s.fluency?.score,
    reason: 'worst-fluency',
  }))

  // Detect grade band movers (future enhancement: compare with previousHistory)
  // For now, just identify routes that are C or worse
  for (const score of currentScores) {
    if (score.load?.grade >= 'C' || score.fluency?.grade >= 'C') {
      const prevGrade = previousHistory[score.route]?.grade
      if (prevGrade && prevGrade !== (score.load?.grade || score.fluency?.grade)) {
        candidates.gradeBandMovers.push({
          route: score.route,
          currentGrade: score.load?.grade || score.fluency?.grade,
          previousGrade: prevGrade,
          reason: 'grade-band-change',
        })
      }
    }
  }

  // Deduplicate and take top candidates
  const allCandidates = [...candidates.worstLoad, ...candidates.worstFluency, ...candidates.gradeBandMovers]
  const deduped = new Map()
  for (const candidate of allCandidates) {
    if (!deduped.has(candidate.route)) {
      deduped.set(candidate.route, candidate)
    }
  }

  return {
    total: deduped.size,
    routes: Array.from(deduped.values()).slice(0, 7),
  }
}

/**
 * Prepare audit findings summary
 * In production, this would invoke Page Experience Auditor subagent
 * For now, we collect deterministic scores and flag for review
 */
function prepareAuditSummary(candidates, scores) {
  const findings = []

  for (const candidate of candidates.routes) {
    const scoreData = scores.find((s) => s.route === candidate.route)
    if (!scoreData) continue

    findings.push({
      route: candidate.route,
      reason: candidate.reason,
      loadGrade: scoreData.load?.grade,
      loadScore: scoreData.load?.score,
      fluencyGrade: scoreData.fluency?.grade,
      fluencyScore: scoreData.fluency?.score,
      loadMetrics: scoreData.load?.metrics,
      fluencyMetrics: scoreData.fluency?.metrics,
      recommendedActions: generateRecommendations(scoreData),
    })
  }

  return findings
}

function generateRecommendations(scoreData) {
  const actions = []

  // Load recommendations
  if (scoreData.load?.grade >= 'D') {
    const metrics = scoreData.load?.metrics ?? {}
    if (metrics.totalInteractiveElements > 15) {
      actions.push('Reduce interactive element density: consolidate buttons/links or use progressive disclosure')
    }
    if (metrics.ctaCount > 8) {
      actions.push('Too many competing CTAs: prioritize primary action and demote secondary CTAs')
    }
    if (metrics.choiceSetCount > 3) {
      actions.push('Reduce form field burden: split form into steps or use smart defaults')
    }
    if (metrics.notificationBadgeCount > 5) {
      actions.push('Reduce notification/badge density: consolidate alerts or use toast patterns')
    }
  }

  // Fluency recommendations
  if (scoreData.fluency?.grade >= 'D') {
    const metrics = scoreData.fluency?.metrics ?? {}
    if (metrics.headlineGrade > 10) {
      actions.push('Simplify headline copy: target grade level 8 or below')
    }
    if (metrics.ledeGrade > 12) {
      actions.push('Simplify leading paragraph: reduce sentence complexity')
    }
    if (metrics.scannabilityScore < 80) {
      actions.push('Improve scannability: break up long paragraphs, use more subheadings')
    }
    if (metrics.informationScent < 60) {
      actions.push('Improve link labels: make them descriptive and scannable (avoid "click here")')
    }
  }

  return actions
}

function buildMarkdown(candidates, findings) {
  const lines = []
  lines.push('# Cognitive Load & Fluency Monthly Audit')
  lines.push('')

  if (findings.length === 0) {
    lines.push('✅ No routes identified for deep-dive audit this month')
    return lines.join('\n')
  }

  lines.push(`## Audit Scope`)
  lines.push(`- Routes selected for review: **${findings.length}**`)
  lines.push('')

  for (const finding of findings) {
    lines.push(`### ${finding.route}`)
    lines.push(`- **Reason**: ${finding.reason}`)
    lines.push(`- **Load**: ${finding.loadGrade} (${finding.loadScore?.toFixed(0)}/100)`)
    lines.push(`- **Fluency**: ${finding.fluencyGrade} (${finding.fluencyScore?.toFixed(1)}/100)`)

    if (finding.recommendedActions.length > 0) {
      lines.push(`- **Recommended Actions**:`)
      for (const action of finding.recommendedActions) {
        lines.push(`  - ${action}`)
      }
    }
    lines.push('')
  }

  lines.push('## Next Steps')
  lines.push('- Schedule LLM Page Experience Auditor for worst-3 routes (human cost-benefit analysis)')
  lines.push('- Implement quick-fix recommendations for advisory findings')
  lines.push('- Track grade changes to identify patterns and systemic issues')

  return lines.join('\n')
}

function buildSlackText(findings) {
  const lines = []
  lines.push(':mag: Cognitive Monthly LLM Audit Dispatch')
  lines.push('')

  if (findings.length === 0) {
    lines.push('✅ No routes flagged for deep audit this month')
    return lines.join('\n')
  }

  lines.push(`:warning: ${findings.length} routes selected for Page Experience Auditor review`)
  lines.push('')

  lines.push('Routes requiring deep-dive audit:')
  for (const finding of findings.slice(0, 5)) {
    const actionCount = finding.recommendedActions?.length ?? 0
    lines.push(`• ${finding.route} [${finding.loadGrade}/${finding.fluencyGrade}] - ${actionCount} action(s)`)
  }

  if (findings.length > 5) {
    lines.push(`\n…and ${findings.length - 5} more routes`)
  }

  return lines.join('\n')
}

async function main() {
  const scoreData = readCognitiveScores()
  if (!scoreData.available) {
    console.log('Cognitive scores not available; skipping audit dispatch')
    return
  }

  const history = readAuditHistory()
  const candidates = identifyAuditCandidates(scoreData.scores, history)
  const findings = prepareAuditSummary(candidates, scoreData.scores)
  const markdown = buildMarkdown(candidates, findings)
  const slackText = buildSlackText(findings)

  const report = {
    generatedAt: new Date().toISOString(),
    auditScope: candidates.total,
    findings,
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  await writeLatestReportFiles({
    jsonPath: path.join(OUTPUT_DIR, 'experience-cognitive-audit.latest.json'),
    markdownPath: path.join(OUTPUT_DIR, 'experience-cognitive-audit.latest.md'),
    report,
    markdown,
  })

  console.log('Cognitive monthly audit prepared')
  console.log(`- candidates identified: ${candidates.total}`)
  console.log(`- findings with recommendations: ${findings.length}`)

  const webhook = process.env.SLACK_WEBHOOK_URL
  if (webhook) {
    await postSlackText({ webhookUrl: webhook, text: slackText })
  }
}

await main()
