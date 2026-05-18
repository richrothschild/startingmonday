import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runSyncLinkedInEngagementJob() {
  if (!CRON_SECRET) {
    throw new Error('CRON_SECRET is required for LinkedIn engagement sync')
  }

  const url = `${APP_URL}/api/admin/social/sync-engagement?secret=${encodeURIComponent(CRON_SECRET)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'startingmonday-worker/sync-linkedin-engagement',
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
    logger.error('sync-linkedin-engagement: web route failed', {
      status: res.status,
      body: payload,
    })
    throw new Error(`sync-engagement route returned ${res.status}`)
  }

  logger.info('sync-linkedin-engagement: complete', payload)
}
