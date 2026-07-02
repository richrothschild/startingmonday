import { logger } from '../lib/logger.js'
import { sendWorkerSlackAlert } from '../lib/slack-alert.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runApolloQualityAuditJob() {
  if (!CRON_SECRET) {
    await sendWorkerSlackAlert('*Apollo quality audit hard failure*\n- Reason: CRON_SECRET is missing in worker runtime\n- Job: apollo-quality-audit-job')
    throw new Error('apollo-quality-audit-job: CRON_SECRET missing')
  }

  const url = `${APP_URL}/api/cron/apollo-quality-audit`
  const result = await callCronRoute({
    job: 'apollo-quality-audit-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/apollo-quality-audit-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('apollo-quality-audit-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('apollo-quality-audit-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`apollo-quality-audit route failed with status ${result.status}`)
  }

  logger.info('apollo-quality-audit-job: completed', result.payload)
}
