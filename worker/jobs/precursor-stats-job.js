// Nightly precursor-stats aggregation (T2.5). Computes Laplace-smoothed
// P(role opening within window | event type) per sector and role family.
// Correctness rules:
// - Only events whose outcome window has fully elapsed are counted
//   (event_date <= today - window), so open windows never dilute rates.
// - Openings flagged exclude_from_public_stats are never counted.
// - Sources under derived-data quarantine (K7) are excluded via
//   QUARANTINED_SOURCE_KINDS (comma-separated source_kind values).

import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { aggregatePrecursorStats } from '../lib/precursor-stats-core.js'

const PRECURSOR_STATS_LOCK_KEY = 3958216740n
const WINDOW_DAYS = Number(process.env.PRECURSOR_WINDOW_DAYS ?? 90)
const LOOKBACK_DAYS = Number(process.env.PRECURSOR_LOOKBACK_DAYS ?? 400)
const PAGE_SIZE = 1000

function quarantinedSourceKinds() {
  return new Set(
    (process.env.QUARANTINED_SOURCE_KINDS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  )
}

export async function runPrecursorStatsJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: PRECURSOR_STATS_LOCK_KEY })
  if (!locked) {
    logger.warn('precursor-stats-job: another instance running — skipping')
    return
  }

  try {
    const today = new Date()
    const windowCutoff = new Date(today.getTime() - WINDOW_DAYS * 86400000).toISOString().slice(0, 10)
    const lookbackCutoff = new Date(today.getTime() - LOOKBACK_DAYS * 86400000).toISOString().slice(0, 10)
    const quarantined = quarantinedSourceKinds()

    // Page through closed-window events.
    const events = []
    let offset = 0
    for (;;) {
      const { data: page, error } = await supabase
        .from('company_events')
        .select('id, event_type, event_date, canonical_company_id, sources')
        .gte('event_date', lookbackCutoff)
        .lte('event_date', windowCutoff)
        .order('event_date', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) {
        logger.error('precursor-stats-job: event fetch failed', { error: error.message })
        return
      }
      if (!page?.length) break
      events.push(...page)
      if (page.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    if (!events.length) {
      logger.info('precursor-stats-job: no closed-window events yet')
      return
    }

    // K7 quarantine: drop events whose sources are all quarantined kinds.
    const usableEvents = quarantined.size === 0
      ? events
      : events.filter(event => {
          const kinds = (Array.isArray(event.sources) ? event.sources : [])
            .map(s => s?.source_kind)
            .filter(Boolean)
          if (!kinds.length) return true
          return kinds.some(kind => !quarantined.has(kind))
        })

    // Sector lookup for the events' companies.
    const companyIds = [...new Set(usableEvents.map(e => e.canonical_company_id))]
    const sectorByCompany = new Map()
    for (let i = 0; i < companyIds.length; i += PAGE_SIZE) {
      const chunk = companyIds.slice(i, i + PAGE_SIZE)
      const { data: rows } = await supabase
        .from('canonical_companies')
        .select('id, sector')
        .in('id', chunk)
      for (const row of rows ?? []) sectorByCompany.set(row.id, row.sector ?? null)
    }

    // Labels within the window, joined to countable openings.
    const labelsByEvent = new Map()
    const eventIds = usableEvents.map(e => e.id)
    for (let i = 0; i < eventIds.length; i += PAGE_SIZE) {
      const chunk = eventIds.slice(i, i + PAGE_SIZE)
      const { data: labels } = await supabase
        .from('event_outcome_labels')
        .select('event_id, days_to_opening, role_openings(role_family, exclude_from_public_stats)')
        .in('event_id', chunk)
        .gte('days_to_opening', 0)
        .lte('days_to_opening', WINDOW_DAYS)

      for (const label of labels ?? []) {
        const opening = label.role_openings
        if (!opening || opening.exclude_from_public_stats) continue
        if (!labelsByEvent.has(label.event_id)) labelsByEvent.set(label.event_id, [])
        labelsByEvent.get(label.event_id).push({
          days_to_opening: label.days_to_opening,
          role_family: opening.role_family,
        })
      }
    }

    const statEvents = usableEvents.map(e => ({
      id: e.id,
      event_type: e.event_type,
      sector: sectorByCompany.get(e.canonical_company_id) ?? null,
    }))

    const rows = aggregatePrecursorStats(statEvents, labelsByEvent, { windowDays: WINDOW_DAYS })

    const { error: upsertError } = await supabase
      .from('precursor_stats')
      .upsert(
        rows.map(row => ({ ...row, computed_at: new Date().toISOString() })),
        { onConflict: 'event_type,sector,role_family,window_days' }
      )

    if (upsertError) {
      logger.error('precursor-stats-job: upsert failed', { error: upsertError.message })
      return
    }

    logger.info('precursor-stats-job: complete', {
      events: usableEvents.length,
      labeledEvents: labelsByEvent.size,
      statRows: rows.length,
      quarantinedKinds: [...quarantined],
    })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: PRECURSOR_STATS_LOCK_KEY })
  }
}
