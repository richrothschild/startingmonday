import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { sendWorkerSlackAlert } from '../lib/slack-alert.js'
import { getIngestDlqStats } from '../lib/ingest-dlq.js'

const DLQ_DEPTH_ALERT = Number(process.env.INGEST_DLQ_DEPTH_ALERT ?? 50)
const DLQ_AGE_ALERT_HOURS = Number(process.env.INGEST_DLQ_AGE_ALERT_HOURS ?? 24)

// Hourly monitor for the ingestion dead-letter queue. Alerts when unresolved
// classification failures pile up (depth) or go stale (age) — either means
// signals are being silently lost upstream.
export async function runDlqMonitorJob() {
  const supabase = getSupabase()
  const { depth, oldestAgeHours } = await getIngestDlqStats(supabase)

  logger.info('dlq-monitor-job: stats', {
    depth,
    oldestAgeHours: Math.round(oldestAgeHours * 10) / 10,
    depthThreshold: DLQ_DEPTH_ALERT,
    ageThresholdHours: DLQ_AGE_ALERT_HOURS,
  })

  const breaches = []
  if (depth > DLQ_DEPTH_ALERT) breaches.push(`depth ${depth} > ${DLQ_DEPTH_ALERT}`)
  if (oldestAgeHours > DLQ_AGE_ALERT_HOURS) {
    breaches.push(`oldest unresolved entry ${Math.round(oldestAgeHours)}h > ${DLQ_AGE_ALERT_HOURS}h`)
  }

  if (breaches.length === 0) return

  await sendWorkerSlackAlert(
    `*Ingest DLQ alert*\n- ${breaches.join('\n- ')}\n- Unresolved classification failures mean signals are being lost.\n- Check public.ingest_dlq and the classify-signal error field.`
  )
  logger.warn('dlq-monitor-job: alert sent', { depth, oldestAgeHours, breaches })
}
