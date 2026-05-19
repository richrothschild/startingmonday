#!/usr/bin/env node
/**
 * SLO Error-Budget Report (R1.3)
 *
 * Reads structured api_request log lines from stdin or a file and computes:
 *   - Request count, error count, error rate per route and tier
 *   - SLO attainment vs target per tier
 *   - Error budget consumed (%) and remaining
 *   - Burn rate (multiple of allowed error rate)
 *
 * Usage:
 *   # From Railway log export (JSON lines):
 *   node scripts/slo-report.mjs < logs.jsonl
 *
 *   # From a file:
 *   node scripts/slo-report.mjs --file /tmp/api-logs.jsonl
 *
 *   # JSON output for CI consumption:
 *   node scripts/slo-report.mjs --json < logs.jsonl
 *
 * Log line format (emitted by src/lib/telemetry.ts):
 *   {"ts":"...","event":"api_request","method":"POST","path":"/api/feedback/items",
 *    "tier":"P0","status":201,"latency_ms":142,"correlation_id":"req_...","deploy_sha":"..."}
 */

import * as fs from 'node:fs'
import * as readline from 'node:readline'

// ---------------------------------------------------------------------------
// SLO targets per tier (from docs/sre/slo-catalog.md)
// ---------------------------------------------------------------------------
const SLO_AVAILABILITY = { P0: 0.9995, P1: 0.999, P2: 0.995 }
const SLO_LATENCY_P95_MS = { P0: 1200, P1: 2000, P2: 4000 }

// Error budget = 1 - SLO (fraction of requests allowed to fail per month)
// 30-day window = 2,592,000 seconds
const MONTHLY_SECONDS = 30 * 24 * 60 * 60
const ERROR_BUDGET_FRACTION = {
  P0: 1 - SLO_AVAILABILITY.P0,   // 0.0005 (0.05%)
  P1: 1 - SLO_AVAILABILITY.P1,   // 0.001  (0.1%)
  P2: 1 - SLO_AVAILABILITY.P2,   // 0.005  (0.5%)
}

// Fast-burn threshold: consuming budget 14x faster than target triggers page
const FAST_BURN_MULTIPLIER = 14

// ---------------------------------------------------------------------------
// Parse arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2)
const JSON_OUTPUT = args.includes('--json')
const fileIdx = args.indexOf('--file')
const FILE_PATH = fileIdx !== -1 ? args[fileIdx + 1] : null

// ---------------------------------------------------------------------------
// Aggregate metrics
// ---------------------------------------------------------------------------
// tier -> { total, errors, latencies[] }
const tierStats = {
  P0: { total: 0, errors: 0, latencies: [] },
  P1: { total: 0, errors: 0, latencies: [] },
  P2: { total: 0, errors: 0, latencies: [] },
}

// path -> { total, errors }
const routeStats = new Map()

let earliestTs = Infinity
let latestTs = -Infinity
let linesRead = 0
let linesSkipped = 0

function processLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return

  let record
  try {
    record = JSON.parse(trimmed)
  } catch {
    linesSkipped++
    return
  }

  if (record.event !== 'api_request') return
  if (!record.tier || !record.status || !record.path) return

  linesRead++

  const ts = record.ts ? new Date(record.ts).getTime() : null
  if (ts) {
    if (ts < earliestTs) earliestTs = ts
    if (ts > latestTs) latestTs = ts
  }

  const tier = record.tier
  if (!tierStats[tier]) return

  const isError = record.status >= 500
  tierStats[tier].total++
  if (isError) tierStats[tier].errors++
  if (typeof record.latency_ms === 'number') {
    tierStats[tier].latencies.push(record.latency_ms)
  }

  const key = `${record.method} ${record.path}`
  if (!routeStats.has(key)) {
    routeStats.set(key, { route: key, tier, total: 0, errors: 0 })
  }
  const rs = routeStats.get(key)
  rs.total++
  if (isError) rs.errors++
}

function p95(arr) {
  if (arr.length === 0) return null
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.ceil(arr.length * 0.95) - 1
  return sorted[Math.max(0, idx)]
}

