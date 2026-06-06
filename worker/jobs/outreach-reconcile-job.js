import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runOutreachReconcileJob() {
  if (!CRON_SECRET) {
    logger.warn('outreach-reconcile-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/cron/outreach-reconcile?days=14&limit=1000`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': 'startingmonday-worker/outreach-reconcile-job',
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
    logger.error('outreach-reconcile-job: web route failed', {
      status: res.status,
      body: payload,
    })
    throw new Error(`outreach reconcile route failed with status ${res.status}`)
  }

  logger.info('outreach-reconcile-job: completed', payload)
}
