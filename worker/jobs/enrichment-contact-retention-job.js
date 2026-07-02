import { logger } from '../lib/logger.js'
import { sendWorkerSlackAlert } from '../lib/slack-alert.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runEnrichmentContactRetentionJob() {
  if (!CRON_SECRET) {
    await sendWorkerSlackAlert('*Enrichment retention hard failure*\n- Reason: CRON_SECRET is missing in worker runtime\n- Job: enrichment-contact-retention-job')
    throw new Error('enrichment-contact-retention-job: CRON_SECRET missing')
  }

  const url = `${APP_URL}/api/cron/enrichment-contact-retention`
  const result = await callCronRoute({
    job: 'enrichment-contact-retention-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/enrichment-contact-retention-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('enrichment-contact-retention-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('enrichment-contact-retention-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`enrichment contact retention route failed with status ${result.status}`)
  }

  logger.info('enrichment-contact-retention-job: completed', result.payload)
}
