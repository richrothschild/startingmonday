import { logger } from './logger.js'

const TRANSIENT_HTML_MARKERS = [
  'cloudflare.com/5xx-error-landing',
  '<title>startingmonday.app | 502',
  'bad gateway',
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parsePayload(bodyText) {
  if (!bodyText) return null
  try {
    return JSON.parse(bodyText)
  } catch {
    return { raw: bodyText }
  }
}

function looksTransientHttpFailure(status, payload) {
  if (status >= 500) return true
  const raw = typeof payload?.raw === 'string' ? payload.raw.toLowerCase() : ''
  return TRANSIENT_HTML_MARKERS.some((marker) => raw.includes(marker))
}

export async function callCronRoute({
  job,
  url,
  cronSecret,
  userAgent,
  attempts = 3,
  timeoutMs = 30_000,
}) {
  let lastFailure = null

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-cron-secret': cronSecret,
          'User-Agent': userAgent,
        },
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_fetch_error'
      lastFailure = {
        ok: false,
        transient: true,
        status: null,
        payload: null,
        error: message,
      }

      if (attempt < attempts) {
        await sleep(250 * attempt)
        continue
      }

      logger.warn(`${job}: transient fetch failure`, {
        url,
        error: message,
        attempts,
      })
      return lastFailure
    }

    const bodyText = await response.text()
    const payload = parsePayload(bodyText)

    if (response.ok) {
      return {
        ok: true,
        transient: false,
        status: response.status,
        payload,
      }
    }

    const transient = looksTransientHttpFailure(response.status, payload)
    lastFailure = {
      ok: false,
      transient,
      status: response.status,
      payload,
      error: null,
    }

    if (transient && attempt < attempts) {
      await sleep(250 * attempt)
      continue
    }

    return lastFailure
  }

  return lastFailure ?? {
    ok: false,
    transient: true,
    status: null,
    payload: null,
    error: 'unknown_failure',
  }
}
