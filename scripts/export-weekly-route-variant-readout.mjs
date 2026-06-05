#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROUTE_VARIANTS = [
  { route: '/', variant_key: 'executive_proof_v1' },
  { route: '/', variant_key: 'executive_proof_v2' },
  { route: '/for-executives', variant_key: 'executive_proof_v1' },
  { route: '/for-executives', variant_key: 'executive_proof_v2' },
  { route: '/for-cio', variant_key: 'executive_proof_v1' },
  { route: '/for-cio', variant_key: 'executive_proof_v2' },
  { route: '/for-cdo', variant_key: 'executive_proof_v1' },
  { route: '/for-cdo', variant_key: 'executive_proof_v2' },
  { route: '/for-ciso', variant_key: 'executive_proof_v1' },
  { route: '/for-ciso', variant_key: 'executive_proof_v2' },
  { route: '/for-cpo', variant_key: 'executive_proof_v1' },
  { route: '/for-cpo', variant_key: 'executive_proof_v2' },
  { route: '/coaches', variant_key: 'coach_bluf_v1' },
  { route: '/coaches', variant_key: 'coach_bluf_v2' },
  { route: '/for-coaches', variant_key: 'coach_bluf_v1' },
  { route: '/for-coaches', variant_key: 'coach_bluf_v2' },
]

function parseArgs(argv) {
  const args = argv.slice(2)
  let inputPath = path.join(process.cwd(), 'docs', 'growth', 'route-variant-metrics.latest.json')
  let outputDir = path.join(process.cwd(), 'docs', 'strategy', 'week4')
  let strict = false

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]
    if (current === '--strict') strict = true
    if (current === '--input' && args[index + 1]) inputPath = path.resolve(process.cwd(), args[index + 1])
    if (current === '--output-dir' && args[index + 1]) outputDir = path.resolve(process.cwd(), args[index + 1])
  }

  return { inputPath, outputDir, strict }
}

function loadMetrics(filePath) {
  if (!fs.existsSync(filePath)) {
    return { entries: [], metadata: { source: 'template', note: 'metrics file missing; template rows generated' } }
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const entries = Array.isArray(parsed.entries) ? parsed.entries : []
    return { entries, metadata: parsed.metadata ?? { source: 'custom' } }
  } catch {
    return { entries: [], metadata: { source: 'template', note: 'metrics file unreadable; template rows generated' } }
  }
}

function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function buildLookup(entries) {
  const lookup = new Map()
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const route = typeof entry.route === 'string' ? entry.route : null
    const variantKey = typeof entry.variant_key === 'string' ? entry.variant_key : null
    if (!route || !variantKey) continue
    lookup.set(`${route}::${variantKey}`, entry)
  }
  return lookup
}

function trendLabel(deltaPercent) {
  if (deltaPercent === null) return 'TBD'
  if (deltaPercent > 0) return `+${deltaPercent.toFixed(1)}%`
  return `${deltaPercent.toFixed(1)}%`
}

function statusLabel(deltaPercent) {
  if (deltaPercent === null) return 'Pending data'
  if (deltaPercent <= -15) return 'Rollback trigger'
  if (deltaPercent <= -10) return 'Iterate trigger'
  return 'Keep live'
}

function buildRows(entries) {
  const byRouteVariant = buildLookup(entries)

  return ROUTE_VARIANTS.map((spec) => {
    const found = byRouteVariant.get(`${spec.route}::${spec.variant_key}`)
    const ctaClicks = asNumber(found?.cta_clicks)
    const personaSelections = asNumber(found?.persona_route_selects)
    const trustInteractions = asNumber(found?.trust_interactions)
    const trendDeltaPercent = asNumber(found?.trend_delta_pct)

    return {
      route: spec.route,
      variantKey: spec.variant_key,
      ctaClicks,
      personaSelections,
      trustInteractions,
      trendDeltaPercent,
      status: statusLabel(trendDeltaPercent),
    }
  })
}

function toDisplay(value, allowNA = false) {
  if (value === null) return allowNA ? 'N/A' : 'TBD'
  return String(value)
}

function writeMarkdown(outputDir, rows, metadata, strict) {
  fs.mkdirSync(outputDir, { recursive: true })

  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  const datedFile = path.join(outputDir, `weekly-route-variant-readout-${today}.md`)
  const latestFile = path.join(outputDir, 'weekly-route-variant-readout.latest.md')

  const tableLines = [
    '| Route | Variant key | CTA clicks | Persona route selects | Trust interactions | 7d trend vs prior | Status |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ]

  for (const row of rows) {
    const personaValue = row.route.includes('/for-c') ? toDisplay(row.personaSelections, true) : toDisplay(row.personaSelections)
    tableLines.push(
      `| ${row.route} | ${row.variantKey} | ${toDisplay(row.ctaClicks)} | ${personaValue} | ${toDisplay(row.trustInteractions)} | ${trendLabel(row.trendDeltaPercent)} | ${row.status} |`
    )
  }

  const markdown = [
    '# Weekly Route x Variant Readout',
    '',
    `Date: ${today}`,
    'Owner: Growth + Product + Engineering',
    `Data source: ${metadata.source ?? 'unknown'}`,
    metadata.note ? `Source note: ${metadata.note}` : null,
    '',
    '## Route x Variant Table',
    '',
    ...tableLines,
    '',
    '## Recommendation Rule Snapshot',
    '',
    '- Keep live: trend decline < 10% week-over-week and no quality regressions.',
    '- Iterate: trend decline >= 10% for two consecutive pulls.',
    '- Rollback: trend decline >= 15% on a primary conversion route.',
    '',
    strict ? 'Mode: strict' : 'Mode: non-strict',
    '',
  ].filter(Boolean)

  fs.writeFileSync(datedFile, `${markdown.join('\n')}\n`)
  fs.writeFileSync(latestFile, `${markdown.join('\n')}\n`)

  return { datedFile, latestFile }
}

function main() {
  const { inputPath, outputDir, strict } = parseArgs(process.argv)
  const { entries, metadata } = loadMetrics(inputPath)
  const rows = buildRows(entries)

  const hasData = rows.some((row) => row.ctaClicks !== null || row.trustInteractions !== null || row.trendDeltaPercent !== null)
  if (strict && !hasData) {
    console.error(`No route-variant metrics data available from input: ${inputPath}`)
    process.exit(2)
  }

  const output = writeMarkdown(outputDir, rows, metadata, strict)

  console.log('Weekly route x variant readout export')
  console.log('------------------------------------')
  console.log(`Input: ${inputPath}`)
  console.log(`Dated output: ${output.datedFile}`)
  console.log(`Latest output: ${output.latestFile}`)
}

main()
