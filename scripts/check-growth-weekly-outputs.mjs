#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DOCS_GROWTH = path.join(ROOT, 'docs', 'growth')
const METRICS_PATH = path.join(DOCS_GROWTH, 'weekly-metrics.latest.json')
const READOUT_PATH = path.join(DOCS_GROWTH, 'weekly-readout.latest.md')
const DECISION_LOG_PATH = path.join(DOCS_GROWTH, 'weekly-decision-log.md')
const OUT_JSON = path.join(ROOT, 'docs', 'growth-weekly-outputs.latest.json')
const OUT_MD = path.join(ROOT, 'docs', 'growth-weekly-outputs.latest.md')
const MAX_AGE_MS = 8 * 24 * 60 * 60 * 1000

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  const strict = args.has('--strict')
  return {
    strict,
    json: args.has('--json'),
    writeArtifacts: args.has('--write-artifacts') || !strict,
  }
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function isoWeekFromDate(input) {
  const date = new Date(input)
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7)
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function writeOutputs(result) {
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`)

  const lines = [
    '# Growth Weekly Outputs Check',
    '',
    `Status: ${result.status}`,
    `Checked at: ${result.checkedAt}`,
    `Expected ISO week: ${result.expectedWeek}`,
    '',
    '## Checks',
  ]

  for (const check of result.checks) {
    lines.push(`- ${check.name}: ${check.status}${check.detail ? ` (${check.detail})` : ''}`)
  }

  lines.push('', '## Failures')
  if (result.failures.length === 0) {
    lines.push('- none')
  } else {
    for (const failure of result.failures) lines.push(`- ${failure}`)
  }

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`)
}

function main() {
  const args = parseArgs(process.argv)
  const failures = []
  const checks = []

  for (const filePath of [METRICS_PATH, READOUT_PATH, DECISION_LOG_PATH]) {
    if (!fs.existsSync(filePath)) {
      failures.push(`Missing required artifact: ${path.relative(ROOT, filePath).replace(/\\/g, '/')}`)
    }
  }

  let expectedWeek = 'unknown'

  if (failures.length === 0) {
    const metrics = JSON.parse(readUtf8(METRICS_PATH))
    const readout = readUtf8(READOUT_PATH)
    const decisionLog = readUtf8(DECISION_LOG_PATH)

    expectedWeek = isoWeekFromDate(metrics.window_end_iso ?? metrics.period_end ?? metrics.exported_at)

    const exportedAt = Date.parse(metrics.exported_at)
    if (!Number.isFinite(exportedAt)) {
      failures.push('weekly-metrics.latest.json exported_at is invalid')
      checks.push({ name: 'metrics-exported-at', status: 'FAIL', detail: 'invalid timestamp' })
    } else {
      const ageMs = Date.now() - exportedAt
      const status = ageMs <= MAX_AGE_MS ? 'PASS' : 'FAIL'
      checks.push({ name: 'metrics-freshness', status, detail: `age ${(ageMs / 86400000).toFixed(1)}d` })
      if (status === 'FAIL') failures.push('weekly-metrics.latest.json is older than 8 days')
    }

    const readoutStat = fs.statSync(READOUT_PATH)
    const readoutAgeMs = Date.now() - readoutStat.mtimeMs
    const readoutFresh = readoutAgeMs <= MAX_AGE_MS
    checks.push({ name: 'readout-freshness', status: readoutFresh ? 'PASS' : 'FAIL', detail: `age ${(readoutAgeMs / 86400000).toFixed(1)}d` })
    if (!readoutFresh) failures.push('weekly-readout.latest.md is older than 8 days')

    const readoutHasWeek = readout.includes(`ISO week: ${expectedWeek}`)
    checks.push({ name: 'readout-week', status: readoutHasWeek ? 'PASS' : 'FAIL', detail: expectedWeek })
    if (!readoutHasWeek) failures.push(`weekly-readout.latest.md does not include ISO week ${expectedWeek}`)

    const readoutLinksDecisionLog = readout.includes('weekly-decision-log.md')
    checks.push({ name: 'readout-links-decision-log', status: readoutLinksDecisionLog ? 'PASS' : 'FAIL' })
    if (!readoutLinksDecisionLog) failures.push('weekly-readout.latest.md does not link to weekly-decision-log.md')

    const decisionLogHasWeek = decisionLog.includes(`## ${expectedWeek}`)
    checks.push({ name: 'decision-log-week', status: decisionLogHasWeek ? 'PASS' : 'FAIL', detail: expectedWeek })
    if (!decisionLogHasWeek) failures.push(`weekly-decision-log.md does not include section ${expectedWeek}`)

    const decisionLogLinksReadout = decisionLog.includes('weekly-readout.latest.md')
    checks.push({ name: 'decision-log-links-readout', status: decisionLogLinksReadout ? 'PASS' : 'FAIL' })
    if (!decisionLogLinksReadout) failures.push('weekly-decision-log.md does not link back to weekly-readout.latest.md')
  }

  const result = {
    checkedAt: new Date().toISOString(),
    status: failures.length === 0 ? 'PASS' : 'FAIL',
    expectedWeek,
    checks,
    failures,
  }

  if (args.writeArtifacts) writeOutputs(result)

  if (args.json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log('Growth weekly outputs check')
    console.log('---------------------------')
    console.log(`Status: ${result.status}`)
    console.log(`Expected ISO week: ${result.expectedWeek}`)
    for (const check of checks) {
      console.log(`- ${check.name}: ${check.status}${check.detail ? ` (${check.detail})` : ''}`)
    }
    if (failures.length > 0) {
      for (const failure of failures) console.log(`- ${failure}`)
    }
  }

  if (args.strict && failures.length > 0) {
    process.exit(2)
  }
}

main()
