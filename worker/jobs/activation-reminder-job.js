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

async function getActivationStatus(supabase, userId, profile) {
  const [
    { count: companyCount },
    { count: prepBriefCount },
    { count: contactCount },
    { count: followUpCount },
  ] = await Promise.all([
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

// Included in both emails. Addresses the EA/admin scenario without being alarmist.
const PRIVATE_NOTE = `
      <tr><td style="padding:24px 48px 8px 48px;border-top:1px solid #e2e8f0;">
        <p style="font-size:12px;color:#94a3b8;margin:0 0 6px 0;line-height:1.7;">
          Your Starting Monday account is private. Your pipeline, briefings, and search activity are visible only to you.
        </p>
        <p style="font-size:12px;color:#94a3b8;margin:0 0 6px 0;line-height:1.7;">
          If an assistant manages your work inbox, consider setting a personal delivery address in your
          <a href="${APP_URL}/dashboard/profile#briefing-email" style="color:#64748b;text-decoration:underline;">profile settings</a>
          so briefings reach you directly.
        </p>
      </td></tr>
      <tr><td style="padding:0 48px 32px 48px;">
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6;">
          Starting Monday &mdash; startingmonday.app
        </p>
      </td></tr>`

function buildEmail({ firstName, dayNumber, missing, completedCount }) {
  const notStarted = completedCount === 0

  // Subject lines are intentionally neutral — no "job search" language
  // so an executive assistant who pre-screens email sees a product account email, not a search signal.
  const subject = dayNumber === 2
    ? 'Your Starting Monday account'
    : 'A note from Starting Monday'

  const headerLine = notStarted
    ? `${esc(firstName)}, your account is ready.`
    : `${esc(firstName)}, ${6 - completedCount} step${6 - completedCount === 1 ? '' : 's'} left in your setup.`

  const bodyText = notStarted && dayNumber === 2
    ? `You created your account two days ago. Setup takes about 10 minutes and gives the platform enough context to run daily briefings, generate prep notes, and draft outreach in your voice.`
    : dayNumber === 2
    ? `You are ${completedCount} of 6 steps in. A few more things to configure and the platform will be running for you.`
    : `You still have ${6 - completedCount} step${6 - completedCount === 1 ? '' : 's'} to finish. Here is what is left:`

  const actionRows = missing.map((a, i) => `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;">
        <a href="${esc(APP_URL + a.href)}" style="font-size:14px;font-weight:600;color:#0f172a;text-decoration:none;">
          ${i + 1}. ${esc(a.label)} &rarr;
        </a>
      </td>
    </tr>`).join('')

  const ctaLabel = notStarted ? 'Get started' : 'Finish setup'

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
        <div style="color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">${esc(headerLine)}</div>
      </td></tr>

      <tr><td style="padding:32px 48px 16px 48px;">
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px 0;">${esc(bodyText)}</p>
      </td></tr>

      <tr><td style="padding:0 48px 32px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;">
          ${actionRows}
        </table>
      </td></tr>

      <tr><td style="padding:0 48px 40px 48px;">
        <a href="${esc(APP_URL + '/dashboard/start')}" style="display:inline-block;background:#0f172a;color:#ffffff;font-size:13px;font-weight:700;padding:14px 28px;border-radius:4px;text-decoration:none;">
          ${esc(ctaLabel)} &rarr;
        </a>
      </td></tr>

      ${PRIVATE_NOTE}

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

  const day2Date = dateDaysAgo(2)
  const day7Date = dateDaysAgo(7)

  // Trialing users who signed up between 1 and 8 days ago
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, created_at')
    .eq('subscription_status', 'trialing')
    .gte('created_at', `${dateDaysAgo(8)}T00:00:00Z`)
    .lte('created_at', `${dateDaysAgo(1)}T23:59:59Z`)

  if (error) {
    logger.error('activation-reminder-job: query failed', { error: error.message })
    return
  }

  // Exact day-2 and day-7 targets only
  const targets = (users ?? []).filter(u => {
    const d = u.created_at?.slice(0, 10)
    return d === day2Date || d === day7Date
  })

  if (!targets.length) {
    logger.info('activation-reminder-job: no targets today')
    return
  }

  const targetIds = targets.map(u => u.id)

  // Batch: profiles — check onboarding status, activation state, and briefing_email override
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, full_name, briefing_email, resume_text, positioning_summary, briefing_time, onboarding_completed_at')
    .in('user_id', targetIds)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

  // Batch: which users have at least one company? These are engaged — suppress all emails.
  const { data: companyRows } = await supabase
    .from('companies')
    .select('user_id')
    .in('user_id', targetIds)
    .is('archived_at', null)

  const hasCompany = new Set((companyRows ?? []).map(r => r.user_id))

  let sent = 0
  let skipped = 0

  for (const user of targets) {
    const signupDate = user.created_at?.slice(0, 10)
    const dayNumber  = signupDate === day2Date ? 2 : 7
    const profile    = profileMap[user.id]

    // Suppress: user has companies — they are actively using the product
    if (hasCompany.has(user.id)) {
      logger.info('activation-reminder-job: skip — has companies', { to: user.email, day: dayNumber })
      skipped++
      continue
    }

    // Suppress: user completed onboarding
    if (profile?.onboarding_completed_at) {
      logger.info('activation-reminder-job: skip — onboarding complete', { to: user.email, day: dayNumber })
      skipped++
      continue
    }

    const activation     = await getActivationStatus(supabase, user.id, profile)
    const completedCount = Object.values(activation).filter(Boolean).length

    if (completedCount === 6) { skipped++; continue }

    const missing    = ACTIONS.filter(a => !activation[a.key])
    const firstName  = profile?.full_name?.split(' ')[0] ?? 'there'
    const deliverTo  = profile?.briefing_email ?? user.email

    try {
      const { subject, html } = buildEmail({ firstName, dayNumber, missing, completedCount })
      await sendEmail({ to: deliverTo, subject, html })
      logger.info('activation-reminder-job: sent', { to: deliverTo, day: dayNumber, completedCount })
      sent++
    } catch (err) {
      logger.error('activation-reminder-job: send failed', { to: deliverTo, error: err.message })
      skipped++
    }
  }

  logger.info('activation-reminder-job: done', { sent, skipped })
}
