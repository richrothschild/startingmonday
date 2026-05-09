import { getSupabase } from '../lib/supabase.js'
import { logger } from '../lib/logger.js'
import { trackUsage } from '../lib/usage-tracker.js'
import { assembleContext } from '../briefing/assemble-context.js'
import { generateBriefing } from '../briefing/generate-briefing.js'
import { renderBriefingEmail } from '../briefing/email-template.js'
import { sendBriefing } from '../briefing/send-briefing.js'
import { watermarkEmailHtml, injectTrackingPixel } from '../lib/watermark.js'

const BRIEFING_LOCK_KEY = 7329841024n

const ABBR_TO_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }

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

function isWithinWindow(currentHHMM, targetHHMM, windowMinutes = 10) {
  const [ch, cm] = currentHHMM.split(':').map(Number)
  const [th, tm] = targetHHMM.split(':').map(Number)
  const diff = Math.abs(ch * 60 + cm - (th * 60 + tm))
  return diff <= windowMinutes
}

export async function runBriefingJob() {
  const supabase = getSupabase()
  logger.info('briefing-job: starting')

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: BRIEFING_LOCK_KEY })
  if (!locked) {
    logger.warn('briefing-job: another instance running — skipping')
    return
  }

  try {
    // Fetch all active/trialing users with cursor-based pagination to avoid the 1000-row limit
    const PAGE_SIZE = 500
    let allUsers = []
    let lastId = null
    while (true) {
      let query = supabase.from('users').select('id, email')
        .in('subscription_status', ['trialing', 'active'])
        .order('id')
        .limit(PAGE_SIZE)
      if (lastId) query = query.gt('id', lastId)
      const { data: page, error: pageError } = await query
      if (pageError) {
        logger.error('briefing-job: failed to fetch users', { error: pageError.message })
        return
      }
      if (!page?.length) break
      allUsers = allUsers.concat(page)
      if (page.length < PAGE_SIZE) break
      lastId = page[page.length - 1].id
    }
    const users = allUsers
    const error = null

    const { data: profiles } = await supabase.from('user_profiles').select(
      'user_id, full_name, briefing_time, briefing_timezone, briefing_days, last_briefing_sent_at'
    ).not('briefing_time', 'is', null)

    if (!users?.length) {
      logger.info('briefing-job: no users — done')
      return
    }

    const profileByUserId = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

    let sent = 0
    let skipped = 0

    for (const user of users) {
      const profile = profileByUserId[user.id]
      if (!profile) {
        logger.info(`briefing-job: skip ${user.email} — no profile or briefing_time not set`)
        skipped++; continue
      }

      const tz = profile.briefing_timezone ?? 'UTC'
      const briefingTime = profile.briefing_time.slice(0, 5)
      const briefingDays = (profile.briefing_days ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
        .map(d => ABBR_TO_FULL[d] ?? d)

      const dayName = dayNameInTz(tz)
      if (!briefingDays.includes(dayName)) {
        logger.info(`briefing-job: skip ${user.email} — today is ${dayName}, not in briefing_days ${JSON.stringify(briefingDays)}`)
        skipped++; continue
      }

      const currentHHMM = currentHHMMInTz(tz)
      if (!isWithinWindow(currentHHMM, briefingTime)) {
        logger.info(`briefing-job: skip ${user.email} — current ${currentHHMM} not within window of ${briefingTime} (tz: ${tz})`)
        skipped++; continue
      }

      const todayStr = todayStrInTz(tz)
      if (profile.last_briefing_sent_at) {
        const lastSentDate = new Intl.DateTimeFormat('en-CA', { timeZone: tz })
          .format(new Date(profile.last_briefing_sent_at))
        if (lastSentDate === todayStr) {
          logger.info(`briefing-job: skip ${user.email} — already sent today (${todayStr})`)
          skipped++; continue
        }
      }

      try {
        const context = await assembleContext(supabase, user.id, user.email, tz)
        if (!context) {
          logger.info(`briefing-job: skip ${user.email} — no companies in pipeline`)
          skipped++; continue
        }

        const briefing = await generateBriefing(context)
        const rawHtml = watermarkEmailHtml(renderBriefingEmail(context, briefing), user.id)
        const html = injectTrackingPixel(rawHtml, user.id, 'briefing', context.todayStr)

        await sendBriefing({
          to: user.email,
          subject: briefing.subject ?? `Your briefing — ${context.todayStr}`,
          html,
        })

        const now = new Date().toISOString()

        // Mark signals notified first — if we crash after this but before updating the
        // timestamp, the user gets a duplicate email tomorrow rather than missing
        // signal notifications permanently.
        const unnotifiedSignalIds = [
          ...(context.signals ?? []).filter(s => !s.notifiedAt).map(s => s.id),
          ...(context.patternAlerts ?? []).filter(s => !s.notifiedAt).map(s => s.id),
        ]
        if (unnotifiedSignalIds.length) {
          await supabase
            .from('company_signals')
            .update({ notified_at: now })
            .in('id', unnotifiedSignalIds)
        }

        await supabase
          .from('user_profiles')
          .update({ last_briefing_sent_at: now })
          .eq('user_id', user.id)

        await Promise.all([
          trackUsage(supabase, { service: 'resend', requests: 1 }),
          trackUsage(supabase, { service: 'anthropic', requests: 1, tokens: 1500 }),
        ])

        sent++
        logger.info(`briefing-job: sent to ${user.email}`)
      } catch (err) {
        logger.error(`briefing-job: error for ${user.email}`, { error: err.message, stack: err.stack })
      }
    }

    logger.info('briefing-job: complete', { sent, skipped })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: BRIEFING_LOCK_KEY })
  }
}
