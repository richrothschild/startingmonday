import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runOutreachToneGuardJob(modeArg = 'weekly') {
  if (!CRON_SECRET) {
    logger.warn('outreach-tone-guard-job: skipped because CRON_SECRET is missing')
    return
  }

  const mode = modeArg === 'presend' ? 'presend' : 'weekly'
  const url = `${APP_URL}/api/cron/outreach-tone-guard?mode=${mode}${mode === 'presend' ? '&remediate=1' : ''}`
  const result = await callCronRoute({
    job: 'outreach-tone-guard-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: `startingmonday-worker/outreach-tone-guard-job/${mode}`,
  })

  if (!result.ok && result.transient) {
    logger.warn('outreach-tone-guard-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      mode,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('outreach-tone-guard-job: web route failed', {
      status: result.status,
      mode,
      body: result.payload,
    })
    throw new Error(`outreach-tone-guard route failed with status ${result.status}`)
  }

  logger.info('outreach-tone-guard-job: completed', { mode, payload: result.payload })
}
