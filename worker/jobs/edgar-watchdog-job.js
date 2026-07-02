import { logger } from '../lib/logger.js'
import { sendWorkerSlackAlert } from '../lib/slack-alert.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runEdgarWatchdogJob() {
  if (!CRON_SECRET) {
    await sendWorkerSlackAlert('*EDGAR watchdog hard failure*\n- Reason: CRON_SECRET is missing in worker runtime\n- Job: edgar-watchdog-job')
    throw new Error('edgar-watchdog-job: CRON_SECRET missing')
  }

  const url = `${APP_URL}/api/cron/edgar-watchdog`
  const result = await callCronRoute({
    job: 'edgar-watchdog-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/edgar-watchdog-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('edgar-watchdog-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('edgar-watchdog-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`edgar-watchdog route failed with status ${result.status}`)
  }

  logger.info('edgar-watchdog-job: completed', result.payload)
}
