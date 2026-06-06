import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runGoogleCalendarSyncJob() {
  if (!CRON_SECRET) {
    logger.warn('google-calendar-sync-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/google-calendar-sync`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': 'startingmonday-worker/google-calendar-sync-job',
    },
  })

  const bodyText = await res.text()
  let payload = null
  try {
    payload = bodyText ? JSON.parse(bodyText) : null
  } catch {
    payload = { raw: bodyText }
  }

  if (!res.ok) {
    logger.error('google-calendar-sync-job: web route failed', {
      status: res.status,
      body: payload,
    })
    throw new Error(`google calendar sync route failed with status ${res.status}`)
  }

  logger.info('google-calendar-sync-job: completed', {
    status: res.status,
    payload,
  })
}
