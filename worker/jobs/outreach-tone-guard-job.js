import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runOutreachToneGuardJob() {
  if (!CRON_SECRET) {
    logger.warn('outreach-tone-guard-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/outreach-tone-guard?secret=${encodeURIComponent(CRON_SECRET)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'startingmonday-worker/outreach-tone-guard-job',
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
      body: payload,
    })
    throw new Error(`outreach-tone-guard route failed with status ${response.status}`)
  }

  logger.info('outreach-tone-guard-job: completed', payload)
}
