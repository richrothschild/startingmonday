import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runOnboardingVideoJob() {
  if (!CRON_SECRET) {
    logger.warn('onboarding-video-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/onboarding-video-worker?secret=${encodeURIComponent(CRON_SECRET)}&limit=10`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'startingmonday-worker/onboarding-video-job',
    },
  })

  const bodyText = await response.text()
  let payload = null
  try {
    payload = bodyText ? JSON.parse(bodyText) : null
  } catch {
    payload = { raw: bodyText }
  }

  if (!response.ok) {
    logger.error('onboarding-video-job: web route failed', {
      status: response.status,
      body: payload,
    })
    throw new Error(`onboarding video worker route failed with status ${response.status}`)
  }

  logger.info('onboarding-video-job: completed', payload)
}
