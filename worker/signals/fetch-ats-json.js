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

function detectProvider(careerPageUrl) {
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
  const payload = await fetchJson(`https://jobs.ashbyhq.com/api/non-user-portal/${encodeURIComponent(org)}/job-posting`)
  const postings = payload.jobs ?? payload.openings ?? []
  return (Array.isArray(postings) ? postings : []).map((job) => ({
    role_title: job.title,
    role_url: job.absoluteUrl ?? job.url,
    opened_on: job.publishedDate ? new Date(job.publishedDate).toISOString().slice(0, 10) : null,
    raw: job,
  }))
}

export async function fetchAtsOpenings(careerPageUrl) {
  const source = detectProvider(careerPageUrl)
  if (!source) return { provider: null, openings: [] }

  try {
    let openings = []
    if (source.provider === 'greenhouse') openings = await fetchGreenhouse(source.token)
    else if (source.provider === 'lever') openings = await fetchLever(source.token)
    else if (source.provider === 'ashby') openings = await fetchAshby(source.token)

    return {
      provider: source.provider,
      openings: openings
        .filter((opening) => opening.role_title && opening.role_url)
        .filter((opening) => isLeadershipTitle(opening.role_title)),
    }
  } catch {
    return { provider: source.provider, openings: [] }
  }
}
