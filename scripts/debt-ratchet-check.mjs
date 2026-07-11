#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { ESLint } from 'eslint'

const ROOT = process.cwd()
const BASELINE_PATH = path.join(ROOT, 'docs', 'status', 'debt-ratchet.baseline.json')
const OUT_JSON = path.join(ROOT, 'docs', 'status', 'debt-ratchet.latest.json')
const OUT_MD = path.join(ROOT, 'docs', 'status', 'debt-ratchet.latest.md')
const SOURCE_DIRS = ['src', 'scripts', 'worker', 'tests']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const TEST_FILE_RE = /\.(test|spec)\.[cm]?[jt]sx?$/
const PLACEHOLDER_PATTERNS = [
  /placeholder coverage/i,
  /marks module as covered for council traceability/i,
  /expect\(\s*true\s*\)\.toBe\(\s*true\s*\)/i,
]
const METRIC_ORDER = ['placeholderCount', 'lintWarnings', 'anyCount', 'maxFileLines', 'filesOver800']

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'coverage') {
        continue
      }
      files.push(...walk(fullPath))
      continue
    }

    if (!entry.isFile()) continue
    if (!EXTENSIONS.has(path.extname(entry.name))) continue
    files.push(fullPath)
  }

  return files
}

function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    throw new Error(`Missing baseline: ${BASELINE_PATH}`)
  }

  const parsed = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
  const metrics = parsed?.metrics ?? {}

  for (const key of METRIC_ORDER) {
    if (!Number.isFinite(Number(metrics[key]))) {
      throw new Error(`Invalid baseline metric: ${key}`)
    }
  }

  return {
    ...parsed,
    metrics: Object.fromEntries(METRIC_ORDER.map((key) => [key, Number(metrics[key])])),
  }
}

function gatherFileStats() {
  const allFiles = SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  let placeholderCount = 0
  let maxFileLines = 0
  let filesOver800 = 0

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split(/\r?\n/).length

    if (lines > maxFileLines) {
      maxFileLines = lines
    }
    if (lines > 800) {
      filesOver800 += 1
    }

    const relativePath = rel(filePath)
    if (!TEST_FILE_RE.test(relativePath)) continue
    if (PLACEHOLDER_PATTERNS.some((re) => re.test(content))) {
      placeholderCount += 1
    }
  }

  return { placeholderCount, maxFileLines, filesOver800 }
}

function summarizeLint(report) {
  let warnings = 0
  let errors = 0

  for (const file of report) {
    warnings += file.warningCount ?? 0
    errors += file.errorCount ?? 0
  }

  return { warnings, errors }
}

function countAnyViolations(report) {
  let total = 0

  for (const file of report) {
    for (const message of file.messages ?? []) {
      if (message.ruleId === '@typescript-eslint/no-explicit-any') {
        total += 1
      }
    }
  }

  return total
}

function isTruthy(value) {
  return typeof value === 'string' && /^(1|true|yes)$/i.test(value.trim())
}

