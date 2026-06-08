import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runEdgarFreshnessAuditJob() {
  if (!CRON_SECRET) {
    logger.warn('edgar-freshness-audit-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/edgar-freshness-audit`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': 'startingmonday-worker/edgar-freshness-audit-job',
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
    logger.error('edgar-freshness-audit-job: web route failed', {
      status: response.status,
      body: payload,
    })
    throw new Error(`edgar-freshness-audit route failed with status ${response.status}`)
  }

  logger.info('edgar-freshness-audit-job: completed', payload)
}
