// Inserts a signal into company_signals. Skips if source_url already exists for this company.
// Canonical layer (E1): resolves the shared canonical company, dedups the event
// across sources into company_events, and links the per-user signal row to the
// event. Any canonical-layer failure degrades gracefully to the legacy write.
// Tries to persist enrichment metadata when available; falls back gracefully if columns are not deployed yet.

import { resolveCanonicalCompany } from '../lib/canonical-company.js'
import { upsertCompanyEvent } from './event-store.js'
import { recordSourceMetric } from '../lib/source-metrics.js'
import { HAIKU } from '../lib/models.js'
import { logger } from '../lib/logger.js'

const VALID_SIGNAL_TYPES = [
  'funding', 'exec_departure', 'exec_hire', 'acquisition',
  'expansion', 'layoffs', 'ipo', 'new_product', 'award',
  'pattern_alert', 'filing_trend',
  'breach_disclosure', 'regulatory_change',
  'data_platform', 'ai_investment',
  'board_change', 'transformation_budget',
  'activist_entry', 'insider_sale', 'partnership'
]

export async function writeSignal(supabase, {
  companyId,
  userId,
  signalType,
  signalSummary,
  sourceUrl,
  signalDate,
  outreachAngle,
  confidence = null,
  sourceKind = null,
  focusTags = [],
  evidenceSnippets = [],
  filingForm = null,
  filingItems = [],
  partnerEntities = [],
}) {
  // Validate signal type
  if (!signalType || !VALID_SIGNAL_TYPES.includes(signalType)) {
    throw new Error(`writeSignal: invalid signal_type "${signalType}". Must be one of: ${VALID_SIGNAL_TYPES.join(', ')}`)
  }

  if (sourceUrl) {
    const { data: existing } = await supabase
      .from('company_signals')
      .select('id')
      .eq('company_id', companyId)
      .eq('source_url', sourceUrl)
      .maybeSingle()
    if (existing) {
      recordSourceMetric(sourceKind, 'signals_skipped')
      return { skipped: true }
    }
  }

  // Canonical event layer: resolve company, dedup event across sources.
  // Wrapped so any failure falls back to the legacy per-user write path.
  let eventId = null
  try {
    const { data: companyRow } = await supabase
      .from('companies')
      .select('id, name, company_url, sector, is_public_company, sec_cik_padded, canonical_company_id')
      .eq('id', companyId)
      .maybeSingle()

    const canonicalCompanyId = await resolveCanonicalCompany(supabase, companyRow)
    if (canonicalCompanyId) {
      const eventResult = await upsertCompanyEvent(supabase, {
        canonicalCompanyId,
        eventType: signalType,
        eventDate: signalDate,
        summary: signalSummary,
        sourceUrl,
        sourceKind,
        confidence,
        focusTags,
        evidenceSnippets,
        partnerEntities,
        filingForm,
        filingItems,
        modelVersion: HAIKU,
      })
      eventId = eventResult.eventId
      if (eventId) {
        recordSourceMetric(sourceKind, eventResult.merged ? 'events_merged' : 'events_created')
      }

      // Cross-source dedup: if this user already has a signal for this event,
      // skip the duplicate projection (kills duplicate storms).
      if (eventId && userId) {
        const { data: existingProjection } = await supabase
          .from('company_signals')
          .select('id')
          .eq('company_id', companyId)
          .eq('event_id', eventId)
          .limit(1)
          .maybeSingle()
        if (existingProjection) {
          recordSourceMetric(sourceKind, 'signals_skipped')
          return { skipped: true, eventId }
        }
      }
    }
  } catch (err) {
    logger.warn('writeSignal: canonical layer failed; using legacy path', { companyId, error: err.message })
    eventId = null
  }

  const basePayload = {
    company_id: companyId,
    user_id: userId,
    signal_type: signalType,
    signal_summary: signalSummary,
    source_url: sourceUrl ?? null,
    signal_date: signalDate,
    outreach_angle: outreachAngle ?? null,
    notified_at: null,
  }

  const enrichedPayload = {
    ...basePayload,
    confidence: typeof confidence === 'number' ? confidence : null,
    source_kind: sourceKind ?? null,
    focus_tags: Array.isArray(focusTags) ? focusTags.slice(0, 3) : [],
    evidence_snippets: Array.isArray(evidenceSnippets) ? evidenceSnippets.slice(0, 2) : [],
    filing_form: filingForm ?? null,
    filing_items: Array.isArray(filingItems) ? filingItems : [],
    partner_entities: Array.isArray(partnerEntities) ? partnerEntities.slice(0, 3) : [],
    ...(eventId ? { event_id: eventId } : {}),
  }

  let inserted = null
  let error = null

  ;({ data: inserted, error } = await supabase
    .from('company_signals')
    .insert(enrichedPayload)
    .select('id')
    .single())

  if (error) {
    // Backward compatibility: if metadata columns are not deployed yet, retry with base payload.
    ;({ data: inserted, error } = await supabase
      .from('company_signals')
      .insert(basePayload)
      .select('id')
      .single())
  }

  if (error) throw new Error(`writeSignal: ${error.message}`)
  recordSourceMetric(sourceKind, 'signals_written')
  return { skipped: false, signalId: inserted?.id ?? null, eventId }
}
