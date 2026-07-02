import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runUiUxWeeklyReviewJob() {
  if (!CRON_SECRET) {
    logger.warn('ui-ux-weekly-review-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/ui-ux-weekly-review`
  const result = await callCronRoute({
    job: 'ui-ux-weekly-review-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/ui-ux-weekly-review-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('ui-ux-weekly-review-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('ui-ux-weekly-review-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`ui-ux-weekly-review route failed with status ${result.status}`)
  }

  logger.info('ui-ux-weekly-review-job: completed', result.payload)
}
