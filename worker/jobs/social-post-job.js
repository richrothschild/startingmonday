import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const CRON_SECRET = process.env.CRON_SECRET

export async function runSocialPostJob() {
  if (!CRON_SECRET) {
    logger.warn('social-post-job: skipped because CRON_SECRET is missing')
    return
  }

  const url = `${APP_URL}/api/admin/social/morning?secret=${encodeURIComponent(CRON_SECRET)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'startingmonday-worker/social-post-job',
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
    logger.error('social-post-job: web route failed', {
      status: res.status,
      body: payload,
    })
    throw new Error(`social post route failed with status ${res.status}`)
  }

  logger.info('social-post-job: completed', {
    status: res.status,
    payload,
  })
}
