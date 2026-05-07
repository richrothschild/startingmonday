import { logger } from '../lib/logger.js'

const BASE = 'https://nubela.co/proxycurl/api'

const EXEC_TOKENS = [
  'chief', 'ceo', 'cto', 'cio', 'coo', 'cfo', 'cmo', 'cso', 'ciso', 'cpo', 'cdo', 'cro',
  'president', 'vice president', 'vp ', ' vp', 'svp', 'evp', 'managing director',
  'general counsel', 'head of', 'principal',
]

// Fetch current exec team for a company via Proxycurl.
// If linkedinUrl is null, attempts company search by name (costs 1 extra credit).
// Returns array of { name, title, linkedin_url }.
export async function fetchProxycurlExecs(companyName, linkedinUrl = null) {
  const key = process.env.PROXYCURL_API_KEY
  if (!key) return []

  try {
    const companyUrl = linkedinUrl ?? await resolveLinkedinUrl(companyName, key)
    if (!companyUrl) return []

    const params = new URLSearchParams({
      linkedin_company_url: companyUrl,
      role_search:          'executive',
      employment_status:    'current',
      enrich_profiles:      'skip',
      page_size:            '50',
    })

    const res = await fetch(`${BASE}/linkedin/company/employees/?${params}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    })

    if (res.status === 404) return []
    if (!res.ok) {
      logger.warn('fetch-proxycurl-execs: non-200', { company: companyName, status: res.status })
      return []
    }

    const data = await res.json()
    return (data.employees ?? [])
      .map(e => ({
        name:         (e.profile?.full_name ?? '').trim(),
        title:        (e.profile?.occupation ?? '').trim(),
        linkedin_url: e.profile?.linkedin_profile_url ?? null,
      }))
      .filter(e => e.name && isExecutive(e.title))
  } catch (err) {
    logger.warn('fetch-proxycurl-execs: failed', { company: companyName, error: err.message })
    return []
  }
}

async function resolveLinkedinUrl(companyName, key) {
  try {
    const params = new URLSearchParams({ company_name: companyName, enrich_profiles: 'skip' })
    const res = await fetch(`${BASE}/linkedin/company/search?${params}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.url ?? null
  } catch {
    return null
  }
}

function isExecutive(title) {
  const t = title.toLowerCase()
  return EXEC_TOKENS.some(tok => t.includes(tok))
}
