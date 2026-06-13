import { logger } from '../lib/logger.js'
import { sendWorkerSlackAlert } from '../lib/slack-alert.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runEdgarWatchdogJob() {
  if (!CRON_SECRET) {
    await sendWorkerSlackAlert('*EDGAR watchdog hard failure*\n- Reason: CRON_SECRET is missing in worker runtime\n- Job: edgar-watchdog-job')
    throw new Error('edgar-watchdog-job: CRON_SECRET missing')
  }

  const url = `${APP_URL}/api/cron/edgar-watchdog`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': 'startingmonday-worker/edgar-watchdog-job',
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
    logger.error('edgar-watchdog-job: web route failed', {
      status: response.status,
      body: payload,
    })
    throw new Error(`edgar-watchdog route failed with status ${response.status}`)
  }

  logger.info('edgar-watchdog-job: completed', payload)
}
