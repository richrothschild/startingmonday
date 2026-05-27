import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runIdeasMonthlyJob() {
  if (!CRON_SECRET) {
    logger.warn('ideas-monthly-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/ideas-monthly?secret=${encodeURIComponent(CRON_SECRET)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'startingmonday-worker/ideas-monthly-job',
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
    logger.error('ideas-monthly-job: web route failed', {
      status: response.status,
      body: payload,
    })
    throw new Error(`ideas-monthly route failed with status ${response.status}`)
  }

  logger.info('ideas-monthly-job: completed', payload)
}
