// Canonical event store: upserts deduplicated company events.
// Same real-world event arriving from multiple sources (news, PR wire, SEC,
// PredictLeads) merges into one row with an incremented corroboration count.

import crypto from 'crypto'
import { logger } from '../lib/logger.js'
import {
  DEDUP_DATE_WINDOW_DAYS,
  normalizeSummary,
  findMergeCandidate,
} from './event-dedup-core.js'

function isoDateOffset(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// Upserts an event for a canonical company. Returns
// { eventId, merged } or { eventId: null } on failure (callers degrade).
export async function upsertCompanyEvent(supabase, {
  canonicalCompanyId,
  eventType,
  eventDate,
  summary,
  sourceUrl = null,
  sourceKind = null,
  confidence = null,
  focusTags = [],
  evidenceSnippets = [],
  partnerEntities = [],
  filingForm = null,
  filingItems = [],
  modelVersion = null,
}) {
  if (!canonicalCompanyId || !eventType || !eventDate || !summary) return { eventId: null, merged: false }

  try {
    const summaryNormalized = normalizeSummary(summary)

    const { data: candidates } = await supabase
      .from('company_events')
      .select('id, event_date, summary, summary_normalized, corroboration_count, sources')
      .eq('canonical_company_id', canonicalCompanyId)
      .eq('event_type', eventType)
      .gte('event_date', isoDateOffset(eventDate, -DEDUP_DATE_WINDOW_DAYS))
      .lte('event_date', isoDateOffset(eventDate, DEDUP_DATE_WINDOW_DAYS))
      .limit(20)

    const incoming = { event_date: eventDate, summary, summary_normalized: summaryNormalized }
    const match = findMergeCandidate(candidates ?? [], incoming)

    const sourceEntry = {
      url: sourceUrl,
      source_kind: sourceKind,
      first_seen_at: new Date().toISOString(),
    }

    if (match) {
      const existingSources = Array.isArray(match.sources) ? match.sources : []
      const alreadyHasUrl = sourceUrl && existingSources.some(s => s?.url === sourceUrl)
      const updatedSources = alreadyHasUrl ? existingSources : [...existingSources, sourceEntry]

      const { error: updateError } = await supabase
        .from('company_events')
        .update({
          corroboration_count: (match.corroboration_count ?? 1) + (alreadyHasUrl ? 0 : 1),
          sources: updatedSources,
          updated_at: new Date().toISOString(),
        })
        .eq('id', match.id)

      if (updateError) {
        logger.warn('event-store: merge update failed', { eventId: match.id, error: updateError.message })
        return { eventId: match.id, merged: true }
      }
      return { eventId: match.id, merged: true }
    }

    const contentHash = crypto
      .createHash('sha256')
      .update(`${eventType}|${eventDate}|${summaryNormalized}`)
      .digest('hex')

    const { data: created, error: insertError } = await supabase
      .from('company_events')
      .insert({
        canonical_company_id: canonicalCompanyId,
        event_type: eventType,
        event_date: eventDate,
        summary,
        summary_normalized: summaryNormalized,
        sources: [sourceEntry],
        confidence: typeof confidence === 'number' ? confidence : null,
        focus_tags: Array.isArray(focusTags) ? focusTags.slice(0, 3) : [],
        evidence_snippets: Array.isArray(evidenceSnippets) ? evidenceSnippets.slice(0, 2) : [],
        partner_entities: Array.isArray(partnerEntities) ? partnerEntities.slice(0, 3) : [],
        filing_form: filingForm ?? null,
        filing_items: Array.isArray(filingItems) ? filingItems : [],
        raw_fetch_ref: sourceUrl,
        content_hash: contentHash,
        model_version: modelVersion,
      })
      .select('id')
      .single()

    if (insertError) {
      logger.warn('event-store: insert failed', { canonicalCompanyId, eventType, error: insertError.message })
      return { eventId: null, merged: false }
    }
    return { eventId: created?.id ?? null, merged: false }
  } catch (err) {
    logger.warn('event-store: upsert threw', { canonicalCompanyId, eventType, error: err.message })
    return { eventId: null, merged: false }
  }
}
