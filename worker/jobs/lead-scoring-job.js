import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runLeadScoringJob() {
  if (!CRON_SECRET) {
    logger.warn('lead-scoring-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/admin/leads/score-route?limit=2000`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': 'startingmonday-worker/lead-scoring-job',
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
    logger.error('lead-scoring-job: web route failed', {
      status: res.status,
      body: payload,
    })
    throw new Error(`lead scoring route failed with status ${res.status}`)
  }

  logger.info('lead-scoring-job: completed', payload)
}
