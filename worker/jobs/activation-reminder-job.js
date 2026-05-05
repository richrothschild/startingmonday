import { getSupabase } from '../lib/supabase.js'
import { sendEmail } from '../lib/send-email.js'
import { logger } from '../lib/logger.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const ACTIONS = [
  { key: 'a1', label: 'Upload your resume or import LinkedIn', href: '/dashboard/profile' },
  { key: 'a2', label: 'Add your first target company',         href: '/dashboard/companies/new' },
  { key: 'a3', label: 'Generate your first prep brief',        href: '/dashboard/companies' },
  { key: 'a4', label: 'Add your first contact',                href: '/dashboard/contacts' },
  { key: 'a5', label: 'Set up your daily briefing',            href: '/dashboard/profile' },
  { key: 'a6', label: 'Set your first follow-up reminder',     href: '/dashboard/contacts' },
]

async function getActivationStatus(supabase, userId) {
  const [
    { data: profile },
    { count: companyCount },
    { count: prepBriefCount },
    { count: contactCount },
    { count: followUpCount },
  ] = await Promise.all([
    supabase.from('user_profiles').select('resume_text, positioning_summary, briefing_time').eq('user_id', userId).single(),
    supabase.from('companies').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('archived_at', null),
    supabase.from('briefs').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'prep'),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('follow_ups').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  return {
    a1: (profile?.resume_text?.length ?? 0) >= 200 || (profile?.positioning_summary?.length ?? 0) >= 100,
    a2: (companyCount ?? 0) >= 1,
    a3: (prepBriefCount ?? 0) >= 1,
    a4: (contactCount ?? 0) >= 1,
    a5: !!profile?.briefing_time,
    a6: (followUpCount ?? 0) >= 1,
  }
}

function buildReminderEmail({ firstName, dayNumber, missing, completedCount }) {
  const remaining = 6 - completedCount
  const subject = `${remaining} step${remaining === 1 ? '' : 's'} left to finish your setup`

  const actionRows = missing.map((a, i) => `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;">
        <a href="${esc(APP_URL + a.href)}" style="font-size:14px;font-weight:600;color:#0f172a;text-decoration:none;">
          ${i + 1}. ${esc(a.label)} &rarr;
        </a>
      </td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="540" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <tr><td style="background:#0f172a;padding:36px 48px 32px 48px;">
        <div style="color:#334155;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:18px;">Starting Monday</div>
        <div style="color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">${esc(firstName)}, you are ${completedCount} of 6 steps in.</div>
      </td></tr>

      <tr><td style="padding:32px 48px 16px 48px;">
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px 0;">
          Users who complete all six setup steps convert at dramatically higher rates and stay longer.
          Here is what is left for you${dayNumber ? ` on day ${dayNumber}` : ''}:
        </p>
      </td></tr>

      <tr><td style="padding:0 48px 32px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;">
          ${actionRows}
        </table>
      </td></tr>

      <tr><td style="padding:0 48px 40px 48px;">
        <a href="${esc(APP_URL + '/dashboard/start')}" style="display:inline-block;background:#0f172a;color:#ffffff;font-size:13px;font-weight:700;padding:14px 28px;border-radius:4px;text-decoration:none;">
          Finish setup &rarr;
        </a>
      </td></tr>

      <tr><td style="padding:24px 48px;border-top:1px solid #e2e8f0;">
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6;">
          Starting Monday &mdash; startingmonday.app
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`

  return { subject, html }
}

function dateDaysAgo(n) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

export async function runActivationReminderJob() {
  const supabase = getSupabase()
  logger.info('activation-reminder-job: starting')

  const day3Date = dateDaysAgo(3)
  const day7Date = dateDaysAgo(7)

  // Fetch trialing users who signed up exactly 3 or 7 days ago
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, created_at')
    .eq('subscription_status', 'trialing')
    .or(`created_at.gte.${day3Date}T00:00:00Z,created_at.gte.${day7Date}T00:00:00Z`)

  if (error) {
    logger.error('activation-reminder-job: query failed', { error: error.message })
    return
  }

  // Filter to exact matches for day 3 and day 7
  const targets = (users ?? []).filter(u => {
    const signupDate = u.created_at?.slice(0, 10)
    return signupDate === day3Date || signupDate === day7Date
  })

  if (!targets.length) {
    logger.info('activation-reminder-job: no targets today')
    return
  }

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, full_name')
    .in('user_id', targets.map(u => u.id))

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

  let sent = 0
  let skipped = 0

  for (const user of targets) {
    const activation = await getActivationStatus(supabase, user.id)
    const completedCount = Object.values(activation).filter(Boolean).length

    // Already complete — skip
    if (completedCount === 6) { skipped++; continue }

    const missing = ACTIONS.filter(a => !activation[a.key])
    const profile = profileMap[user.id]
    const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
    const signupDate = user.created_at?.slice(0, 10)
    const dayNumber = signupDate === day3Date ? 3 : 7

    try {
      const { subject, html } = buildReminderEmail({ firstName, dayNumber, missing, completedCount })
      await sendEmail({ to: user.email, subject, html })
      logger.info('activation-reminder-job: sent', { to: user.email, day: dayNumber, completedCount })
      sent++
    } catch (err) {
      logger.error('activation-reminder-job: send failed', { to: user.email, error: err.message })
      skipped++
    }
  }

  logger.info('activation-reminder-job: done', { sent, skipped })
}
