import { getSupabase } from '../lib/supabase.js'
import { sendEmail } from '../lib/send-email.js'
import { trackUsage } from '../lib/usage-tracker.js'
import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

const STAGE_LABELS = {
  watching: 'Watching',
  researching: 'Researching',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
}

export async function runWeeklyReportJob() {
  const supabase = getSupabase()
  logger.info('weekly-report-job: starting')

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email')

  if (error || !users?.length) {
    logger.info('weekly-report-job: no users — done')
    return
  }

  let sent = 0

  for (const user of users) {
    try {
      const [{ data: profile }, { data: companies }, { data: followUps }] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('full_name, onboarding_completed_at')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('companies')
          .select('name, stage, fit_score')
          .eq('user_id', user.id)
          .is('archived_at', null)
          .order('fit_score', { ascending: false, nullsFirst: false }),
        supabase
          .from('follow_ups')
          .select('due_date, action, companies(name)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('due_date', { ascending: true })
          .limit(5),
      ])

      if (!profile?.onboarding_completed_at) continue

      const firstName = profile.full_name?.split(' ')[0] ?? 'there'
      const companyList = companies ?? []
      const activeCount = companyList.filter(c =>
        ['interviewing', 'applied', 'offer'].includes(c.stage)
      ).length

      const stageCounts = {}
      for (const c of companyList) {
        stageCounts[c.stage] = (stageCounts[c.stage] ?? 0) + 1
      }

      const stageRows = Object.entries(stageCounts)
        .map(([stage, count]) => `
          <tr>
            <td style="padding:6px 12px;font-size:13px;color:#0f172a">${STAGE_LABELS[stage] ?? stage}</td>
            <td style="padding:6px 12px;font-size:13px;font-weight:700;color:#0f172a;text-align:right">${count}</td>
          </tr>`)
        .join('')

      const fuItems = (followUps ?? [])
        .map(fu => {
          const company = fu.companies?.name ?? ''
          const date = new Date(fu.due_date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
          })
          return `<li style="font-size:13px;color:#0f172a;margin-bottom:6px">
            <span style="color:#64748b">${date}</span> — ${fu.action}${company ? ` <span style="color:#94a3b8">(${company})</span>` : ''}
          </li>`
        })
        .join('')

      const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#0f172a;padding:16px 24px">
          <span style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#475569">Starting Monday</span>
        </div>
        <div style="padding:24px">
          <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 4px">Weekly snapshot, ${firstName}.</h2>
          <p style="font-size:13px;color:#64748b;margin:0 0 24px">Here&rsquo;s where your search stands.</p>

          <div style="display:flex;gap:16px;margin-bottom:24px">
            <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;text-align:center">
              <div style="font-size:28px;font-weight:700;color:#0f172a">${companyList.length}</div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;margin-top:4px">Companies</div>
            </div>
            <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;text-align:center">
              <div style="font-size:28px;font-weight:700;color:#0f172a">${activeCount}</div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;margin-top:4px">Active</div>
            </div>
          </div>

          ${stageRows ? `
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 8px">Pipeline breakdown</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:24px">
            <tbody>${stageRows}</tbody>
          </table>` : ''}

          ${fuItems ? `
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 8px">Upcoming actions</p>
          <ul style="margin:0 0 24px;padding-left:16px">${fuItems}</ul>` : ''}

          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#0f172a;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:4px;text-decoration:none">Open dashboard</a>
        </div>
      </div>`

      await sendEmail({
        to: user.email,
        subject: `Your weekly search snapshot — Starting Monday`,
        html,
      })
      await trackUsage(supabase, { service: 'resend', requests: 1 })
      sent++
      logger.info(`weekly-report-job: sent to ${user.email}`)
    } catch (err) {
      logger.error(`weekly-report-job: error for ${user.email}`, { error: err.message })
    }
  }

  logger.info('weekly-report-job: complete', { sent, total: users.length })
}
