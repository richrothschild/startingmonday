import { logger } from '../lib/logger.js'
import { sendWorkerSlackAlert } from '../lib/slack-alert.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runEdgarFreshnessAuditJob() {
  if (!CRON_SECRET) {
    await sendWorkerSlackAlert('*EDGAR freshness hard failure*\n- Reason: CRON_SECRET is missing in worker runtime\n- Job: edgar-freshness-audit-job')
    throw new Error('edgar-freshness-audit-job: CRON_SECRET missing')
  }

  const url = `${APP_URL}/api/cron/edgar-freshness-audit`
  const result = await callCronRoute({
    job: 'edgar-freshness-audit-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/edgar-freshness-audit-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('edgar-freshness-audit-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('edgar-freshness-audit-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`edgar-freshness-audit route failed with status ${result.status}`)
  }

  logger.info('edgar-freshness-audit-job: completed', result.payload)
}
