// E2.4 — Sector-level regulatory pressure calendar.
// Checks a company's sector against active regulatory events.
// Returns signal objects for any active events not already signaled in the past 90 days.
// No external network calls — runs entirely against the local database.

// Maps keywords found in companies.sector (free text) to regulatory sector tags.
// A company matches an event if ANY of its resolved tags appear in the event's sector_tags array.
const SECTOR_TAG_MAP = [
  { keywords: ['healthcare', 'health system', 'hospital', 'clinical', 'pharma', 'life sciences'], tags: ['healthcare', 'health_tech', 'life_sciences'] },
  { keywords: ['financial', 'banking', 'bank', 'insurance', 'wealth', 'asset management', 'fintech', 'payments'], tags: ['financial_services', 'banking', 'insurance', 'fintech'] },
  { keywords: ['defense', 'aerospace', 'government', 'federal', 'dod', 'public sector'], tags: ['defense', 'government', 'aerospace'] },
  { keywords: ['manufacturing', 'industrial'], tags: ['manufacturing'] },
  { keywords: ['technology', 'software', 'saas', 'cloud', 'it services', 'cybersecurity', 'data', 'ai', 'tech'], tags: ['technology', 'cloud', 'saas'] },
  { keywords: ['retail', 'e-commerce', 'consumer', 'cpg'], tags: ['retail'] },
]

// Public companies (is_public_company = true) always get the 'public_company' tag.

export async function checkRegulatoryCalendar(company, { supabase, userId }) {
  const today = new Date().toISOString().split('T')[0]

  // Resolve sector tags for this company.
  const sectorTags = resolveSectorTags(company.sector ?? '', company.is_public_company ?? false)
  if (!sectorTags.length) return []

  // Fetch active regulatory events matching any of this company's sector tags.
  // active_until IS NULL means ongoing; active_from must be in the past.
  const { data: events } = await supabase
    .from('regulatory_events')
    .select('id, name, signal_summary, outreach_angle, severity, sector_tags')
    .lte('active_from', today)
    .or('active_until.is.null,active_until.gte.' + today)

  if (!events?.length) return []

  const matched = events.filter(ev =>
    ev.sector_tags.some(tag => sectorTags.includes(tag))
  )
  if (!matched.length) return []

  // 90-day dedup: check which events have already been signaled for this company.
  const quarterSlot = Math.floor(Date.now() / (90 * 24 * 60 * 60 * 1000))
  const existingUrls = new Set()

  const candidateUrls = matched.map(ev => `regulatory://${ev.id}/${company.id}/${quarterSlot}`)
  const { data: existing } = await supabase
    .from('company_signals')
    .select('source_url')
    .eq('company_id', company.id)
    .eq('user_id', userId)
    .in('source_url', candidateUrls)

  for (const row of existing ?? []) existingUrls.add(row.source_url)

  // Return signals for events not yet fired this quarter.
  return matched
    .map(ev => {
      const sourceUrl = `regulatory://${ev.id}/${company.id}/${quarterSlot}`
      if (existingUrls.has(sourceUrl)) return null
      return {
        signal_summary:  ev.signal_summary,
        outreach_angle:  ev.outreach_angle ?? null,
        sourceUrl,
        eventName:       ev.name,
      }
    })
    .filter(Boolean)
}

function resolveSectorTags(sectorText, isPublic) {
  const lower = sectorText.toLowerCase()
  const tags  = isPublic ? ['public_company'] : []

  for (const { keywords, tags: mappedTags } of SECTOR_TAG_MAP) {
    if (keywords.some(kw => lower.includes(kw))) {
      for (const t of mappedTags) if (!tags.includes(t)) tags.push(t)
    }
  }

  return tags
}
