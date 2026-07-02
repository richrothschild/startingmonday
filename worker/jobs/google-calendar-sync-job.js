import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runGoogleCalendarSyncJob() {
  if (!CRON_SECRET) {
    logger.warn('google-calendar-sync-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/google-calendar-sync`
  const result = await callCronRoute({
    job: 'google-calendar-sync-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/google-calendar-sync-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('google-calendar-sync-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('google-calendar-sync-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`google calendar sync route failed with status ${result.status}`)
  }

  logger.info('google-calendar-sync-job: completed', {
    status: result.status,
    payload: result.payload,
  })
}
