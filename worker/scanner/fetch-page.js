const BROWSERLESS_URL = 'https://production-sfo.browserless.io/chromium/content'

// Block private/internal addresses to prevent SSRF attacks.
function isAllowedUrl(urlStr) {
  try {
    const url = new URL(urlStr)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    const h = url.hostname.toLowerCase()
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return false
    if (/^10\./.test(h)) return false
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false
    if (/^192\.168\./.test(h)) return false
    if (h === '169.254.169.254') return false // cloud metadata endpoints
    return true
  } catch {
    return false
  }
}

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const BROWSER_HEADERS = {
  'User-Agent': CHROME_UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
}

// Sites that actively block bots — 403 from these means don't bother retrying.
const BLOCKED_STATUSES = new Set([401, 403, 451])

export class BlockedError extends Error {
  constructor(url, status) {
    super(`Site blocked access (HTTP ${status}) — ${url}`)
    this.blocked = true
    this.status = status
  }
}

// Fetch a career page. Strategy:
// 1. Plain fetch with browser-like headers — fast, free, works on many static pages.
//    If it 403s, the site is actively blocking bots — no point trying Browserless.
//    If it returns substantial content, use it and skip the Browserless credit.
// 2. Browserless (JS-rendered) — for SPA career pages or when plain fetch returns sparse HTML.
export async function fetchPage(url) {
  if (!isAllowedUrl(url)) {
    throw new Error(`fetchPage: blocked URL — ${url}`)
  }

  const apiKey = process.env.BROWSERLESS_API_KEY

  // Step 1: plain fetch
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    })

    if (BLOCKED_STATUSES.has(res.status)) {
      throw new BlockedError(url, res.status)
    }

    if (res.ok) {
      const html = await res.text()
      // Substantial content means the page isn't just a JS shell — use it.
      if (html.length > 2000) {
        console.log(`[fetch-page] plain fetch: ${html.length} chars — skipping Browserless`)
        return html
      }
    }
    // Got 2xx but sparse HTML — probably a JS-rendered SPA. Fall through to Browserless.
  } catch (err) {
    if (err.blocked) throw err  // BlockedError: propagate immediately, skip Browserless
    // Other error (timeout, ENOTFOUND, etc.) — try Browserless
    console.log(`[fetch-page] plain fetch failed (${err.message}) — trying Browserless`)
  }

  // Step 2: Browserless
  if (!apiKey) {
    console.warn('[fetch-page] No BROWSERLESS_API_KEY — skipping Browserless')
    throw new Error('No BROWSERLESS_API_KEY configured')
  }

  return fetchViaBrowserless(url, apiKey)
}

async function fetchViaBrowserless(url, apiKey) {
  const res = await fetch(`${BROWSERLESS_URL}?token=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      gotoOptions: { waitUntil: 'networkidle2', timeout: 25000 },
      userAgent: CHROME_UA,
      setExtraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
      },
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (BLOCKED_STATUSES.has(res.status)) {
    throw new BlockedError(url, res.status)
  }

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Browserless ${res.status}: ${body.slice(0, 200)}`)
  }

  return res.text()
}
