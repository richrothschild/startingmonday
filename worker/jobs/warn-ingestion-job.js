import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { normalizeCompanyName } from '../lib/canonical-company.js'
import { fetchWarnNoticesForState } from '../signals/fetch-warn-notices.js'
import { upsertCompanyEvent } from '../signals/event-store.js'
import { WarnIngestionMetrics } from '../lib/warn-ingestion-metrics.js'
import { WarnNotificationService } from '../lib/warn-notifications.js'

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

  const metrics = new WarnIngestionMetrics()
  const notifications = new WarnNotificationService(supabase)
  const canonicalCache = new Map()
  const newWarnEvents = []

  try {
    for (const stateCode of topStates()) {
      let notices = []
      try {
        notices = await fetchWarnNoticesForState(stateCode)
        metrics.recordStateFetch(stateCode, notices.length)
      } catch (error) {
        metrics.recordError(stateCode, error)
        logger.error(`warn-ingestion-job: fetch error for ${stateCode}`, { error: error?.message })
        continue
      }

      let upsertedCount = 0
      let skippedCount = 0

      for (const notice of notices) {
        const { error: upsertError } = await supabase
          .from('warn_notices')
          .upsert(notice, { onConflict: 'state_code,notice_id' })

        if (upsertError) {
          skippedCount += 1
          continue
        }
        upsertedCount += 1

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

        if (event.eventId) {
          metrics.recordLayoffEvent(stateCode)
          newWarnEvents.push({
            canonicalCompanyId,
            employerName: notice.employer_name,
            stateCode,
            eventDate: notice.event_date,
            jobLosses: notice.job_losses,
          })
        }
      }

      metrics.recordStateUpsert(stateCode, upsertedCount, skippedCount)
    }

    // Send notifications for newly detected WARN events
    if (newWarnEvents.length > 0) {
      const notificationResults = await notifications.notifyBatch(newWarnEvents)
      logger.info('warn-ingestion-job: notifications sent', notificationResults)
    }

    metrics.logSummary()
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: WARN_INGESTION_LOCK_KEY })
  }
}
