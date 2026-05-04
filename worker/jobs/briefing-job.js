import { getSupabase } from '../lib/supabase.js'
import { logger } from '../lib/logger.js'
import { trackUsage } from '../lib/usage-tracker.js'
import { assembleContext } from '../briefing/assemble-context.js'
import { generateBriefing } from '../briefing/generate-briefing.js'
import { renderBriefingEmail } from '../briefing/email-template.js'
import { sendBriefing } from '../briefing/send-briefing.js'

function todayStrInTz(tz) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
}

function dayNameInTz(tz) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(new Date())
}

function currentHHMMInTz(tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date())
  const h = parts.find(p => p.type === 'hour')?.value ?? '00'
  const m = parts.find(p => p.type === 'minute')?.value ?? '00'
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

function isWithinWindow(currentHHMM, targetHHMM, windowMinutes = 5) {
  const [ch, cm] = currentHHMM.split(':').map(Number)
  const [th, tm] = targetHHMM.split(':').map(Number)
  const diff = Math.abs(ch * 60 + cm - (th * 60 + tm))
  return diff <= windowMinutes
}

export async function runBriefingJob() {
  const supabase = getSupabase()
  logger.info('briefing-job: starting')

  const [{ data: users, error }, { data: profiles }] = await Promise.all([
    supabase.from('users').select('id, email').in('subscription_status', ['trialing', 'active']),
    // Only fetch profiles that have a briefing_time set — avoids scanning rows that
    // can never trigger a send, which matters as user count grows.
    supabase.from('user_profiles').select(
      'user_id, full_name, briefing_time, briefing_timezone, briefing_days, last_briefing_sent_at'
    ).not('briefing_time', 'is', null),
  ])

  if (error) {
    logger.error('briefing-job: failed to fetch users', { error: error.message })
    return
  }

  if (!users?.length) {
    logger.info('briefing-job: no users — done')
    return
  }

  const profileByUserId = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

  let sent = 0
  let skipped = 0

  for (const user of users) {
    const profile = profileByUserId[user.id]
    if (!profile) { skipped++; continue }

    const tz = profile.briefing_timezone ?? 'UTC'
    const briefingTime = profile.briefing_time.slice(0, 5)
    const briefingDays = profile.briefing_days ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    const dayName = dayNameInTz(tz)
    if (!briefingDays.includes(dayName)) { skipped++; continue }

    const currentHHMM = currentHHMMInTz(tz)
    if (!isWithinWindow(currentHHMM, briefingTime)) { skipped++; continue }

    const todayStr = todayStrInTz(tz)
    if (profile.last_briefing_sent_at) {
      const lastSentDate = new Intl.DateTimeFormat('en-CA', { timeZone: tz })
        .format(new Date(profile.last_briefing_sent_at))
      if (lastSentDate === todayStr) { skipped++; continue }
    }

    try {
      const context = await assembleContext(supabase, user.id, user.email, tz)
      if (!context) { skipped++; continue }

      const briefing = await generateBriefing(context)
      const html = renderBriefingEmail(context, briefing)

      await sendBriefing({
        to: user.email,
        subject: briefing.subject ?? `Your briefing — ${context.todayStr}`,
        html,
      })

      const now = new Date().toISOString()
      await supabase
        .from('user_profiles')
        .update({ last_briefing_sent_at: now })
        .eq('user_id', user.id)

      // Mark any signals included in this briefing as notified
      if (context.signals?.length) {
        await supabase
          .from('company_signals')
          .update({ notified_at: now })
          .in('id', context.signals.map(s => s.id))
      }

      // Track one Resend request and one Anthropic call (approximate token count)
      await Promise.all([
        trackUsage(supabase, { service: 'resend', requests: 1 }),
        trackUsage(supabase, { service: 'anthropic', requests: 1, tokens: 1500 }),
      ])

      sent++
      logger.info(`briefing-job: sent to ${user.email}`)
    } catch (err) {
      logger.error(`briefing-job: error for ${user.email}`, { error: err.message })
    }
  }

  logger.info('briefing-job: complete', { sent, skipped })
}
