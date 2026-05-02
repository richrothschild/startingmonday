import { getSupabase } from '../lib/supabase.js'
import { sendEmail } from '../lib/send-email.js'
import { trackUsage } from '../lib/usage-tracker.js'
import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}

export async function runFollowupJob() {
  const supabase = getSupabase()
  logger.info('followup-job: starting')

  const { data: followUps, error } = await supabase
    .from('follow_ups')
    .select('id, user_id, due_date, action, companies(name)')
    .eq('status', 'pending')
    .lte('due_date', todayUTC())
    .order('due_date', { ascending: true })

  if (error) {
    logger.error('followup-job: failed to fetch follow-ups', { error: error.message })
    return
  }

  if (!followUps?.length) {
    logger.info('followup-job: no overdue follow-ups — done')
    return
  }

  const byUser = {}
  for (const fu of followUps) {
    if (!byUser[fu.user_id]) byUser[fu.user_id] = []
    byUser[fu.user_id].push(fu)
  }

  const userIds = Object.keys(byUser)
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .in('id', userIds)

  if (!users?.length) {
    logger.info('followup-job: no matching users')
    return
  }

  const today = todayUTC()
  let sent = 0

  for (const user of users) {
    const items = byUser[user.id]
    if (!items?.length) continue

    const rows = items.map(fu => {
      const isToday = fu.due_date === today
      const daysOverdue = isToday
        ? 0
        : Math.floor((new Date(today) - new Date(fu.due_date)) / 86400000)
      const company = fu.companies?.name ?? ''
      const label = isToday ? 'Today' : `${daysOverdue}d overdue`
      const labelColor = isToday ? '#94a3b8' : '#dc2626'
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a">${fu.action}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">${company}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:600;color:${labelColor}">${label}</td>
      </tr>`
    }).join('')

    const count = items.length
    const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <div style="background:#0f172a;padding:16px 24px">
        <span style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#475569">Starting Monday</span>
      </div>
      <div style="padding:24px">
        <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px">You have ${count} action${count === 1 ? '' : 's'} due</h2>
        <p style="font-size:13px;color:#64748b;margin:0 0 20px">Log in to mark them done or reschedule.</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:20px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">Action</th>
              <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">Company</th>
              <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8">Due</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#0f172a;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:4px;text-decoration:none">Open dashboard</a>
      </div>
    </div>`

    try {
      await sendEmail({
        to: user.email,
        subject: `${count} action${count === 1 ? '' : 's'} due — Starting Monday`,
        html,
      })
      await trackUsage(supabase, { service: 'resend', requests: 1 })
      sent++
      logger.info(`followup-job: sent to ${user.email}`)
    } catch (err) {
      logger.error(`followup-job: error for ${user.email}`, { error: err.message })
    }
  }

  logger.info('followup-job: complete', { sent, total: userIds.length })
}
