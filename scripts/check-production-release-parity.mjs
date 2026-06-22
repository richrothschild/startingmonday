#!/usr/bin/env node

const BASE_URL = process.env.RELEASE_MONITOR_BASE_URL ?? 'https://startingmonday.app'
const EXPECTED_SHA = (process.env.RELEASE_EXPECTED_SHA ?? '').trim().toLowerCase()
const EXPECTED_HERO_PRIMARY = process.env.RELEASE_EXPECTED_HERO_PRIMARY ?? ''
const EXPECTED_HERO_SECONDARY = process.env.RELEASE_EXPECTED_HERO_SECONDARY ?? ''
const TIMEOUT_SECONDS = Number.parseInt(process.env.RELEASE_TIMEOUT_SECONDS ?? '900', 10)
const INTERVAL_SECONDS = Number.parseInt(process.env.RELEASE_INTERVAL_SECONDS ?? '20', 10)
const OUTPUT_JSON = process.env.RELEASE_OUTPUT_JSON === '1' || process.argv.includes('--json')

const REQUEST_TIMEOUT_MS = 15000

function trimSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeSha(value) {
  return String(value ?? '').trim().toLowerCase()
}

function isShaMatch(expected, actual) {
  if (!expected || !actual) return false
  return expected === actual || expected.startsWith(actual) || actual.startsWith(expected)
}

async function fetchWithTimeout(pathname) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(`${trimSlash(BASE_URL)}${pathname}`, { signal: controller.signal })
    const body = await res.text()
    return { ok: res.ok, status: res.status, body }
  } finally {
    clearTimeout(timeout)
  }
}

function parseDeployMarker(rawBody) {
  try {
    const parsed = JSON.parse(rawBody)
    return {
      ok: parsed?.kind === 'deploy-marker',
      deploySha: normalizeSha(parsed?.deploy_sha),
      release: String(parsed?.release ?? ''),
    }
  } catch {
    return { ok: false, deploySha: '', release: '' }
  }
}

function heroCheck(html) {
  const checks = []

  if (EXPECTED_HERO_PRIMARY) {
    checks.push({
      key: 'hero_primary',
      expected: EXPECTED_HERO_PRIMARY,
      matched: html.includes(EXPECTED_HERO_PRIMARY),
    })
  }

  if (EXPECTED_HERO_SECONDARY) {
    checks.push({
      key: 'hero_secondary',
      expected: EXPECTED_HERO_SECONDARY,
      matched: html.includes(EXPECTED_HERO_SECONDARY),
    })
  }

  return checks
}

async function evaluate() {
  const startedAt = Date.now()
  const deadline = startedAt + TIMEOUT_SECONDS * 1000
  const attempts = []

  while (Date.now() <= deadline) {
    const now = new Date().toISOString()
    const attempt = {
      at: now,
      marker: { ok: false, status: 0, deploySha: '', release: '', reason: '' },
      homepage: { ok: false, status: 0, heroChecks: [], reason: '' },
    }

    try {
      const markerRes = await fetchWithTimeout('/api/deploy-marker')
      attempt.marker.status = markerRes.status

      if (!markerRes.ok) {
        attempt.marker.reason = `HTTP ${markerRes.status}`
      } else {
        const marker = parseDeployMarker(markerRes.body)
        attempt.marker.ok = marker.ok
        attempt.marker.deploySha = marker.deploySha
        attempt.marker.release = marker.release
        if (!marker.ok) {
          attempt.marker.reason = 'Unexpected deploy marker payload'
        }
      }
    } catch (error) {
      attempt.marker.reason = error instanceof Error ? error.message : 'deploy marker request failed'
    }

    try {
      const homeRes = await fetchWithTimeout('/')
      attempt.homepage.status = homeRes.status

      if (!homeRes.ok) {
        attempt.homepage.reason = `HTTP ${homeRes.status}`
      } else {
        attempt.homepage.ok = true
        attempt.homepage.heroChecks = heroCheck(homeRes.body)
      }
    } catch (error) {
      attempt.homepage.reason = error instanceof Error ? error.message : 'homepage request failed'
    }

    attempts.push(attempt)

    const shaMatches = isShaMatch(EXPECTED_SHA, attempt.marker.deploySha)
    const heroChecks = attempt.homepage.heroChecks
    const heroMatches = heroChecks.every((item) => item.matched)
    const heroChecksPresent = heroChecks.length > 0 ? heroMatches : true

    if (attempt.marker.ok && shaMatches && attempt.homepage.ok && heroChecksPresent) {
      return {
        ok: true,
        baseUrl: BASE_URL,
        expectedSha: EXPECTED_SHA,
        timeoutSeconds: TIMEOUT_SECONDS,
        intervalSeconds: INTERVAL_SECONDS,
        attempts,
        resolvedAt: new Date().toISOString(),
        elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
      }
    }

    if (Date.now() + INTERVAL_SECONDS * 1000 > deadline) {
      break
    }

    // Wait for deployment propagation before checking again.
     
    await sleep(INTERVAL_SECONDS * 1000)
  }

  return {
    ok: false,
    baseUrl: BASE_URL,
    expectedSha: EXPECTED_SHA,
    timeoutSeconds: TIMEOUT_SECONDS,
    intervalSeconds: INTERVAL_SECONDS,
    attempts,
    resolvedAt: new Date().toISOString(),
    elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
  }
}

function renderTextSummary(result) {
  const last = result.attempts[result.attempts.length - 1]
  const heroFailures = (last?.homepage.heroChecks ?? [])
    .filter((item) => !item.matched)
    .map((item) => item.expected)

  console.log(`Release parity: ${result.ok ? 'PASS' : 'FAIL'} after ${result.elapsedSeconds}s (${result.attempts.length} attempts)`)
  console.log(`Base URL: ${result.baseUrl}`)
  console.log(`Expected SHA: ${result.expectedSha || '(not set)'}`)

  if (last) {
    console.log(`Last deploy marker SHA: ${last.marker.deploySha || '(missing)'}`)
    if (last.marker.reason) {
      console.log(`Last deploy marker issue: ${last.marker.reason}`)
    }
    if (last.homepage.reason) {
      console.log(`Last homepage issue: ${last.homepage.reason}`)
    }
  }

  if (heroFailures.length > 0) {
    console.log(`Missing hero assertions: ${heroFailures.join(' | ')}`)
  }
}

async function main() {
  if (!EXPECTED_SHA) {
    console.error('RELEASE_EXPECTED_SHA is required')
    process.exitCode = 1
    return
  }

  const result = await evaluate()

  if (OUTPUT_JSON) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    renderTextSummary(result)
  }

  if (!result.ok) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'release parity check failed')
  process.exitCode = 1
})