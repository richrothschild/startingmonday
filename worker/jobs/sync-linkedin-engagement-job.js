import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runSyncLinkedInEngagementJob() {
  if (!CRON_SECRET) {
    logger.warn('sync-linkedin-engagement: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/admin/social/sync-engagement`
  const result = await callCronRoute({
    job: 'sync-linkedin-engagement',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/sync-linkedin-engagement',
  })

  if (!result.ok && result.transient) {
    logger.warn('sync-linkedin-engagement: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('sync-linkedin-engagement: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`sync-engagement route returned ${result.status}`)
  }

  logger.info('sync-linkedin-engagement: complete', result.payload)
}
