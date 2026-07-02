import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runLinkIntegrityWeeklyReviewJob() {
  if (!CRON_SECRET) {
    logger.warn('link-integrity-weekly-review-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/link-integrity-weekly-review`
  const result = await callCronRoute({
    job: 'link-integrity-weekly-review-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/link-integrity-weekly-review-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('link-integrity-weekly-review-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('link-integrity-weekly-review-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`link-integrity-weekly-review route failed with status ${result.status}`)
  }

  logger.info('link-integrity-weekly-review-job: completed', result.payload)
}