function pct(n, d) {
  if (d === 0) return null
  return ((n / d) * 100).toFixed(4)
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

async function run() {
  const source = FILE_PATH
    ? fs.createReadStream(FILE_PATH)
    : process.stdin

  const rl = readline.createInterface({ input: source, crlfDelay: Infinity })

  for await (const line of rl) {
    processLine(line)
  }

  const windowMs = latestTs !== -Infinity && earliestTs !== Infinity
    ? latestTs - earliestTs
    : null

  // ---------------------------------------------------------------------------
  // Compute tier summaries
  // ---------------------------------------------------------------------------
  const tierSummaries = Object.entries(tierStats).map(([tier, stats]) => {
    const errorRate = stats.total > 0 ? stats.errors / stats.total : 0
    const availability = 1 - errorRate
    const target = SLO_AVAILABILITY[tier]
    const sloMet = availability >= target

    const budgetFraction = ERROR_BUDGET_FRACTION[tier]
    const budgetConsumed = stats.total > 0 ? errorRate / budgetFraction : 0
    const burnRate = budgetConsumed  // relative to allowed rate

    const latencyP95 = p95(stats.latencies)
    const latencyTarget = SLO_LATENCY_P95_MS[tier]
    const latencySloMet = latencyP95 !== null ? latencyP95 <= latencyTarget : null

    return {
      tier,
      total: stats.total,
      errors: stats.errors,
      error_rate_pct: pct(stats.errors, stats.total),
      availability_pct: pct(stats.total - stats.errors, stats.total),
      slo_target_pct: (target * 100).toFixed(4),
      slo_met: sloMet,
      error_budget_consumed_pct: stats.total > 0 ? (Math.min(budgetConsumed, 1) * 100).toFixed(1) : null,
      burn_rate: burnRate.toFixed(2),
      burn_rate_alert: burnRate >= FAST_BURN_MULTIPLIER,
      latency_p95_ms: latencyP95,
      latency_slo_target_ms: latencyTarget,
      latency_slo_met: latencySloMet,
    }
  })

  // Top 10 routes by error count
  const topErrorRoutes = [...routeStats.values()]
    .filter(r => r.errors > 0)
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 10)
    .map(r => ({
      route: r.route,
      tier: r.tier,
      errors: r.errors,
      total: r.total,
      error_rate_pct: pct(r.errors, r.total),
    }))

  const report = {
    generated_at: new Date().toISOString(),
    window_start: earliestTs !== Infinity ? new Date(earliestTs).toISOString() : null,
    window_end: latestTs !== -Infinity ? new Date(latestTs).toISOString() : null,
    window_duration: windowMs ? formatDuration(windowMs) : null,
    lines_processed: linesRead,
    lines_skipped: linesSkipped,
    tier_summaries: tierSummaries,
    top_error_routes: topErrorRoutes,
    overall_health: tierSummaries.every(t => t.slo_met) ? 'OK' : 'DEGRADED',
    fast_burn_active: tierSummaries.some(t => t.burn_rate_alert),
  }

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2))
    return
  }

  // ---------------------------------------------------------------------------
  // Human-readable output
  // ---------------------------------------------------------------------------
  console.log('\n=== SLO Error-Budget Report ===')
  console.log(`Generated: ${report.generated_at}`)
  if (report.window_start) {
    console.log(`Window:    ${report.window_start} -> ${report.window_end} (${report.window_duration})`)
  }
  console.log(`Lines processed: ${report.lines_processed} | skipped: ${report.lines_skipped}`)
  console.log(`Overall health: ${report.overall_health}${report.fast_burn_active ? ' [FAST-BURN ACTIVE]' : ''}`)

  console.log('\n--- Tier SLO Summary ---')
  for (const t of report.tier_summaries) {
    const sloIcon = t.slo_met ? 'OK' : 'FAIL'
    const latIcon = t.latency_slo_met === true ? 'OK' : t.latency_slo_met === false ? 'FAIL' : 'N/A'
    const burnIcon = t.burn_rate_alert ? ' [FAST-BURN]' : ''
    console.log(
      `  ${t.tier}  avail: ${t.availability_pct ?? 'N/A'}% (target ${t.slo_target_pct}%) [${sloIcon}]` +
      `  budget used: ${t.error_budget_consumed_pct ?? 'N/A'}%  burn: ${t.burn_rate}x${burnIcon}` +
      `  p95: ${t.latency_p95_ms ?? 'N/A'}ms (target ${t.latency_slo_target_ms}ms) [${latIcon}]` +
      `  n=${t.total}`
    )
  }

  if (report.top_error_routes.length > 0) {
    console.log('\n--- Top Error Routes ---')
    for (const r of report.top_error_routes) {
      console.log(`  [${r.tier}] ${r.route}  errors=${r.errors}/${r.total} (${r.error_rate_pct}%)`)
    }
  }

  console.log('')

  // Exit 1 if any P0 SLO is violated or fast-burn is active
  const p0 = report.tier_summaries.find(t => t.tier === 'P0')
  if (p0 && (!p0.slo_met || p0.burn_rate_alert)) {
    process.exitCode = 1
  }
}

run().catch(err => {
  console.error('slo-report error:', err)
  process.exitCode = 1
})
