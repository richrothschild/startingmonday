import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runOutreachReconcileJob() {
  if (!CRON_SECRET) {
    logger.warn('outreach-reconcile-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/outreach-reconcile?days=14&limit=1000`
  const result = await callCronRoute({
    job: 'outreach-reconcile-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/outreach-reconcile-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('outreach-reconcile-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('outreach-reconcile-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`outreach reconcile route failed with status ${result.status}`)
  }

  logger.info('outreach-reconcile-job: completed', result.payload)
}
