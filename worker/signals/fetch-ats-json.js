// T3.4 — ATS JSON pollers (Greenhouse, Lever, Ashby). Structured job feeds
// replace HTML scraping where available: postings carry stable URLs and
// open timestamps that feed the outcome labeler directly.
//
// Detection happens two ways:
// 1. career_page_url already points at an ATS-hosted board (fast path)
// 2. token probing — candidate board tokens derived from the company name
//    and domain are probed against each provider's public JSON endpoint

import { isLeadershipTitle } from '../lib/outcome-labels.js'

function parseUrl(value) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

function withTimeout(ms = 12000) {
  return AbortSignal.timeout(ms)
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: withTimeout() })
  if (!response.ok) throw new Error(`ats_fetch_failed:${response.status}`)
  return response.json()
}

// Detects an ATS provider when the career page URL is ATS-hosted. Pure.
export function detectProviderFromUrl(careerPageUrl) {
  const parsed = parseUrl(careerPageUrl)
  if (!parsed) return null

  const host = parsed.hostname.toLowerCase()
  const pathParts = parsed.pathname.split('/').filter(Boolean)

  if (host.includes('greenhouse.io')) {
    const boardToken = pathParts[pathParts.length - 1]
    return boardToken ? { provider: 'greenhouse', token: boardToken } : null
  }

  if (host.includes('lever.co')) {
    const account = pathParts[0]
    return account ? { provider: 'lever', token: account } : null
  }

  if (host.includes('ashbyhq.com')) {
    const org = pathParts[0]
    return org ? { provider: 'ashby', token: org } : null
  }

  return null
}

// Candidate board tokens for probing, derived from company name and domain.
// Pure. Ordered most-likely first; deduplicated.
export function candidateTokens({ name, domain }) {
  const tokens = []
  const domainLabel = (domain ?? '').split('.')[0]?.toLowerCase() ?? ''
  if (domainLabel && domainLabel.length > 1) tokens.push(domainLabel)

  const base = (name ?? '')
    .toLowerCase()
    .replace(/\b(inc|llc|ltd|corp|corporation|company|co|group|holdings|technologies|labs)\b\.?/g, ' ')
    .trim()
  if (base) {
    const squashed = base.replace(/[^a-z0-9]/g, '')
    const hyphenated = base.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (squashed.length > 1) tokens.push(squashed)
    if (hyphenated.length > 1 && hyphenated !== squashed) tokens.push(hyphenated)
  }
  return [...new Set(tokens)]
}

async function fetchGreenhouse(boardToken) {
  const payload = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs`)
  return (payload.jobs ?? []).map((job) => ({
    role_title: job.title,
    role_url: job.absolute_url,
    opened_on: job.updated_at ? new Date(job.updated_at).toISOString().slice(0, 10) : null,
    raw: job,
  }))
}

async function fetchLever(account) {
  const payload = await fetchJson(`https://api.lever.co/v0/postings/${encodeURIComponent(account)}?mode=json`)
  return (Array.isArray(payload) ? payload : []).map((job) => ({
    role_title: job.text,
    role_url: job.hostedUrl,
    opened_on: job.createdAt ? new Date(job.createdAt).toISOString().slice(0, 10) : null,
    raw: job,
  }))
}

async function fetchAshby(org) {
  // Official public posting API: https://developers.ashbyhq.com/docs/public-job-posting-api
  const payload = await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(org)}`)
  const postings = payload.jobs ?? []
  return (Array.isArray(postings) ? postings : []).map((job) => ({
    role_title: job.title,
    role_url: job.jobUrl ?? job.applyUrl ?? job.url,
    opened_on: (job.publishedAt ?? job.publishedDate)
      ? new Date(job.publishedAt ?? job.publishedDate).toISOString().slice(0, 10)
      : null,
    raw: job,
  }))
}

const FETCHERS = {
  greenhouse: fetchGreenhouse,
  lever: fetchLever,
  ashby: fetchAshby,
}

const PROVIDERS = Object.keys(FETCHERS)

// Fetches all postings for a known board; returns leadership postings only.
// Never throws — an unreachable board yields an empty list.
export async function fetchBoardOpenings(provider, token) {
  const fetcher = FETCHERS[provider]
  if (!fetcher || !token) return []
  try {
    const openings = await fetcher(token)
    return openings
      .filter((opening) => opening.role_title && opening.role_url)
      .filter((opening) => isLeadershipTitle(opening.role_title))
  } catch {
    return []
  }
}

// Probes for an ATS board: URL detection first, then token probing across
// providers. Returns { provider, token, via } or null. Never throws.
export async function probeAtsBoard({ name, domain, careerPageUrl }) {
  const fromUrl = detectProviderFromUrl(careerPageUrl)
  if (fromUrl) return { ...fromUrl, via: 'career_page_url' }

  for (const token of candidateTokens({ name, domain })) {
    for (const provider of PROVIDERS) {
      try {
        const openings = await FETCHERS[provider](token)
        // A live board returns an array (possibly empty). Errors throw above.
        if (Array.isArray(openings)) return { provider, token, via: 'probe' }
      } catch {
        // 404 / non-JSON → not this provider+token; keep probing
      }
    }
  }
  return null
}

// Back-compat: single-call fetch for an ATS-hosted career page URL.
export async function fetchAtsOpenings(careerPageUrl) {
  const source = detectProviderFromUrl(careerPageUrl)
  if (!source) return { provider: null, openings: [] }
  const openings = await fetchBoardOpenings(source.provider, source.token)
  return { provider: source.provider, openings }
}
