#!/usr/bin/env node

const BASE_URL = process.env.MONITOR_BASE_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.MONITOR_CRON_SECRET ?? ''
const OUTPUT_JSON = process.env.MONITOR_OUTPUT_JSON === '1' || process.argv.includes('--json')
const TIMEOUT_MS = 15000

function trimSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function checkEndpoint({ name, path, expectStatus = 200, expectJsonField, expectTextIncludes, critical = true }) {
  const url = `${trimSlash(BASE_URL)}${path}`
  const started = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, { signal: controller.signal })
    const body = await res.text()
    const durationMs = Date.now() - started

    if (res.status !== expectStatus) {
      return {
        ok: false,
        critical,
        name,
        path,
        status: res.status,
        durationMs,
        reason: `Expected ${expectStatus}, got ${res.status}`,
        body: body.slice(0, 400),
      }
    }

    if (expectJsonField) {
      const parsed = safeJsonParse(body)
      if (!parsed) {
        return {
          ok: false,
          critical,
          name,
          path,
          status: res.status,
          durationMs,
          reason: 'Expected JSON body but could not parse response',
          body: body.slice(0, 400),
        }
      }

      const actual = parsed[expectJsonField.key]
      const allowed = expectJsonField.allowed
      if (!allowed.includes(actual)) {
        return {
          ok: false,
          critical,
          name,
          path,
          status: res.status,
          durationMs,
          reason: `Expected ${expectJsonField.key} in [${allowed.join(', ')}], got ${String(actual)}`,
          body: body.slice(0, 400),
        }
      }
    }

    if (expectTextIncludes && !body.includes(expectTextIncludes)) {
      return {
        ok: false,
        name,
        path,
        status: res.status,
        durationMs,
        reason: `Expected response to include "${expectTextIncludes}"`,
        body: body.slice(0, 400),
      }
    }

    return {
      ok: true,
      critical,
      name,
      path,
      status: res.status,
      durationMs,
    }
  } catch (error) {
    const durationMs = Date.now() - started
    const message = error instanceof Error ? error.message : 'request failed'
    return {
      ok: false,
      critical,
      name,
      path,
      status: 0,
      durationMs,
      reason: message,
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function main() {
  const checks = [
    {
      name: 'Health endpoint',
      path: '/api/health',
      expectStatus: 200,
      expectJsonField: { key: 'status', allowed: ['ok', 'degraded'] },
    },
    {
      name: 'Login page',
      path: '/login',
      expectStatus: 200,
    },
    {
      name: 'Pricing page',
      path: '/pricing',
      expectStatus: 200,
    },
  ]

  if (CRON_SECRET) {
    checks.push(
      {
        name: 'Cron social digest',
        path: `/api/admin/social/digest?secret=${encodeURIComponent(CRON_SECRET)}`,
        expectStatus: 200,
        expectJsonField: { key: 'ok', allowed: [true] },
        critical: false,
      },
      {
        name: 'Cron scan alert',
        path: `/api/cron/scan-alert?secret=${encodeURIComponent(CRON_SECRET)}`,
        expectStatus: 200,
        critical: false,
      },
    )
  }

  const results = []
  for (const check of checks) {
    // eslint-disable-next-line no-await-in-loop
    const result = await checkEndpoint(check)
    results.push(result)
  }

  const failures = results.filter((r) => !r.ok)
  const criticalFailures = failures.filter((r) => r.critical !== false)
  const advisoryFailures = failures.filter((r) => r.critical === false)
  const summary = {
    ts: new Date().toISOString(),
    baseUrl: BASE_URL,
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    criticalFailed: criticalFailures.length,
    advisoryFailed: advisoryFailures.length,
    results,
  }

  if (OUTPUT_JSON) {
    console.log(JSON.stringify(summary, null, 2))
  } else {
    console.log(`Production smoke check: ${summary.passed}/${summary.total} passed (${summary.criticalFailed} critical failed, ${summary.advisoryFailed} advisory failed)`)
    for (const r of results) {
      const icon = r.ok ? 'OK' : 'FAIL'
      const severity = r.critical === false ? 'advisory' : 'critical'
      console.log(`${icon} [${severity}] ${r.name} (${r.status}) ${r.durationMs}ms`)
      if (!r.ok) {
        console.log(`  reason: ${r.reason}`)
      }
    }
  }

  // Only fail the smoke check on core availability regressions.
  if (criticalFailures.length) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'smoke check failed'
  console.error(message)
  process.exitCode = 1
})
