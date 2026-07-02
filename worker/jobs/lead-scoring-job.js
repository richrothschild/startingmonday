import { logger } from '../lib/logger.js'
import { callCronRoute } from '../lib/cron-route.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runLeadScoringJob() {
  if (!CRON_SECRET) {
    logger.warn('lead-scoring-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/admin/leads/score-route?limit=2000`
  const result = await callCronRoute({
    job: 'lead-scoring-job',
    url,
    cronSecret: CRON_SECRET,
    userAgent: 'startingmonday-worker/lead-scoring-job',
  })

  if (!result.ok && result.transient) {
    logger.warn('lead-scoring-job: transient upstream failure, skipping hard error', {
      status: result.status,
      error: result.error,
      body: result.payload,
    })
    return
  }

  if (!result.ok) {
    logger.error('lead-scoring-job: web route failed', {
      status: result.status,
      body: result.payload,
    })
    throw new Error(`lead scoring route failed with status ${result.status}`)
  }

  logger.info('lead-scoring-job: completed', result.payload)
}
