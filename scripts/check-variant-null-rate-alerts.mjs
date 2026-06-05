#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_THRESHOLD = 1.0

function parseArgs(argv) {
  const args = argv.slice(2)
  let threshold = DEFAULT_THRESHOLD
  let strict = false
  let inputPath = path.join(process.cwd(), 'docs', 'growth', 'route-variant-metrics.latest.json')

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]
    if (current === '--strict') strict = true
    if (current === '--threshold' && args[index + 1]) {
      const candidate = Number.parseFloat(args[index + 1])
      if (Number.isFinite(candidate) && candidate >= 0) {
        threshold = candidate
      }
    }
    if (current === '--input' && args[index + 1]) {
      inputPath = path.resolve(process.cwd(), args[index + 1])
    }
  }

  return { threshold, strict, inputPath }
}

function loadEntries(inputPath) {
  if (!fs.existsSync(inputPath)) {
    return []
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
    if (!Array.isArray(parsed.entries)) return []
    return parsed.entries
  } catch {
    return []
  }
}

function computeNullRatePercent(entry) {
  if (!entry || typeof entry !== 'object') return null

  if (typeof entry.variant_key_null_pct === 'number' && Number.isFinite(entry.variant_key_null_pct)) {
    return entry.variant_key_null_pct
  }

  const missing = typeof entry.variant_key_missing_events === 'number' ? entry.variant_key_missing_events : null
  const total = typeof entry.total_events === 'number' ? entry.total_events : null

  if (missing === null || total === null || total <= 0) {
    return null
  }

  return (missing / total) * 100
}

function evaluate(entries, threshold) {
  const breaches = []
  const evaluated = []

  for (const entry of entries) {
    const route = typeof entry.route === 'string' ? entry.route : 'unknown'
    const variantKey = typeof entry.variant_key === 'string' ? entry.variant_key : 'unknown'
    const nullRatePercent = computeNullRatePercent(entry)
    const sampleSize = typeof entry.total_events === 'number' ? entry.total_events : null
    const status = nullRatePercent !== null && nullRatePercent > threshold ? 'BREACH' : 'OK'

    const detail = { route, variantKey, nullRatePercent, sampleSize, status }
    evaluated.push(detail)

    if (status === 'BREACH') {
      breaches.push(detail)
    }
  }

  return { breaches, evaluated }
}

function writeAlerts(result, threshold) {
  const docsDir = path.join(process.cwd(), 'docs')
  const alertsDir = path.join(docsDir, 'alerts')
  fs.mkdirSync(alertsDir, { recursive: true })

  const payload = {
    checked_at: new Date().toISOString(),
    threshold_percent: threshold,
    status: result.breaches.length > 0 ? 'ALERT' : 'PASS',
    breach_count: result.breaches.length,
    evaluated_count: result.evaluated.length,
    breaches: result.breaches,
  }

  const jsonPath = path.join(alertsDir, 'variant-null-rate-alerts.latest.json')
  const mdPath = path.join(alertsDir, 'variant-null-rate-alerts.latest.md')

  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`)

  const lines = [
    '# Variant Null-Rate Alerts',
    '',
    `Status: ${payload.status}`,
    `Checked at: ${payload.checked_at}`,
    `Threshold: ${threshold}%`,
    '',
    '## Breaches',
  ]

  if (result.breaches.length === 0) {
    lines.push('- none')
  } else {
    for (const breach of result.breaches) {
      lines.push(
        `- route=${breach.route}, variant=${breach.variantKey}, null_rate_pct=${breach.nullRatePercent?.toFixed(2) ?? 'n/a'}, sample=${breach.sampleSize ?? 'n/a'}`
      )
    }
  }

  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`)

  return { jsonPath, mdPath, status: payload.status }
}

function main() {
  const { threshold, strict, inputPath } = parseArgs(process.argv)
  const entries = loadEntries(inputPath)
  const result = evaluate(entries, threshold)
  const output = writeAlerts(result, threshold)

  console.log('Variant null-rate alert check')
  console.log('-----------------------------')
  console.log(`Input: ${inputPath}`)
  console.log(`Evaluated entries: ${result.evaluated.length}`)
  console.log(`Breaches: ${result.breaches.length}`)
  console.log(`Status: ${output.status}`)
  console.log(`JSON: ${output.jsonPath}`)
  console.log(`Markdown: ${output.mdPath}`)

  if (strict && result.breaches.length > 0) {
    process.exit(2)
  }
}

main()
