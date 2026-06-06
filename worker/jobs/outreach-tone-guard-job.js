import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runOutreachToneGuardJob(modeArg = 'weekly') {
  if (!CRON_SECRET) {
    logger.warn('outreach-tone-guard-job: skipped because CRON_SECRET is missing')
    return
  }

  const mode = modeArg === 'presend' ? 'presend' : 'weekly'
  const url = `${APP_URL}/api/cron/outreach-tone-guard?mode=${mode}${mode === 'presend' ? '&remediate=1' : ''}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': `startingmonday-worker/outreach-tone-guard-job/${mode}`,
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
    logger.error('outreach-tone-guard-job: web route failed', {
      status: response.status,
      mode,
      body: payload,
    })
    throw new Error(`outreach-tone-guard route failed with status ${response.status}`)
  }

  logger.info('outreach-tone-guard-job: completed', { mode, payload })
}
