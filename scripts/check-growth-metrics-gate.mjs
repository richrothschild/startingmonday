#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const THRESHOLDS = {
  qualified_signup_rate: { min: 0.06 },
  hero_cta_ctr: { min: 0.1 },
  form_start_rate: { min: 0.2 },
  form_completion_rate: { min: 0.45 },
  bounce_rate: { max: 0.55 },
  median_engaged_time_seconds: { min: 45 },
  scroll_depth_75_rate: { min: 0.3 },
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    strict: args.has('--strict'),
    json: args.has('--json'),
  }
}

function loadMetrics() {
  const override = process.env.GROWTH_WEEKLY_METRICS_FILE?.trim()
  const defaultPath = path.join(process.cwd(), 'docs', 'growth', 'weekly-metrics.latest.json')
  const metricsPath = override ? path.resolve(process.cwd(), override) : defaultPath

  if (!fs.existsSync(metricsPath)) {
    throw new Error(`Metrics file not found: ${metricsPath}`)
  }

  const parsed = JSON.parse(fs.readFileSync(metricsPath, 'utf8'))
  return { metricsPath, parsed }
}

function evaluate(metrics) {
  const failures = []
  const checks = []

  if (metrics.source !== 'posthog') {
    failures.push('source must be posthog')
  }

  if (typeof metrics.exported_at !== 'string') {
    failures.push('exported_at is missing')
  } else {
    const exportedAt = Date.parse(metrics.exported_at)
    if (!Number.isFinite(exportedAt)) {
      failures.push('exported_at is not a valid ISO timestamp')
    } else {
      const ageMs = Date.now() - exportedAt
      const maxAgeMs = 8 * 24 * 60 * 60 * 1000
      if (ageMs > maxAgeMs) {
        failures.push('exported_at is older than 8 days')
      }
    }
  }

  for (const [metricName, threshold] of Object.entries(THRESHOLDS)) {
    const value = metrics[metricName]
    if (typeof value !== 'number' || Number.isNaN(value)) {
      failures.push(`${metricName} is missing or non-numeric`)
      checks.push({ metric: metricName, value: null, status: 'FAIL', threshold })
      continue
    }

    let pass = true
    if (typeof threshold.min === 'number' && value < threshold.min) {
      pass = false
      failures.push(`${metricName}=${value} is below minimum ${threshold.min}`)
    }
    if (typeof threshold.max === 'number' && value > threshold.max) {
      pass = false
      failures.push(`${metricName}=${value} is above maximum ${threshold.max}`)
    }

    checks.push({ metric: metricName, value, status: pass ? 'PASS' : 'FAIL', threshold })
  }

  const sectionDwell = metrics.section_dwell_median_ms
  if (!sectionDwell || typeof sectionDwell !== 'object') {
    failures.push('section_dwell_median_ms is missing')
  } else {
    const requiredSections = ['clarity_block', 'proof_block', 'how_it_works_block', 'objection_block', 'final_cta_block']
    for (const section of requiredSections) {
      const dwell = sectionDwell[section]
      if (typeof dwell !== 'number' || dwell < 1500) {
        failures.push(`section_dwell_median_ms.${section} must be >= 1500`)
      }
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    status: failures.length === 0 ? 'PASS' : 'FAIL',
    checks,
    failures,
  }
}

function writeOutputs(result) {
  const docsDir = path.join(process.cwd(), 'docs')
  const jsonPath = path.join(docsDir, 'growth-metrics-gate.latest.json')
  const mdPath = path.join(docsDir, 'growth-metrics-gate.latest.md')

  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`)

  const lines = [
    '# Growth Metrics Gate',
    '',
    `Status: ${result.status}`,
    `Checked at: ${result.checkedAt}`,
    '',
    '## Checks',
  ]

  for (const check of result.checks) {
    const min = typeof check.threshold.min === 'number' ? `min ${check.threshold.min}` : null
    const max = typeof check.threshold.max === 'number' ? `max ${check.threshold.max}` : null
    const threshold = [min, max].filter(Boolean).join(', ')
    lines.push(`- ${check.metric}: ${check.status} (value: ${check.value ?? 'n/a'}, threshold: ${threshold})`)
  }

  lines.push('', '## Failures')
  if (result.failures.length === 0) {
    lines.push('- none')
  } else {
    for (const failure of result.failures) {
      lines.push(`- ${failure}`)
    }
  }

  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`)
}

function main() {
  const args = parseArgs(process.argv)
  const { metricsPath, parsed } = loadMetrics()
  const result = evaluate(parsed)
  result.metricsPath = metricsPath

  writeOutputs(result)

  if (args.json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log('Growth Metrics Gate')
    console.log('-------------------')
    console.log(`Metrics file: ${metricsPath}`)
    console.log(`Status: ${result.status}`)
    if (result.failures.length > 0) {
      for (const failure of result.failures) {
        console.log(`- ${failure}`)
      }
    }
  }

  if (args.strict && result.failures.length > 0) {
    process.exit(2)
  }
}

main()
