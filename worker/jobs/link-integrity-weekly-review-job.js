import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runLinkIntegrityWeeklyReviewJob() {
  if (!CRON_SECRET) {
    logger.warn('link-integrity-weekly-review-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/link-integrity-weekly-review`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': 'startingmonday-worker/link-integrity-weekly-review-job',
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
    logger.error('link-integrity-weekly-review-job: web route failed', {
      status: response.status,
      body: payload,
    })
    throw new Error(`link-integrity-weekly-review route failed with status ${response.status}`)
  }

  logger.info('link-integrity-weekly-review-job: completed', payload)
}
