#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { discoverPublicMobileRoutes } from './lib/mobile-route-inventory.mjs'

const BASE_URL = (process.env.MONITOR_BASE_URL ?? 'https://startingmonday.app').replace(/\/$/, '')
const OUTPUT_JSON = process.env.MONITOR_OUTPUT_JSON === '1' || process.argv.includes('--json')
const TIMEOUT_MS = Number(process.env.MONITOR_TIMEOUT_MS ?? '15000')
const MAX_ATTEMPTS_PER_ROUTE = Number(process.env.MONITOR_RETRY_ATTEMPTS ?? '2')
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

const thresholdsPath = path.join(process.cwd(), 'config', 'mobile-reliability-thresholds.json')
const markdownOutputPath = path.join(process.cwd(), 'playwright-report', 'mobile-reliability-dashboard.latest.md')
const jsonOutputPath = path.join(process.cwd(), 'playwright-report', 'mobile-reliability-thresholds.latest.json')

function percentile(values, p) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[index]
}

async function runRouteCheck(route) {
  const url = `${BASE_URL}${route.path}`
  let lastResult = {
    name: route.name,
    path: route.path,
    status: 0,
    expectedStatus: route.expectedStatus,
    durationMs: 0,
    maxResponseMs: route.maxResponseMs,
    ok: false,
    reason: 'request not attempted',
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_ROUTE; attempt += 1) {
    const started = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'user-agent': MOBILE_UA,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
      await res.text()

      const durationMs = Date.now() - started
      const statusOk = res.status === route.expectedStatus
      const latencyOk = durationMs <= route.maxResponseMs
      const ok = statusOk && latencyOk

      lastResult = {
        name: route.name,
        path: route.path,
        status: res.status,
        expectedStatus: route.expectedStatus,
        durationMs,
        maxResponseMs: route.maxResponseMs,
        ok,
        reason: !statusOk
          ? `Expected HTTP ${route.expectedStatus}, got ${res.status}`
          : !latencyOk
            ? `Exceeded max response ${route.maxResponseMs}ms`
            : '',
      }

      if (ok) return lastResult

      const shouldRetryStatus = res.status >= 500 && attempt < MAX_ATTEMPTS_PER_ROUTE
      if (!shouldRetryStatus) {
        return lastResult
      }
    } catch (error) {
      const durationMs = Date.now() - started
      const reason = error instanceof Error ? error.message : 'request failed'

      lastResult = {
        name: route.name,
        path: route.path,
        status: 0,
        expectedStatus: route.expectedStatus,
        durationMs,
        maxResponseMs: route.maxResponseMs,
        ok: false,
        reason,
      }

      const transientAbort = /aborted|timeout/i.test(reason)
      const shouldRetry = transientAbort && attempt < MAX_ATTEMPTS_PER_ROUTE
      if (!shouldRetry) {
        return lastResult
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  return lastResult
}

function ensureOutputDir() {
  fs.mkdirSync(path.dirname(markdownOutputPath), { recursive: true })
}

function writeDashboard(summary) {
  const lines = [
    '# Mobile Reliability Dashboard',
    '',
    `Generated: ${summary.ts}`,
    `Base URL: ${summary.baseUrl}`,
    '',
    '## Route Threshold Checks',
    '',
    '| Route | Status | HTTP | Duration | Threshold | Notes |',
    '| --- | --- | ---: | ---: | ---: | --- |',
  ]

  for (const result of summary.results) {
    lines.push(
      `| ${result.name} | ${result.ok ? 'PASS' : 'FAIL'} | ${result.status} | ${result.durationMs}ms | ${result.maxResponseMs}ms | ${result.reason.replace(/\|/g, '/')} |`,
    )
  }

  lines.push('')
  lines.push('## Aggregate')
  lines.push('')
  lines.push(`- Pass rate: ${(summary.passRate * 100).toFixed(1)}%`)
  lines.push(`- P95 response: ${summary.p95ResponseMs}ms`)
  lines.push(`- Failed checks: ${summary.failed}`)
  lines.push(`- Threshold: max failed ${summary.thresholds.aggregate.maxFailedChecks}, min pass rate ${(summary.thresholds.aggregate.minPassRate * 100).toFixed(0)}%, max p95 ${summary.thresholds.aggregate.maxP95ResponseMs}ms`)
  lines.push('')
  lines.push(`- Overall status: ${summary.ok ? 'PASS' : 'FAIL'}`)

  fs.writeFileSync(markdownOutputPath, `${lines.join('\n')}\n`, 'utf8')
  fs.writeFileSync(jsonOutputPath, JSON.stringify(summary, null, 2), 'utf8')
}

async function main() {
  const thresholds = JSON.parse(fs.readFileSync(thresholdsPath, 'utf8'))
  const configuredRoutes = thresholds.routes ?? []
  const configuredPaths = new Set(configuredRoutes.map((route) => route.path))
  const discoveredRoutes = discoverPublicMobileRoutes()

  const autoDiscoveryEnabled = thresholds.autoDiscovery?.enabled === true
  const autoDiscoveryMaxResponseMs = Number(thresholds.autoDiscovery?.maxResponseMs ?? 2200)

  const discoveredThresholdRoutes = autoDiscoveryEnabled
    ? discoveredRoutes
        .filter((routePath) => !configuredPaths.has(routePath))
        .map((routePath) => ({
          name: `Auto ${routePath}`,
          path: routePath,
          expectedStatus: 200,
          maxResponseMs: autoDiscoveryMaxResponseMs,
        }))
    : []

  const routesToCheck = [...configuredRoutes, ...discoveredThresholdRoutes]
  const results = []

  for (const route of routesToCheck) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await runRouteCheck(route))
  }

  const failed = results.filter((r) => !r.ok).length
  const passRate = results.length === 0 ? 1 : (results.length - failed) / results.length
  const p95ResponseMs = percentile(results.map((r) => r.durationMs), 95)

  const aggregateOk =
    failed <= thresholds.aggregate.maxFailedChecks &&
    passRate >= thresholds.aggregate.minPassRate &&
    p95ResponseMs <= thresholds.aggregate.maxP95ResponseMs

  const summary = {
    ts: new Date().toISOString(),
    baseUrl: BASE_URL,
    thresholds,
    discoveredRoutesChecked: discoveredThresholdRoutes.length,
    total: results.length,
    failed,
    passed: results.length - failed,
    passRate,
    p95ResponseMs,
    ok: aggregateOk,
    results,
  }

  ensureOutputDir()
  writeDashboard(summary)

  if (OUTPUT_JSON) {
    console.log(JSON.stringify(summary, null, 2))
  } else {
    console.log(`Mobile reliability checks: ${summary.passed}/${summary.total} passed`)
    for (const r of results) {
      console.log(`${r.ok ? 'OK' : 'FAIL'} ${r.name} ${r.status} ${r.durationMs}ms / ${r.maxResponseMs}ms${r.reason ? ` -> ${r.reason}` : ''}`)
    }
    console.log(`Aggregate: passRate ${(passRate * 100).toFixed(1)}%, p95 ${p95ResponseMs}ms, failed ${failed}`)
  }

  if (!summary.ok) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'mobile reliability check failed')
  process.exitCode = 1
})
