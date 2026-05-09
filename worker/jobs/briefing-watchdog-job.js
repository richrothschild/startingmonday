import { getSupabase } from '../lib/supabase.js'
import { logger } from '../lib/logger.js'
import { notify } from '../lib/notify.js'

const STALE_HOURS = 36

export async function runBriefingWatchdogJob() {
  const supabase = getSupabase()
  logger.info('briefing-watchdog-job: checking briefing health')

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, last_briefing_sent_at')
    .not('briefing_time', 'is', null)

  if (!profiles?.length) {
    logger.info('briefing-watchdog-job: no users with briefing configured -- skip')
    return
  }

  const userIds = profiles.map(p => p.user_id)
  const { data: activeUsers } = await supabase
    .from('users')
    .select('id')
    .in('id', userIds)
    .in('subscription_status', ['trialing', 'active'])

  const activeUserIds = new Set((activeUsers ?? []).map(u => u.id))
  const activeBriefingProfiles = profiles.filter(p => activeUserIds.has(p.user_id))

  if (!activeBriefingProfiles.length) {
    logger.info('briefing-watchdog-job: no active/trialing users with briefing configured -- skip')
    return
  }

  const now = Date.now()

  const mostRecentMs = activeBriefingProfiles
    .map(p => p.last_briefing_sent_at ? new Date(p.last_briefing_sent_at).getTime() : 0)
    .reduce((max, t) => Math.max(max, t), 0)

  const hoursSinceLast = mostRecentMs ? Math.round((now - mostRecentMs) / 3_600_000) : null
  const isStale = hoursSinceLast === null || hoursSinceLast >= STALE_HOURS

  if (!isStale) {
    logger.info(`briefing-watchdog-job: ok -- last briefing ${hoursSinceLast}h ago (${activeBriefingProfiles.length} configured users)`)
    return
  }

  const lastLabel = mostRecentMs
    ? `${new Date(mostRecentMs).toISOString()} (${hoursSinceLast}h ago)`
    : 'never'

  const subject = `ALERT: briefing job may be stalled -- last sent ${hoursSinceLast !== null ? `${hoursSinceLast}h ago` : 'never'}`
  const body = [
    `Active/trialing users with briefing configured: ${activeBriefingProfiles.length}`,
    `Last briefing sent: ${lastLabel}`,
    '',
    'This means no briefing email has gone out in over 36 hours to users who have it configured.',
    'Check the worker service on Railway. If the container is down, restart it.',
    '',
    'Admin: https://startingmonday.app/dashboard/admin',
  ].join('\n')

  logger.warn(`briefing-watchdog-job: ${subject}`)
  await notify({ subject, body })
}
