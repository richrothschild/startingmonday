import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { APP_URL } from '@/lib/config'

// Activation drip schedule: days since trial start -> content key
const DRIP_DAYS = [0, 3, 5, 7, 10, 14] as const
type DripDay = (typeof DRIP_DAYS)[number]

// Max days after the scheduled day to still send (catch-up window if cron was down)
const CATCHUP_DAYS = 3

function unsubscribeUrl(userId: string): string {
  const token = Buffer.from(userId).toString('base64url')
  return `${APP_URL}/api/drip/unsubscribe?uid=${token}`
}

function emailFooter(userId: string): string {
  return `
<tr><td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
  <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
    Rich Rothschild<br>Founder, Starting Monday
  </p>
  <p style="margin:8px 0 0 0;font-size:11px;color:#94a3b8;">
    <a href="${unsubscribeUrl(userId)}" style="color:#94a3b8;">Unsubscribe from these emails</a>
  </p>
</td></tr>`
}

function buildEmail(day: DripDay, firstName: string, userId: string, hasCompany: boolean): { subject: string; html: string } {
  const footer = emailFooter(userId)

  const header = (title: string) => `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="background:#0f172a;padding:32px 40px;">
  <div style="color:#334155;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:12px;">Starting Monday</div>
  <div style="color:#ffffff;font-size:20px;font-weight:700;line-height:1.2;">${title}</div>
</td></tr>
<tr><td style="padding:32px 40px 24px 40px;font-size:14px;color:#334155;line-height:1.75;">`

  const footer_row = `</td></tr>${footer}</table></td></tr></table></body></html>`

  const cta = (text: string, href: string) =>
    `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
      <tr><td style="background:#0f172a;border-radius:4px;">
        <a href="${href}" style="display:inline-block;color:#ffffff;text-decoration:none;padding:12px 28px;font-size:14px;font-weight:600;">${text} &rarr;</a>
      </td></tr>
    </table>`

  if (day === 0) {
    return {
      subject: `Your trial starts now, ${firstName}. Do this in the next 10 minutes.`,
      html: header(`Good to have you here, ${firstName}.`) +
        `<p style="margin:0 0 16px 0;">The platform works from the moment you add your first company. That is where to start.</p>
        <p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">Three steps for today:</p>
        <ol style="margin:8px 0 16px 0;padding-left:20px;line-height:1.9;">
          <li>Add 3 to 5 companies where you already have a relationship or contact</li>
          <li>Set your briefing time in Settings (default is 7am)</li>
          <li>Add one contact at a target company and log when you last spoke</li>
        </ol>
        <p style="margin:0 0 16px 0;">That is it. Tomorrow morning you get your first briefing.</p>
        <p style="margin:0 0 4px 0;">If you have questions, reply to this email. I read everything.</p>
        ${cta('Open your dashboard', `${APP_URL}/dashboard`)}` +
        footer_row,
    }
  }

  if (day === 3) {
    if (!hasCompany) {
      return {
        subject: 'Three days in. You have not added any companies yet.',
        html: header('Your target list is empty.') +
          `<p style="margin:0 0 16px 0;">The platform cannot work without a target list. It is that simple.</p>
          <p style="margin:0 0 16px 0;">Adding a company takes two minutes. Start with ones where you know someone. Those are where timing matters most.</p>
          ${cta('Add your first company', `${APP_URL}/dashboard/companies/new`)}
          <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">Reply if you have questions about what to track or how to use the platform.</p>` +
          footer_row,
      }
    }
    return {
      subject: 'Three days in. Here is what Starting Monday is doing for you.',
      html: header('Your scanners are running.') +
        `<p style="margin:0 0 16px 0;">You added your companies. Good. Here is what is happening.</p>
        <p style="margin:0 0 16px 0;">Every company you are tracking gets scanned for career page changes, leadership moves, 8-K filings, funding announcements, and news. When signals cluster into a pattern, we name it.</p>
        <p style="margin:0 0 16px 0;">Check your morning briefing tomorrow. The signals from the last 24 hours will be there.</p>
        ${cta('View your pipeline', `${APP_URL}/dashboard`)}` +
        footer_row,
    }
  }

  if (day === 5) {
    return {
      subject: 'See how your LinkedIn reads to a search committee.',
      html: header('Your profile is the first thing they see.') +
        `<p style="margin:0 0 16px 0;">A recruiter spends 30 seconds on a LinkedIn profile before deciding whether to reach out.</p>
        <p style="margin:0 0 16px 0;">Starting Monday scans for the signals that make them keep reading: specificity on scope, quantified impact, seniority markers that hold up to scrutiny.</p>
        <p style="margin:0 0 16px 0;">Run your profile through the free grade. It takes 90 seconds. You will get specific feedback, not generic advice.</p>
        ${cta('Grade my LinkedIn profile', `${APP_URL}/optimize`)}` +
        footer_row,
    }
  }

  if (day === 7) {
    return {
      subject: 'One week in. Here is what to focus on next.',
      html: header('One week.') +
        `<p style="margin:0 0 16px 0;">If your briefings are running, you are ahead of most candidates in active search. Most of them are still refreshing LinkedIn and waiting for recruiters to call.</p>
        <p style="margin:0 0 10px 0;font-weight:600;color:#0f172a;">Three things that separate the candidates who close at the executive level:</p>
        <ul style="margin:8px 0 16px 0;padding-left:20px;line-height:1.9;">
          <li>They add companies where they have a relationship first. Timing matters most where you have a way in.</li>
          <li>They act on pattern alerts within 48 hours. The window before a search goes public is real and short.</li>
          <li>They track every conversation. Not to feel organized. To know exactly where they stand in every pipeline.</li>
        </ul>
        ${cta('Go to your dashboard', `${APP_URL}/dashboard`)}` +
        footer_row,
    }
  }

  if (day === 10) {
    return {
      subject: 'Ten days in. A few things to check.',
      html: header('A quick check-in.') +
        `<p style="margin:0 0 16px 0;">At this point you should have seen at least one signal fire for a company you are watching.</p>
        <p style="margin:0 0 10px 0;">If you have not, two things to check:</p>
        <ul style="margin:8px 0 16px 0;padding-left:20px;line-height:1.9;">
          <li>Are you watching companies with active leadership? Stable, profitable enterprises generate fewer signals. Add companies going through transitions.</li>
          <li>Did you add a career page URL for each company? That is how we catch role postings before they go public. Go to each company and confirm the URL is there.</li>
        </ul>
        <p style="margin:0 0 4px 0;">Reply if you are not sure what to track. I will help you set up your list.</p>
        ${cta('Review your pipeline', `${APP_URL}/dashboard`)}` +
        footer_row,
    }
  }

  // day === 14
  return {
    subject: 'Two weeks in. Here is where things stand.',
    html: header('Half your trial is gone.') +
      `<p style="margin:0 0 16px 0;">Two weeks. Your platform has been scanning your companies, tracking signals, and building briefings every morning.</p>
      <p style="margin:0 0 16px 0;">If you have been reading the briefings, you know more about your target companies right now than most candidates who are already in active conversations with them.</p>
      <p style="margin:0 0 16px 0;">If you have not logged in this week, this is the moment to decide: is this search serious?</p>
      <p style="margin:0 0 16px 0;">Starting Monday is $199 per month after the trial. The executives who close at this level use every advantage available. The ones who do not tend to find out why too late.</p>
      <p style="margin:0 0 4px 0;">Reply if you have questions. I read everything.</p>
      ${cta('Continue your search', `${APP_URL}/dashboard`)}` +
      footer_row,
  }
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const now = Date.now()

  // Get all trialing users who have not unsubscribed
  const { data: trialUsers, error: usersErr } = await admin
    .from('users')
    .select('id, email, created_at, first_company_added_at')
    .eq('subscription_status', 'trialing')
    .is('drip_unsubscribed_at', null)

  if (usersErr) return NextResponse.json({ error: usersErr.message }, { status: 500 })
  if (!trialUsers?.length) return NextResponse.json({ sent: 0, skipped: 0 })

  const userIds = trialUsers.map(u => u.id)

  // Get all drip emails already sent for these users
  const { data: sentRows } = await admin
    .from('drip_sends')
    .select('user_id, drip_day')
    .in('user_id', userIds)

  const sentSet = new Set((sentRows ?? []).map(s => `${s.user_id}:${s.drip_day}`))

  // Get first names from profiles
  const { data: profiles } = await admin
    .from('user_profiles')
    .select('user_id, full_name')
    .in('user_id', userIds)

  const nameByUser: Record<string, string> = {}
  for (const p of profiles ?? []) {
    if (p.full_name) {
      nameByUser[p.user_id] = p.full_name.split(' ')[0]
    }
  }

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const u of trialUsers) {
    const daysSinceSignup = Math.floor((now - new Date(u.created_at).getTime()) / 86_400_000)
    const firstName = nameByUser[u.id] ?? u.email.split('@')[0]
    const hasCompany = !!u.first_company_added_at

    for (const day of DRIP_DAYS) {
      if (sentSet.has(`${u.id}:${day}`)) continue
      if (daysSinceSignup < day) continue
      if (daysSinceSignup > day + CATCHUP_DAYS) continue

      const { subject, html } = buildEmail(day, firstName, u.id, hasCompany)

      const { error: sendErr } = await sendEmail({ to: u.email, subject, html })
      if (sendErr) {
        errors.push(`${u.email} day ${day}: ${(sendErr as { message?: string }).message ?? 'send failed'}`)
        continue
      }

      await admin.from('drip_sends').upsert({ user_id: u.id, drip_day: day }, { onConflict: 'user_id,drip_day', ignoreDuplicates: true })
      sent++
    }

    skipped++
  }

  return NextResponse.json({ sent, users: trialUsers.length, errors: errors.slice(0, 10) })
}
