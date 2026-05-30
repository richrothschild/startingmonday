#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const GOLDEN_SET_PATH = path.join(process.cwd(), 'src', 'evals', 'prep_brief_golden_set.json')
const BASELINE_PATH = path.join(process.cwd(), 'docs', 'status', 'prep-confidence-calibration.baseline.json')
const OUTPUT_JSON_PATH = path.join(process.cwd(), 'docs', 'status', 'prep-confidence-calibration.latest.json')
const OUTPUT_MD_PATH = path.join(process.cwd(), 'docs', 'status', 'prep-confidence-calibration.latest.md')

const REQUIRED_SECTIONS = [
  'Bottom Line',
  'The Situation',
  'Win Thesis',
  'Anticipated Pushback',
  'Likely Questions',
]

const DEFAULT_THRESHOLD = 65
const MIN_ACCURACY = 0.8
const MIN_SCORE_GAP = 5
const MAX_ACCURACY_DRIFT = 0.08
const MAX_SCORE_GAP_DRIFT = 8

function parseArgs(argv) {
  const args = argv.slice(2)
  let threshold = DEFAULT_THRESHOLD

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--threshold' && args[i + 1]) {
      const parsed = Number(args[i + 1])
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
        threshold = parsed
      }
      i += 1
    }
  }

  const argSet = new Set(args)
  return {
    threshold,
    json: argSet.has('--json'),
    markdown: argSet.has('--markdown'),
    summary: argSet.has('--summary'),
    strict: argSet.has('--strict'),
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function extractClaims(outputText) {
  if (typeof outputText !== 'string') return []

  const lines = outputText.split('\n')
  const claims = []

  for (const rawLine of lines) {
    const claimText = String(rawLine ?? '')
      .replace(/^[-*]\s+/, '')
      .replace(/^\d+[.)]\s+/, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!claimText) continue
    if (claimText.startsWith('#')) continue
    if (claimText.length < 24) continue
    claims.push(claimText)

    if (claims.length >= 80) break
  }

  return claims
}

function inferOriginClass(claimText) {
  const text = claimText.toLowerCase()

  if (
    text.includes('candidate') ||
    text.includes('your resume') ||
    text.includes('verified') ||
    text.includes('career history') ||
    text.includes('star story')
  ) {
    return 'user_provided'
  }

  if (
    text.includes('signal') ||
    text.includes('scan') ||
    text.includes('pipeline') ||
    text.includes('company notes') ||
    text.includes('interview notes') ||
    text.includes('contact') ||
    text.includes('document')
  ) {
    return 'system_detected'
  }

  return 'inferred'
}

function scoreOutput(outputText) {
  const text = typeof outputText === 'string' ? outputText : ''
  const claims = extractClaims(text)
  const inferredCount = claims.filter((claim) => inferOriginClass(claim) === 'inferred').length

  const structuredSections = REQUIRED_SECTIONS.filter((section) => text.includes(`## ${section}`)).length
  const provenanceCoverage = claims.length > 0 ? 1 : 0
  const inferredShare = claims.length > 0 ? inferredCount / claims.length : 1
  const inferredSharePenalty = Math.round(inferredShare * 20)

  let score = 45
  score += Math.round((structuredSections / REQUIRED_SECTIONS.length) * 30)
  score += Math.round(provenanceCoverage * 25)
  score -= inferredSharePenalty

  return clamp(score, 0, 100)
}

function safeAverage(values) {
  if (!Array.isArray(values) || values.length === 0) return 0
  const sum = values.reduce((acc, value) => acc + value, 0)
  return Number((sum / values.length).toFixed(2))
}

