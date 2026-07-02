import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runOnboardingVideoJob() {
  if (!CRON_SECRET) {
    logger.warn('onboarding-video-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/onboarding-video-worker?limit=10`
  const result = await callCronRoute({
    job: 'onboarding-video-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/onboarding-video-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('onboarding-video-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('onboarding-video-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`onboarding video worker route failed with status ${result.status}`)
  }

  logger.info('onboarding-video-job: completed', result.payload)
}
