// Canonical company resolution: maps per-user companies rows to shared
// canonical_companies rows. Match priority: SEC CIK > domain > normalized name.
// Get-or-create semantics with a per-process cache to avoid repeat lookups.

import { logger } from './logger.js'

const CORPORATE_SUFFIXES = /\b(incorporated|corporation|company|holdings|limited|group|inc|corp|co|ltd|llc|plc|lp|llp|sa|ag|gmbh|nv|ab|as|oy|spa)\b/g

// Normalizes a company name for entity matching: lowercase, strip corporate
// suffixes, punctuation, and whitespace runs.
export function normalizeCompanyName(name) {
  if (!name || typeof name !== 'string') return ''
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(CORPORATE_SUFFIXES, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extracts a bare registrable domain from a URL or hostname string.
export function extractDomain(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`
    const hostname = new URL(withScheme).hostname.toLowerCase()
    return hostname.replace(/^www\./, '') || null
  } catch {
    return null
  }
}

const _cache = new Map() // companyId -> canonicalCompanyId

export function clearCanonicalCache() {
  _cache.clear()
}

// Resolves (get-or-create) the canonical company for a per-user company row.
// Returns the canonical company id, or null when resolution is impossible.
// Never throws — callers degrade gracefully to the legacy write path.
export async function resolveCanonicalCompany(supabase, company) {
  if (!company?.id || !company?.name) return null
  if (_cache.has(company.id)) return _cache.get(company.id)

  try {
    // Fast path: already linked.
    if (company.canonical_company_id) {
      _cache.set(company.id, company.canonical_company_id)
      return company.canonical_company_id
    }

    const nameNormalized = normalizeCompanyName(company.name)
    if (!nameNormalized) return null
    const domain = extractDomain(company.company_url ?? null)
    const cik = company.sec_cik_padded ?? null

    // Match priority: CIK, then domain, then normalized name.
    let canonicalId = null
    if (cik) {
      const { data } = await supabase
        .from('canonical_companies')
        .select('id')
        .eq('sec_cik_padded', cik)
        .limit(1)
        .maybeSingle()
      canonicalId = data?.id ?? null
    }
    if (!canonicalId && domain) {
      const { data } = await supabase
        .from('canonical_companies')
        .select('id')
        .eq('domain', domain)
        .limit(1)
        .maybeSingle()
      canonicalId = data?.id ?? null
    }
    if (!canonicalId) {
      const { data } = await supabase
        .from('canonical_companies')
        .select('id')
        .eq('name_normalized', nameNormalized)
        .limit(1)
        .maybeSingle()
      canonicalId = data?.id ?? null
    }

    if (!canonicalId) {
      const { data: created, error: createError } = await supabase
        .from('canonical_companies')
        .insert({
          name: company.name,
          name_normalized: nameNormalized,
          domain,
          sec_cik_padded: cik,
          sector: company.sector ?? null,
          is_public_company: typeof company.is_public_company === 'boolean' ? company.is_public_company : null,
        })
        .select('id')
        .single()

      if (createError) {
        // Unique race: another writer created the same normalized name.
        const { data: existing } = await supabase
          .from('canonical_companies')
          .select('id')
          .eq('name_normalized', nameNormalized)
          .limit(1)
          .maybeSingle()
        canonicalId = existing?.id ?? null
      } else {
        canonicalId = created?.id ?? null
      }
    }

    if (canonicalId) {
      // Best-effort backlink; failure is non-fatal.
      await supabase
        .from('companies')
        .update({ canonical_company_id: canonicalId })
        .eq('id', company.id)
      _cache.set(company.id, canonicalId)
    }

    return canonicalId
  } catch (err) {
    logger.warn('canonical-company: resolution failed', { companyId: company.id, error: err.message })
    return null
  }
}
