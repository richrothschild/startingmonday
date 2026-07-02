import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runSocialPostJob() {
  if (!CRON_SECRET) {
    logger.warn('social-post-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/admin/social/morning`
  const result = await callCronRoute({
    job: 'social-post-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/social-post-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('social-post-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('social-post-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`social post route failed with status ${result.status}`)
  }

  logger.info('social-post-job: completed', {
    status: result.status,
    payload: result.payload,
  })
}
