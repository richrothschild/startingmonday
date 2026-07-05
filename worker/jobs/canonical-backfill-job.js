import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { resolveCanonicalCompany, clearCanonicalCache } from '../lib/canonical-company.js'
import { upsertCompanyEvent } from '../signals/event-store.js'

const BACKFILL_LOCK_KEY = 8146290573n
const BATCH_SIZE = Number(process.env.CANONICAL_BACKFILL_BATCH ?? 500)

// Clusters historical company_signals rows (event_id is null) into canonical
// company_events. Runs daily with a batch cap and exits fast when nothing is
// left — safe to leave scheduled indefinitely.
export async function runCanonicalBackfillJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: BACKFILL_LOCK_KEY })
  if (!locked) {
    logger.warn('canonical-backfill-job: another instance running — skipping')
    return
  }

  clearCanonicalCache()
  let processed = 0
  let linked = 0
  let merged = 0
  let unresolved = 0

  try {
    const { data: signals, error } = await supabase
      .from('company_signals')
      .select('id, company_id, signal_type, signal_summary, signal_date, source_url, source_kind, confidence, focus_tags, evidence_snippets, partner_entities, filing_form, filing_items')
      .is('event_id', null)
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE)

    if (error) {
      logger.error('canonical-backfill-job: fetch failed', { error: error.message })
      return
    }
    if (!signals?.length) {
      logger.info('canonical-backfill-job: nothing to backfill')
      return
    }

    // Fetch the distinct companies for this batch in one query.
    const companyIds = [...new Set(signals.map(s => s.company_id))]
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, company_url, sector, is_public_company, sec_cik_padded, canonical_company_id')
      .in('id', companyIds)
    const companyById = new Map((companies ?? []).map(c => [c.id, c]))

    for (const signal of signals) {
      processed++
      const company = companyById.get(signal.company_id)
      if (!company || !signal.signal_type || !signal.signal_summary || !signal.signal_date) {
        unresolved++
        continue
      }

      const canonicalCompanyId = await resolveCanonicalCompany(supabase, company)
      if (!canonicalCompanyId) {
        unresolved++
        continue
      }

      const eventResult = await upsertCompanyEvent(supabase, {
        canonicalCompanyId,
        eventType: signal.signal_type,
        eventDate: signal.signal_date,
        summary: signal.signal_summary,
        sourceUrl: signal.source_url,
        sourceKind: signal.source_kind,
        confidence: signal.confidence,
        focusTags: signal.focus_tags ?? [],
        evidenceSnippets: signal.evidence_snippets ?? [],
        partnerEntities: signal.partner_entities ?? [],
        filingForm: signal.filing_form,
        filingItems: signal.filing_items ?? [],
        modelVersion: 'backfill',
      })

      if (!eventResult.eventId) {
        unresolved++
        continue
      }

      const { error: linkError } = await supabase
        .from('company_signals')
        .update({ event_id: eventResult.eventId })
        .eq('id', signal.id)

      if (linkError) {
        logger.warn('canonical-backfill-job: link failed', { signalId: signal.id, error: linkError.message })
        unresolved++
        continue
      }

      linked++
      if (eventResult.merged) merged++
    }

    logger.info('canonical-backfill-job: complete', { processed, linked, merged, unresolved, batchSize: BATCH_SIZE })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: BACKFILL_LOCK_KEY })
  }
}