function toMarkdown(result) {
  const rows = METRIC_ORDER.map((key) => {
    const baselineValue = result.baseline.metrics[key]
    const currentValue = result.current.metrics[key]
    const trend = currentValue > baselineValue ? 'regressed' : currentValue < baselineValue ? 'improved' : 'flat'
    return `| ${key} | ${baselineValue} | ${currentValue} | ${trend} |`
  })

  const lines = [
    '# Debt Ratchet Report',
    '',
    `Generated: ${result.generatedAt}`,
    `Outcome: ${result.passed ? 'pass' : 'fail'}`,
    '',
    '## Metrics',
    '',
    '| Metric | Baseline | Current | Trend |',
    '| --- | ---: | ---: | --- |',
    ...rows,
    '',
    `Lint errors: ${result.current.lintErrors}`,
    `Baseline updated: ${result.baselineUpdated ? 'yes' : 'no'}`,
    '',
  ]

  if (result.regressions.length > 0) {
    lines.push('## Regressions')
    lines.push('')
    for (const item of result.regressions) {
      lines.push(`- ${item.metric}: baseline=${item.baseline}, current=${item.current}`)
    }
    lines.push('')
  }

  if (result.improvements.length > 0) {
    lines.push('## Improvements')
    lines.push('')
    for (const item of result.improvements) {
      lines.push(`- ${item.metric}: baseline=${item.baseline} -> current=${item.current}`)
    }
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

async function postSlack(result) {
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (!webhook) return

  const summary = METRIC_ORDER
    .map((key) => `${key}: ${result.current.metrics[key]} (baseline ${result.baseline.metrics[key]})`)
    .join('\n')

  const text = [
    ':bar_chart: Weekly debt ratchet report',
    `Outcome: ${result.passed ? 'PASS' : 'FAIL'}`,
    summary,
    result.regressions.length > 0 ? '' : 'No debt metric regressions detected.',
    ...result.regressions.map((item) => `• Regression: ${item.metric} ${item.baseline} -> ${item.current}`),
  ].filter(Boolean).join('\n')

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    console.log(`slack post: ${response.status}`)
  } catch (error) {
    console.error(`slack post failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function main() {
  const baseline = readBaseline()
  const fileStats = gatherFileStats()
  const overrideEnabled = isTruthy(process.env.DEBT_RATCHET_OVERRIDE)

  const lintEslint = new ESLint({ cache: false })
  const lintReport = await lintEslint.lintFiles(['src', 'scripts', 'worker', 'tests'])
  const lintSummary = summarizeLint(lintReport)

  const anyEslint = new ESLint({
    cache: false,
    overrideConfig: {
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
  })
  const anyReport = await anyEslint.lintFiles(['src/**/*.{ts,tsx,mts,cts}'])
  const anyCount = countAnyViolations(anyReport)

  const currentMetrics = {
    placeholderCount: fileStats.placeholderCount,
    lintWarnings: lintSummary.warnings,
    anyCount,
    maxFileLines: fileStats.maxFileLines,
    filesOver800: fileStats.filesOver800,
  }

  const regressions = []
  const improvements = []
  const nextBaseline = { ...baseline.metrics }

  for (const metric of METRIC_ORDER) {
    const currentValue = currentMetrics[metric]
    const baselineValue = baseline.metrics[metric]

    if (currentValue > baselineValue) {
      regressions.push({ metric, baseline: baselineValue, current: currentValue })
      if (overrideEnabled) {
        nextBaseline[metric] = currentValue
      }
    } else if (currentValue < baselineValue) {
      improvements.push({ metric, baseline: baselineValue, current: currentValue })
      nextBaseline[metric] = currentValue
    }
  }

  if (lintSummary.errors > 0) {
    regressions.push({ metric: 'lintErrors', baseline: 0, current: lintSummary.errors })
  }

  const baselineUpdated = METRIC_ORDER.some((metric) => nextBaseline[metric] !== baseline.metrics[metric])

  if (baselineUpdated) {
    fs.writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          metrics: nextBaseline,
          notes: overrideEnabled
            ? 'Auto-updated by debt-ratchet-check.mjs with DEBT_RATCHET_OVERRIDE enabled.'
            : 'Auto-lowered by debt-ratchet-check.mjs after metric improvements.',
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
  }

  const passed = regressions.length === 0 || (overrideEnabled && regressions.every((r) => r.metric !== 'lintErrors'))

  const result = {
    generatedAt: new Date().toISOString(),
    passed,
    baseline: { metrics: baseline.metrics },
    current: {
      metrics: currentMetrics,
      lintErrors: lintSummary.errors,
    },
    regressions,
    improvements,
    baselineUpdated,
    overrideEnabled,
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, toMarkdown(result), 'utf8')

  console.log('debt-ratchet summary')
  console.log(`- passed: ${passed}`)
  for (const metric of METRIC_ORDER) {
    console.log(`- ${metric}: ${currentMetrics[metric]} (baseline ${baseline.metrics[metric]})`)
  }
  console.log(`- lint errors: ${lintSummary.errors}`)
  console.log(`- baseline updated: ${baselineUpdated ? 'yes' : 'no'}`)

  await postSlack(result)

  if (!passed) {
    if (regressions.length > 0) {
      console.error('Debt ratchet regressions detected:')
      for (const row of regressions) {
        console.error(`  - ${row.metric}: baseline=${row.baseline}, current=${row.current}`)
      }
      if (!overrideEnabled) {
        console.error('Set DEBT_RATCHET_OVERRIDE=true only for explicitly approved baseline increases.')
      }
    }
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('debt-ratchet-check failed:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
