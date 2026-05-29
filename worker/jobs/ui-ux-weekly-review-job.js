import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runUiUxWeeklyReviewJob() {
  if (!CRON_SECRET) {
    logger.warn('ui-ux-weekly-review-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/ui-ux-weekly-review?secret=${encodeURIComponent(CRON_SECRET)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'startingmonday-worker/ui-ux-weekly-review-job',
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
    logger.error('ui-ux-weekly-review-job: web route failed', {
      status: response.status,
      body: payload,
    })
    throw new Error(`ui-ux-weekly-review route failed with status ${response.status}`)
  }

  logger.info('ui-ux-weekly-review-job: completed', payload)
}
