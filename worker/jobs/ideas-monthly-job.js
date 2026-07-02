import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runIdeasMonthlyJob() {
  if (!CRON_SECRET) {
    logger.warn('ideas-monthly-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/ideas-monthly`
  const result = await callCronRoute({
    job: 'ideas-monthly-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/ideas-monthly-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('ideas-monthly-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('ideas-monthly-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`ideas-monthly route failed with status ${result.status}`)
  }

  logger.info('ideas-monthly-job: completed', result.payload)
}
