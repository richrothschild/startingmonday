#!/usr/bin/env node

import process from 'node:process'

function parseArgs(argv) {
  const args = {
    baseUrl: process.env.LOAD_TEST_BASE_URL ?? 'http://localhost:3000',
    durationSec: Number(process.env.LOAD_TEST_DURATION_SEC ?? 60),
    concurrency: Number(process.env.LOAD_TEST_CONCURRENCY ?? 8),
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--base-url') args.baseUrl = argv[i + 1] ?? args.baseUrl
    if (token === '--duration-sec') args.durationSec = Number(argv[i + 1] ?? args.durationSec)
    if (token === '--concurrency') args.concurrency = Number(argv[i + 1] ?? args.concurrency)
  }

  return args
}

function percentile(values, p) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

const SCENARIOS = [
  { path: '/api/health', budgetMs: 1200 },
  { path: '/api/readiness', budgetMs: 1800 },
  { path: '/login', budgetMs: 3000 },
  { path: '/', budgetMs: 3000 },
]

async function run() {
  const args = parseArgs(process.argv.slice(2))
  const started = Date.now()
  const deadline = started + args.durationSec * 1000

  const latencies = []
  const perPath = new Map()
  let total = 0
  let failures = 0

  for (const scenario of SCENARIOS) {
    perPath.set(scenario.path, { total: 0, failures: 0, latencies: [] })
  }

  async function workerLoop(workerId) {
    while (Date.now() < deadline) {
      const scenario = SCENARIOS[(total + workerId) % SCENARIOS.length]
      const url = `${args.baseUrl.replace(/\/$/, '')}${scenario.path}`
      const start = Date.now()
      let ok = false
      let status = 0

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'user-agent': 'startingmonday-launch-rehearsal/1.0' },
        })
        status = res.status
        ok = res.status >= 200 && res.status < 500
      } catch {
        ok = false
      }

      const elapsed = Date.now() - start
      total += 1
      latencies.push(elapsed)

      const bucket = perPath.get(scenario.path)
      bucket.total += 1
      bucket.latencies.push(elapsed)

      if (!ok || elapsed > scenario.budgetMs) {
        failures += 1
        bucket.failures += 1
      }

      if (status === 429) {
        failures += 1
        bucket.failures += 1
      }
    }
  }

  await Promise.all(Array.from({ length: args.concurrency }, (_, idx) => workerLoop(idx)))

  const elapsedSec = Math.max(1, Math.round((Date.now() - started) / 1000))
  const p95 = percentile(latencies, 95)
  const p99 = percentile(latencies, 99)
  const errorRate = total > 0 ? failures / total : 1

  console.log('launch_load_rehearsal')
  console.log(`base_url=${args.baseUrl}`)
  console.log(`duration_sec=${elapsedSec}`)
  console.log(`concurrency=${args.concurrency}`)
  console.log(`requests_total=${total}`)
  console.log(`requests_per_sec=${(total / elapsedSec).toFixed(2)}`)
  console.log(`p95_ms=${p95}`)
  console.log(`p99_ms=${p99}`)
  console.log(`failure_rate=${errorRate.toFixed(4)}`)

  for (const scenario of SCENARIOS) {
    const bucket = perPath.get(scenario.path)
    const bucketP95 = percentile(bucket.latencies, 95)
    const bucketFailRate = bucket.total > 0 ? bucket.failures / bucket.total : 1
    console.log(
      `path=${scenario.path} total=${bucket.total} p95_ms=${bucketP95} ` +
        `fail_rate=${bucketFailRate.toFixed(4)} budget_ms=${scenario.budgetMs}`,
    )
  }

  const pass = total > 0 && errorRate <= 0.02 && p95 <= 3000
  if (!pass) {
    console.error('launch_rehearsal_failed: thresholds violated')
    process.exit(1)
  }
}

run().catch((error) => {
  console.error('launch_load_rehearsal_error', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
