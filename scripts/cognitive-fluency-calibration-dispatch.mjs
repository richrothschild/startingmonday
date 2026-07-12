#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.RELIABILITY_SLACK_CHANNEL || 'reliability---service'
const cognitiveReportPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-load.latest.json')
const cognitiveHistoryPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-load.history.json')
const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-fluency-calibration.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'cognitive-fluency-calibration.latest.md')

const gradeOrder = ['A-', 'B+', 'B', 'C+', 'C']

function gradeRank(grade) {
  const index = gradeOrder.indexOf(grade)
  return index === -1 ? null : index
}

function loadGradeMovers() {
  if (!fs.existsSync(cognitiveHistoryPath)) return []

  let history
  try {
    history = JSON.parse(fs.readFileSync(cognitiveHistoryPath, 'utf8'))
  } catch {
    return []
  }

  const entries = Array.isArray(history.entries) ? history.entries : []
  if (entries.length < 2) return []

  const previous = entries[entries.length - 2]
  const current = entries[entries.length - 1]
  const previousByRoute = new Map((previous.pages ?? []).map((page) => [page.route, page]))
  const movers = []

  for (const page of current.pages ?? []) {
    const prior = previousByRoute.get(page.route)
    if (!prior) continue

    const priorLoad = gradeRank(prior.loadGrade)
    const currentLoad = gradeRank(page.loadGrade)
    const priorFluency = gradeRank(prior.fluencyGrade)
    const currentFluency = gradeRank(page.fluencyGrade)

    const loadDelta = priorLoad !== null && currentLoad !== null ? currentLoad - priorLoad : 0
    const fluencyDelta = priorFluency !== null && currentFluency !== null ? currentFluency - priorFluency : 0

    if (Math.abs(loadDelta) >= 1 || Math.abs(fluencyDelta) >= 1) {
      movers.push({
        route: page.route,
        tier: page.tier,
        loadDelta,
        fluencyDelta,
      })
    }
  }

  return movers
}

function combinedSeverityScore(page) {
  const loadPenalty = page.issueCount * 10
  const fluencyPenalty = 100 - (page.fluency?.score ?? 100)
  const dashboardMultiplier = page.tier === 'dashboard' ? 1.25 : 1
  return Math.round((loadPenalty + fluencyPenalty) * dashboardMultiplier)
}

function buildCandidateReason(page) {
  const reasons = []
  if (page.thresholds?.load?.pass === false) reasons.push(`load gate failed (${page.grade} vs required ${page.thresholds.load.required})`)
  if (page.thresholds?.fluency?.pass === false) reasons.push(`fluency gate failed (${page.fluency?.grade} vs required ${page.thresholds.fluency.required})`)
  if ((page.fluency?.score ?? 100) < 80) reasons.push(`fluency score=${page.fluency?.score}`)
  if (page.issueCount > 0) reasons.push(`${page.issueCount} deterministic issue(s)`) 
  return reasons.length > 0 ? reasons.join('; ') : 'worst combined screening score'
}

function buildAuditorPrompt(report) {
  const routes = report.candidates.map((candidate) => candidate.route).join(', ')
  const evidenceLines = report.candidates
    .map((candidate) => `- ${candidate.route}: ${candidate.reason}`)
    .join('\n')

  return [
    'Run the Page Experience Auditor on the following routes with three-pass analysis and prioritized fixes:',
    routes,
    '',
    'Deterministic evidence:',
    evidenceLines,
    '',
    'Focus on cognitive fluency, cognitive load, trust integrity spillover, and route-specific remediation actions.',
  ].join('\n')
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Cognitive Fluency Calibration Dispatch')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Channel: ${report.channel}`)
  lines.push(`Source cognitive report: ${report.source.generatedAt ?? 'n/a'}`)
  lines.push(`Candidates selected: ${report.candidates.length}`)
  lines.push('')
  lines.push('## Selected Routes')
  lines.push('')
  for (const candidate of report.candidates) {
    lines.push(`- ${candidate.route} [${candidate.tier}] severity=${candidate.severityScore}`)
    lines.push(`  Reason: ${candidate.reason}`)
  }
  lines.push('')
  lines.push('## Auditor Prompt')
  lines.push('')
  lines.push('```text')
  lines.push(report.auditorPrompt)
  lines.push('```')
  lines.push('')
  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const candidateLines = report.candidates.map((candidate) => `- ${candidate.route}: ${candidate.reason}`)
  const topCandidate = report.candidates[0]
  const executiveSummary = report.candidates.length === 0
    ? 'No calibration candidates were selected from the latest deterministic run.'
    : `${report.candidates.length} calibration candidate route(s) were selected; highest-priority route is ${topCandidate.route}.`
  return [
    '*Cognitive fluency calibration dispatch ready*',
    `Channel: ${report.channel}`,
    `Source report: ${report.source.generatedAt ?? 'n/a'}`,
    '',
    '*Executive summary*',
    `- ${executiveSummary}`,
    '',
    '*Audit candidates*',
    ...candidateLines,
    '',
    '*Next step*',
    '- Run Page Experience Auditor on these routes using the attached calibration prompt artifact.',
  ].join('\n')
}

async function main() {
  if (!fs.existsSync(cognitiveReportPath)) {
    throw new Error(`Missing cognitive report: ${cognitiveReportPath}`)
  }

  const cognitive = JSON.parse(fs.readFileSync(cognitiveReportPath, 'utf8'))
  const gradeMovers = loadGradeMovers()
  const pages = (cognitive.pages ?? []).map((page) => ({
    ...page,
    severityScore: combinedSeverityScore(page),
    reason: buildCandidateReason(page),
  }))

  const thresholdFailing = pages.filter((page) => page.thresholds?.load?.pass === false || page.thresholds?.fluency?.pass === false)
  const worstOverall = [...pages]
    .sort((a, b) => b.severityScore - a.severityScore || a.route.localeCompare(b.route))
    .slice(0, 5)
  const moverPages = gradeMovers
    .map((mover) => {
      const page = pages.find((candidate) => candidate.route === mover.route)
      if (!page) return null
      return {
        ...page,
        reason: `${page.reason}; grade-band movement detected (loadΔ=${mover.loadDelta}, fluencyΔ=${mover.fluencyDelta})`,
      }
    })
    .filter(Boolean)

  const selected = []
  const seen = new Set()
  for (const page of [...thresholdFailing, ...moverPages, ...worstOverall]) {
    if (seen.has(page.route)) continue
    seen.add(page.route)
    selected.push(page)
  }

  const candidates = selected.slice(0, 8).map((page) => ({
    route: page.route,
    tier: page.tier,
    severityScore: page.severityScore,
    reason: page.reason,
    loadGrade: page.grade,
    fluencyGrade: page.fluency?.grade ?? null,
    fluencyScore: page.fluency?.score ?? null,
  }))

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    source: {
      generatedAt: cognitive.generatedAt ?? null,
      totalPages: cognitive.totalPages ?? null,
      totalIssues: cognitive.totalIssues ?? null,
      sesVersion: cognitive.sesVersion ?? null,
    },
    gradeMovers: gradeMovers.slice(0, 20),
    candidates,
    auditorPrompt: buildAuditorPrompt({ candidates }),
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  const posted = await postSlackText({ webhookUrl: slackWebhook, text: buildSlackText(report) })
  if (!posted) console.log('No Slack webhook configured; skipping Slack post.')

  console.log(`Cognitive fluency calibration dispatch completed (${candidates.length} candidates).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  process.exit(1)
})
