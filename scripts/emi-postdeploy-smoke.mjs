#!/usr/bin/env node

const BASE_URL = process.env.EMI_SMOKE_BASE_URL ?? 'https://startingmonday.app'
const SESSION_COOKIE = process.env.EMI_SMOKE_SESSION_COOKIE ?? ''
const AUTH_EMAIL = process.env.EMI_SMOKE_EMAIL ?? ''
const AUTH_PASSWORD = process.env.EMI_SMOKE_PASSWORD ?? ''
const OUTPUT_JSON = process.env.EMI_SMOKE_OUTPUT_JSON === '1' || process.argv.includes('--json')
const TIMEOUT_MS = 20000
let authCookieHeader = SESSION_COOKIE

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

async function postJson(path, body) {
  const url = `${trimSlash(BASE_URL)}${path}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const started = Date.now()

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: authCookieHeader,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const text = await res.text()
    return {
      path,
      status: res.status,
      durationMs: Date.now() - started,
      body: safeJsonParse(text),
      rawBody: text.slice(0, 500),
    }
  } catch (error) {
    return {
      path,
      status: 0,
      durationMs: Date.now() - started,
      body: null,
      rawBody: error instanceof Error ? error.message : 'request failed',
    }
  } finally {
    clearTimeout(timeout)
  }
}

function parseCookieHeader(setCookieValues) {
  if (!Array.isArray(setCookieValues) || setCookieValues.length === 0) return ''
  return setCookieValues
    .map((value) => String(value).split(';')[0]?.trim())
    .filter(Boolean)
    .join('; ')
}

async function buildAuthCookie() {
  if (SESSION_COOKIE) return SESSION_COOKIE
  if (!AUTH_EMAIL || !AUTH_PASSWORD) return ''

  const url = `${trimSlash(BASE_URL)}/api/auth/verify-and-signin`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
  })

  const setCookieValues = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : []

  const cookieHeader = parseCookieHeader(setCookieValues)
  if (!res.ok || !cookieHeader) {
    const body = await res.text().catch(() => '')
    throw new Error(`Failed to authenticate smoke user (status=${res.status}) ${body.slice(0, 180)}`)
  }

  return cookieHeader
}

function evaluate(weekly, validation) {
  const failures = []

  if (weekly.status !== 200 || weekly.body?.ok !== true) {
    failures.push(`weekly-kpi-summaries failed status=${weekly.status} body=${weekly.rawBody}`)
  }

  if (validation.status !== 200 || validation.body?.ok !== true) {
    failures.push(`emi-validation-reruns request failed status=${validation.status} body=${validation.rawBody}`)
  } else {
    if (validation.body.status !== 'ok') {
      failures.push(`validation status=${String(validation.body.status)}`)
    }
    if (Number(validation.body.mismatchCount ?? -1) !== 0) {
      failures.push(`mismatchCount=${String(validation.body.mismatchCount)}`)
    }
    if (Number(validation.body.nullStreakCount ?? -1) !== 0) {
      failures.push(`nullStreakCount=${String(validation.body.nullStreakCount)}`)
    }
  }

  return failures
}

function emitSummary(summary) {
  if (OUTPUT_JSON) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  console.log(`EMI postdeploy smoke: ${summary.passed ? 'PASS' : 'FAIL'}`)
  console.log(`weekly run: ${summary.weeklyRunId ?? 'n/a'} (${summary.checks?.weekly?.status ?? 'n/a'})`)
  console.log(`validation run: ${summary.validationRunId ?? 'n/a'} (${summary.checks?.validation?.status ?? 'n/a'})`)
  console.log(`validation status=${summary.validationStatus ?? 'n/a'} mismatchCount=${String(summary.mismatchCount)} nullStreakCount=${String(summary.nullStreakCount)}`)
  if (summary.failures?.length) {
    console.log('failures:')
    for (const reason of summary.failures) {
      console.log(`- ${reason}`)
    }
  }
}

async function main() {
  let authCookie = ''
  try {
    authCookie = await buildAuthCookie()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'authentication bootstrap failed'
    emitSummary({
      ts: new Date().toISOString(),
      baseUrl: BASE_URL,
      weeklyRunId: null,
      validationRunId: null,
      validationStatus: null,
      mismatchCount: null,
      nullStreakCount: null,
      passed: false,
      failures: [message],
      checks: {
        weekly: { status: 0 },
        validation: { status: 0 },
      },
    })
    process.exitCode = 1
    return
  }

  if (!authCookie) {
    emitSummary({
      ts: new Date().toISOString(),
      baseUrl: BASE_URL,
      weeklyRunId: null,
      validationRunId: null,
      validationStatus: null,
      mismatchCount: null,
      nullStreakCount: null,
      passed: false,
      failures: ['Missing smoke authentication. Set EMI_SMOKE_SESSION_COOKIE or EMI_SMOKE_EMAIL and EMI_SMOKE_PASSWORD.'],
      checks: {
        weekly: { status: 0 },
        validation: { status: 0 },
      },
    })
    process.exitCode = 1
    return
  }

  const originalCookie = authCookieHeader
  authCookieHeader = authCookie

  const weekly = await postJson('/api/admin/automation/reporting/weekly-kpi-summaries', {})
  const validation = await postJson('/api/admin/automation/reporting/emi-validation-reruns', {})
  const failures = evaluate(weekly, validation)

  const summary = {
    ts: new Date().toISOString(),
    baseUrl: BASE_URL,
    weeklyRunId: weekly.body?.runId ?? null,
    validationRunId: validation.body?.runId ?? null,
    validationStatus: validation.body?.status ?? null,
    mismatchCount: validation.body?.mismatchCount ?? null,
    nullStreakCount: validation.body?.nullStreakCount ?? null,
    passed: failures.length === 0,
    failures,
    checks: { weekly, validation },
  }

  emitSummary(summary)

  if (failures.length) {
    process.exitCode = 1
  }

  authCookieHeader = originalCookie
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'emi smoke check failed'
  emitSummary({
    ts: new Date().toISOString(),
    baseUrl: BASE_URL,
    weeklyRunId: null,
    validationRunId: null,
    validationStatus: null,
    mismatchCount: null,
    nullStreakCount: null,
    passed: false,
    failures: [message],
    checks: {
      weekly: { status: 0 },
      validation: { status: 0 },
    },
  })
  process.exitCode = 1
})
