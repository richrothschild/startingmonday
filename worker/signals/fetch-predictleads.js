import { logger } from '../lib/logger.js'

const PREDICTLEADS_BASE = 'https://predictleads.com/api/v3'

// Maps PredictLeads signal_type values to our internal signal taxonomy.
const SIGNAL_TYPE_MAP = {
  financing_round:        'funding',
  acquisition:            'acquisition',
  ipo:                    'ipo',
  layoffs:                'layoffs',
  new_office_expansion:   'expansion',
  new_client_announced:   'expansion',
  new_client:             'expansion',
  new_partnership:        'expansion',
  new_product_service:    'new_product',
  new_product_release:    'new_product',
  executive_departure:    'exec_departure',
  executive_hired:        'exec_hire',
  leadership_change:      'exec_departure',
  hiring_increased:       'expansion',
  award:                  'award',
  breach_disclosed:       'breach_disclosure',
  regulatory_action:      'regulatory_change',
}

// Fetch recent company signals from PredictLeads.
// Returns articles in the same shape as other signal fetchers:
// [{ title, description, link, pubDate, _predictleadsType }]
// _predictleadsType carries the raw PredictLeads type for direct signal writes (bypassing classify).
export async function fetchPredictLeadsSignals(companyDomain, companyName) {
  const key = process.env.PREDICTLEADS_API_KEY
  if (!key) return []

  const domain = extractDomain(companyDomain)
  if (!domain) return []

  try {
    const url = `${PREDICTLEADS_BASE}/companies/${encodeURIComponent(domain)}/signals`
    const res = await fetch(url, {
      headers: {
        'X-API-KEY': key,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (res.status === 404) return []
    if (!res.ok) {
      logger.warn('fetch-predictleads: non-200', { company: companyName, status: res.status })
      return []
    }

    const data = await res.json()
    const signals = data.data ?? []
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    return signals
      .map(s => {
        const attrs = s.attributes ?? {}
        const rawType = attrs.signal_type ?? attrs.event_type ?? ''
        const mappedType = SIGNAL_TYPE_MAP[rawType] ?? null
        if (!mappedType) return null

        const sigDate = (attrs.found_at ?? attrs.date ?? '').split('T')[0]
        if (!sigDate || sigDate < cutoff) return null

        return {
          title:               attrs.title ?? `${companyName}: ${rawType.replace(/_/g, ' ')}`,
          description:         attrs.description ?? attrs.title ?? '',
          link:                attrs.url ?? attrs.source_url ?? null,
          pubDate:             sigDate,
          _predictleadsType:   mappedType,
        }
      })
      .filter(Boolean)
      .slice(0, 5)
  } catch (err) {
    logger.warn('fetch-predictleads: failed', { company: companyName, error: err.message })
    return []
  }
}

function extractDomain(url) {
  if (!url) return null
  try {
    if (!url.includes('://')) url = `https://${url}`
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
