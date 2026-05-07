import { logger } from '../lib/logger.js'

const PDL_SEARCH = 'https://api.peopledatalabs.com/v5/person/search'

// Seniority levels PDL considers executive
const EXEC_LEVELS = ['c_suite', 'vp', 'partner', 'head', 'owner', 'founder']

// Fetch current exec team for a company via People Data Labs.
// Prefers domain match (company_url) over name match for precision.
// Returns array of { name, title, linkedin_url }.
export async function fetchPdlExecs(companyName, companyUrl = null) {
  const key = process.env.PDL_API_KEY
  if (!key) return []

  try {
    const domain = companyUrl ? extractDomain(companyUrl) : null

    const companyFilter = domain
      ? { term: { job_company_website: domain } }
      : { match: { job_company_name: companyName } }

    const body = {
      query: {
        bool: {
          must: [
            companyFilter,
            { terms: { job_title_levels: EXEC_LEVELS } },
          ],
        },
      },
      size: 50,
    }

    const res = await fetch(PDL_SEARCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': key,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    })

    if (res.status === 404) return []
    if (!res.ok) {
      logger.warn('fetch-pdl-execs: non-200', { company: companyName, status: res.status })
      return []
    }

    const data = await res.json()
    return (data.data ?? [])
      .map(p => ({
        name:         (p.full_name ?? '').trim(),
        title:        (p.job_title ?? '').trim(),
        linkedin_url: p.linkedin_url ?? null,
      }))
      .filter(e => e.name)
  } catch (err) {
    logger.warn('fetch-pdl-execs: failed', { company: companyName, error: err.message })
    return []
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