function loadJsonArray(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array JSON at ${filePath}`)
  }
  return parsed
}

function loadOptionalJson(filePath) {
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

function evaluate(records, threshold) {
  const confusion = {
    tp: 0,
    tn: 0,
    fp: 0,
    fn: 0,
  }

  const passScores = []
  const failScores = []

  for (const record of records) {
    const expectedPass = record?.pass === true
    const score = scoreOutput(record?.output)
    const predictedPass = score >= threshold

    if (expectedPass) passScores.push(score)
    else failScores.push(score)

    if (predictedPass && expectedPass) confusion.tp += 1
    if (!predictedPass && !expectedPass) confusion.tn += 1
    if (predictedPass && !expectedPass) confusion.fp += 1
    if (!predictedPass && expectedPass) confusion.fn += 1
  }

  const total = records.length
  const accuracy = total === 0 ? 0 : Number(((confusion.tp + confusion.tn) / total).toFixed(4))
  const precisionDen = confusion.tp + confusion.fp
  const recallDen = confusion.tp + confusion.fn
  const precision = precisionDen === 0 ? 0 : Number((confusion.tp / precisionDen).toFixed(4))
  const recall = recallDen === 0 ? 0 : Number((confusion.tp / recallDen).toFixed(4))
  const meanPassScore = safeAverage(passScores)
  const meanFailScore = safeAverage(failScores)
  const scoreGap = Number((meanPassScore - meanFailScore).toFixed(2))

  return {
    total,
    threshold,
    confusion,
    accuracy,
    precision,
    recall,
    meanPassScore,
    meanFailScore,
    scoreGap,
  }
}

function driftStatus(current, baseline) {
  if (!baseline || typeof baseline !== 'object') {
    return {
      hasBaseline: false,
      accuracyDelta: 0,
      scoreGapDelta: 0,
      breach: false,
    }
  }

  const baselineAccuracy = Number(baseline.accuracy ?? 0)
  const baselineScoreGap = Number(baseline.scoreGap ?? 0)
  const accuracyDelta = Number((current.accuracy - baselineAccuracy).toFixed(4))
  const scoreGapDelta = Number((current.scoreGap - baselineScoreGap).toFixed(2))
  const breach = accuracyDelta < -MAX_ACCURACY_DRIFT || scoreGapDelta < -MAX_SCORE_GAP_DRIFT

  return {
    hasBaseline: true,
    baselineAccuracy,
    baselineScoreGap,
    accuracyDelta,
    scoreGapDelta,
    breach,
  }
}

function toMarkdown(result) {
  const lines = [
    '# Prep Confidence Calibration Audit',
    '',
    `- Generated at: ${result.generatedAt}`,
    `- Golden set path: ${result.goldenSetPath}`,
    `- Records: ${result.metrics.total}`,
    `- Threshold: ${result.metrics.threshold}`,
    `- Accuracy: ${result.metrics.accuracy}`,
    `- Precision: ${result.metrics.precision}`,
    `- Recall: ${result.metrics.recall}`,
    `- Mean pass score: ${result.metrics.meanPassScore}`,
    `- Mean fail score: ${result.metrics.meanFailScore}`,
    `- Score gap: ${result.metrics.scoreGap}`,
    `- Drift baseline present: ${result.drift.hasBaseline ? 'yes' : 'no'}`,
    `- Drift breach: ${result.drift.breach ? 'yes' : 'no'}`,
    `- Status: ${result.status}`,
    '',
    '## Confusion Matrix',
    '',
    `- true_positive: ${result.metrics.confusion.tp}`,
    `- true_negative: ${result.metrics.confusion.tn}`,
    `- false_positive: ${result.metrics.confusion.fp}`,
    `- false_negative: ${result.metrics.confusion.fn}`,
  ]

  if (result.drift.hasBaseline) {
    lines.push('', '## Drift', '')
    lines.push(`- baseline_accuracy: ${result.drift.baselineAccuracy}`)
    lines.push(`- baseline_score_gap: ${result.drift.baselineScoreGap}`)
    lines.push(`- accuracy_delta: ${result.drift.accuracyDelta}`)
    lines.push(`- score_gap_delta: ${result.drift.scoreGapDelta}`)
  }

  return `${lines.join('\n')}\n`
}

function computeStatus(metrics, drift) {
  if (metrics.accuracy < MIN_ACCURACY) return 'FAIL'
  if (metrics.scoreGap < MIN_SCORE_GAP) return 'FAIL'
  if (drift.breach) return 'FAIL'
  return 'PASS'
}

function main() {
  const { threshold, json, markdown, summary, strict } = parseArgs(process.argv)
  const records = loadJsonArray(GOLDEN_SET_PATH)
  const metrics = evaluate(records, threshold)
  const baseline = loadOptionalJson(BASELINE_PATH)
  const drift = driftStatus(metrics, baseline)
  const status = computeStatus(metrics, drift)
  const generatedAt = new Date().toISOString()

  const result = {
    generatedAt,
    goldenSetPath: GOLDEN_SET_PATH,
    baselinePath: BASELINE_PATH,
    metrics,
    drift,
    guardrails: {
      minAccuracy: MIN_ACCURACY,
      minScoreGap: MIN_SCORE_GAP,
      maxAccuracyDrift: MAX_ACCURACY_DRIFT,
      maxScoreGapDrift: MAX_SCORE_GAP_DRIFT,
    },
    status,
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON_PATH, `${JSON.stringify(result, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD_PATH, toMarkdown(result))

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else if (markdown) {
    process.stdout.write(toMarkdown(result))
  } else if (summary) {
    console.log(
      `status=${result.status} accuracy=${result.metrics.accuracy} score_gap=${result.metrics.scoreGap} ` +
      `drift_breach=${result.drift.breach} generated_at=${result.generatedAt}`,
    )
  } else {
    console.log('Prep confidence calibration audit')
    console.log('-------------------------------')
    console.log(`Status: ${result.status}`)
    console.log(`Accuracy: ${result.metrics.accuracy}`)
    console.log(`Score gap: ${result.metrics.scoreGap}`)
    if (result.drift.hasBaseline) {
      console.log(`Accuracy delta vs baseline: ${result.drift.accuracyDelta}`)
      console.log(`Score gap delta vs baseline: ${result.drift.scoreGapDelta}`)
    }
  }

  if (strict && result.status !== 'PASS') {
    process.exitCode = 1
  }
}

main()
