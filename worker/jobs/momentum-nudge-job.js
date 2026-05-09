import Anthropic from '@anthropic-ai/sdk'
import { getSupabase } from '../lib/supabase.js'
import { sendEmail } from '../lib/send-email.js'
import { trackUsage } from '../lib/usage-tracker.js'
import { logger } from '../lib/logger.js'
import { HAIKU } from '../lib/models.js'
import { shouldSuppressNudge } from './momentum-job.js'
import { watermarkEmailHtml } from '../lib/watermark.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const MIN_DROP = 15
const RESEND_WINDOW_DAYS = 7

let _anthropic = null
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

async function generateNudgeActions({ firstName, overdueItems, companyCount, momentumScore, dropAmount }) {
  const overdueStr = overdueItems.length
    ? overdueItems.map(f => `${f.action} (due ${f.due_date}${f.company ? `, ${f.company}` : ''})`).slice(0, 3).join('; ')
    : 'no pending follow-ups'

  const prompt = `A senior executive's job search Momentum Score dropped ${dropAmount} points this week to ${momentumScore}/100. They have ${companyCount} companies tracked.

Overdue: ${overdueStr}

Give exactly 3 specific, actionable next steps to get back on track. Number each one. One sentence each. Reference their actual overdue items where relevant. No preamble.`

  const response = await getAnthropic().messages.create({
    model: HAIKU,
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  return text.split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(l => l.length > 20)
    .slice(0, 3)
}

export async function runMomentumNudgeJob() {
  const supabase = getSupabase()
  logger.info('momentum-nudge-job: starting')

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email')
    .in('subscription_status', ['trialing', 'active'])

  if (error || !users?.length) {
    logger.info('momentum-nudge-job: no active users — done')
    return
  }

  const since7d = new Date(Date.now() - RESEND_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const lastSundayStr = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })()

  let sent = 0

  for (const user of users) {
    try {
      const [
        { data: profile },
        { data: companies },
        { data: followUps },
        { data: momentumHistory },
        { data: recentNudge },
      ] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('full_name, momentum_score, search_persona, onboarding_completed_at')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('companies')
          .select('id, stage')
          .eq('user_id', user.id)
          .is('archived_at', null),
        supabase
          .from('follow_ups')
          .select('due_date, action, companies(name)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .lte('due_date', new Date().toISOString().split('T')[0])
          .order('due_date', { ascending: true })
          .limit(3),
        supabase
          .from('momentum_scores')
          .select('week_of, score')
          .eq('user_id', user.id)
          .order('week_of', { ascending: false })
          .limit(2),
        supabase
          .from('user_events')
          .select('id')
          .eq('user_id', user.id)
          .eq('event_name', 'momentum_nudge_sent')
          .gte('created_at', since7d)
          .limit(1),
      ])

      if (!profile?.onboarding_completed_at) continue

      const currentScore = profile.momentum_score ?? null
      const prevEntry = (momentumHistory ?? []).find(h => h.week_of === lastSundayStr)
      const prevScore = prevEntry?.score ?? null

      if (currentScore === null || prevScore === null) continue

      const dropAmount = prevScore - currentScore
      if (dropAmount < MIN_DROP) continue

      if (recentNudge?.length) {
        logger.info(`momentum-nudge-job: suppressed for ${user.id} — nudge sent in last ${RESEND_WINDOW_DAYS}d`)
        continue
      }

      const companyList = companies ?? []
      const activeCount = companyList.filter(c => ['interviewing', 'applied', 'offer'].includes(c.stage)).length
      const suppress = shouldSuppressNudge(profile.search_persona, currentScore, activeCount)
      if (suppress) continue

      const firstName = profile.full_name?.split(' ')[0] ?? 'there'
      const overdueItems = (followUps ?? []).map(f => ({
        action: f.action,
        due_date: new Date(f.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        company: f.companies?.name ?? null,
      }))

      let actions = []
      try {
        actions = await generateNudgeActions({
          firstName,
          overdueItems,
          companyCount: companyList.length,
          momentumScore: currentScore,
          dropAmount,
        })
        await trackUsage(supabase, { service: 'anthropic', requests: 1, tokens: 250 })
      } catch (err) {
        logger.warn(`momentum-nudge-job: Claude failed for ${user.id}`, { error: err.message })
      }

      const scoreColor = currentScore >= 70 ? '#16a34a' : currentScore >= 40 ? '#d97706' : '#dc2626'
      const actionItems = actions
        .map((a, i) => `<li style="font-size:13px;color:#0f172a;margin-bottom:8px"><span style="font-weight:600">${i + 1}.</span> ${a}</li>`)
        .join('')

      const overdueList = overdueItems.length
        ? overdueItems.map(f =>
            `<li style="font-size:13px;color:#0f172a;margin-bottom:6px">
              <span style="color:#dc2626;font-weight:600">${f.due_date}</span> — ${f.action}
              ${f.company ? `<span style="color:#94a3b8"> (${f.company})</span>` : ''}
            </li>`
          ).join('')
        : ''

      const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#0f172a;padding:16px 24px">
          <span style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#475569">Starting Monday</span>
        </div>
        <div style="padding:24px">
          <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 4px">Your search momentum dropped, ${firstName}.</h2>
          <p style="font-size:13px;color:#64748b;margin:0 0 24px">Your score fell ${dropAmount} points this week. Here&rsquo;s how to get back on track.</p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;text-align:center;margin-bottom:24px">
            <div style="font-size:36px;font-weight:700;color:${scoreColor}">${currentScore}</div>
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;margin-top:4px">Momentum Score &mdash; down ${dropAmount} from last week</div>
          </div>

          ${overdueList ? `
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 8px">Overdue actions</p>
          <ul style="margin:0 0 24px;padding-left:16px">${overdueList}</ul>` : ''}

          ${actionItems ? `
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 8px">This week&rsquo;s focus</p>
          <ul style="margin:0 0 24px;padding-left:16px">${actionItems}</ul>` : ''}

          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#0f172a;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:4px;text-decoration:none">Open dashboard</a>
        </div>
      </div>`

      await sendEmail({
        to: user.email,
        subject: `Your search momentum dropped this week — Starting Monday`,
        html: watermarkEmailHtml(html, user.id),
      })

      await supabase.from('user_events').insert({
        user_id: user.id,
        event_name: 'momentum_nudge_sent',
        properties: { score: currentScore, drop: dropAmount, prev_score: prevScore },
      })

      await trackUsage(supabase, { service: 'resend', requests: 1 })
      sent++
      logger.info(`momentum-nudge-job: sent to ${user.id}`, { score: currentScore, drop: dropAmount })
    } catch (err) {
      logger.error(`momentum-nudge-job: error for ${user.id}`, { error: err.message })
    }
  }

  logger.info('momentum-nudge-job: complete', { sent, total: users.length })
}
