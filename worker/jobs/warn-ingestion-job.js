import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { normalizeCompanyName } from '../lib/canonical-company.js'
import { fetchWarnNoticesForState } from '../signals/fetch-warn-notices.js'
import { upsertCompanyEvent } from '../signals/event-store.js'

const WARN_INGESTION_LOCK_KEY = 4478201955n
const DEFAULT_TOP_STATES = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI']

function topStates() {
  const configured = (process.env.WARN_TOP_STATES ?? '')
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)
  return configured.length ? configured : DEFAULT_TOP_STATES
}

export async function runWarnIngestionJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: WARN_INGESTION_LOCK_KEY })
  if (!locked) {
    logger.warn('warn-ingestion-job: another instance running — skipping')
    return
  }

  const stats = {
    states: 0,
    noticesFetched: 0,
    noticesUpserted: 0,
    layoffEvents: 0,
  }

  const canonicalCache = new Map()

  try {
    for (const stateCode of topStates()) {
      stats.states += 1
      const notices = await fetchWarnNoticesForState(stateCode)
      stats.noticesFetched += notices.length

      for (const notice of notices) {
        const { error: upsertError } = await supabase
          .from('warn_notices')
          .upsert(notice, { onConflict: 'state_code,notice_id' })

        if (upsertError) continue
        stats.noticesUpserted += 1

        const normalized = normalizeCompanyName(notice.employer_name)
        if (!normalized || !notice.event_date) continue

        if (!canonicalCache.has(normalized)) {
          const { data: canonical } = await supabase
            .from('canonical_companies')
            .select('id')
            .eq('name_normalized', normalized)
            .limit(1)
            .maybeSingle()
          canonicalCache.set(normalized, canonical?.id ?? null)
        }

        const canonicalCompanyId = canonicalCache.get(normalized)
        if (!canonicalCompanyId) continue

        const event = await upsertCompanyEvent(supabase, {
          canonicalCompanyId,
          eventType: 'layoff_warn',
          eventDate: notice.event_date,
          summary: `${notice.employer_name} filed a WARN notice in ${notice.state_code}${notice.job_losses ? ` affecting ${notice.job_losses} roles` : ''}.`,
          sourceUrl: notice.source_url,
          sourceKind: 'warn_notice',
          confidence: 70,
          focusTags: ['restructuring'],
          evidenceSnippets: [notice.notice_id],
          partnerEntities: [],
          modelVersion: 'warn_ingestion_v1',
        })

        if (event.eventId) stats.layoffEvents += 1
      }
    }

    logger.info('warn-ingestion-job: complete', stats)
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: WARN_INGESTION_LOCK_KEY })
  }
}
