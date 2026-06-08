import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

async function fetchWithRetry(url, options, attempts = 3) {
  let lastResponse = null

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, options)
    lastResponse = response
    if (response.status < 500) return response

    if (attempt < attempts) {
      const backoffMs = 250 * attempt
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }

  return lastResponse
}

export async function runUiUxWeeklyReviewJob() {
  if (!CRON_SECRET) {
    logger.warn('ui-ux-weekly-review-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/ui-ux-weekly-review`
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
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
