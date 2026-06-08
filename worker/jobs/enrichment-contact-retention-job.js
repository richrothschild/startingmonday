import { logger } from '../lib/logger.js'
import { sendWorkerSlackAlert } from '../lib/slack-alert.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runEnrichmentContactRetentionJob() {
  if (!CRON_SECRET) {
    await sendWorkerSlackAlert('*Enrichment retention hard failure*\n- Reason: CRON_SECRET is missing in worker runtime\n- Job: enrichment-contact-retention-job')
    throw new Error('enrichment-contact-retention-job: CRON_SECRET missing')
  }

  const url = `${APP_URL}/api/cron/enrichment-contact-retention`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': 'startingmonday-worker/enrichment-contact-retention-job',
    },
  })

  const bodyText = await response.text()
  let payload = null
  try {
    payload = bodyText ? JSON.parse(bodyText) : null
  } catch {
    payload = { raw: bodyText }
  }

  if (!response.ok) {
    logger.error('enrichment-contact-retention-job: web route failed', {
      status: response.status,
      body: payload,
    })
    throw new Error(`enrichment contact retention route failed with status ${response.status}`)
  }

  logger.info('enrichment-contact-retention-job: completed', payload)
}
