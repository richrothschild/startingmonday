// Legacy HTTP-cron endpoint kept for backwards compatibility.
// The worker (worker/jobs/briefing-job.js) is the active briefing sender.
// This endpoint requires BRIEFING_CRON_SECRET header to remain secure.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { todayInTz, fullDateInTz } from '@/lib/date'
import { APP_URL } from '@/lib/config'

// Returns true if the user is due a briefing today (not already sent in last 20h)
function isDue(profile: { briefing_days?: string[] | null; briefing_timezone?: string | null; last_briefing_sent_at?: string | null }, tz: string): boolean {
  if (profile.last_briefing_sent_at) {
    const last = new Date(profile.last_briefing_sent_at)
    if (Date.now() - last.getTime() < 20 * 60 * 60 * 1000) return false
  }
  if (profile.briefing_days && profile.briefing_days.length > 0) {
    const todayName = new Date().toLocaleString('en-US', { timeZone: tz, weekday: 'long' })
    if (!profile.briefing_days.includes(todayName)) return false
  }
  return true
}

function buildHtml(params: {
  firstName: string
  dateLabel: string
  totalCompanies: number
  activeCount: number
  overdueCount: number
  followUps: { action: string; company: string | null; daysOverdue: number }[]
  scanMatches: { company: string; title: string; score: number }[]
  dashboardUrl: string
}): string {
  const { firstName, dateLabel, totalCompanies, activeCount, overdueCount, followUps, scanMatches, dashboardUrl } = params

  const followUpRows = followUps.map(f => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <div style="font-size:14px;font-weight:600;color:#0f172a;">${escHtml(f.action)}</div>
        ${f.company ? `<div style="font-size:12px;color:#94a3b8;margin-top:2px;">${escHtml(f.company)}</div>` : ''}
      </td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f1f5f9;text-align:right;white-space:nowrap;">
        <span style="font-size:12px;font-weight:600;color:${f.daysOverdue > 0 ? '#dc2626' : '#64748b'};">
          ${f.daysOverdue > 0 ? `${f.daysOverdue}d overdue` : 'Today'}
        </span>
      </td>
    </tr>`).join('')

  const scanRows = scanMatches.map(m => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <div style="font-size:14px;font-weight:600;color:#0f172a;">${escHtml(m.title)}</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:2px;">${escHtml(m.company)}</div>
      </td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f1f5f9;text-align:right;">
        <span style="font-size:12px;font-weight:600;color:#0f172a;">${m.score}</span>
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

  <!-- Header -->
  <tr><td style="padding-bottom:32px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#475569;">Starting Monday</div>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:32px;margin-bottom:16px;">
    <div style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:4px;">Good morning, ${escHtml(firstName)}.</div>
    <div style="font-size:13px;color:#94a3b8;margin-bottom:28px;">${escHtml(dateLabel)}</div>

    <!-- Stats -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td style="text-align:center;padding:16px;background:#f8fafc;border-radius:6px;">
        <div style="font-size:28px;font-weight:700;color:#0f172a;">${totalCompanies}</div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#94a3b8;margin-top:4px;">Companies</div>
      </td>
      <td width="12"></td>
      <td style="text-align:center;padding:16px;background:#f8fafc;border-radius:6px;">
        <div style="font-size:28px;font-weight:700;color:#0f172a;">${activeCount}</div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#94a3b8;margin-top:4px;">Active</div>
      </td>
      <td width="12"></td>
      <td style="text-align:center;padding:16px;background:#f8fafc;border-radius:6px;">
        <div style="font-size:28px;font-weight:700;color:${overdueCount > 0 ? '#b91c1c' : '#0f172a'};">${overdueCount}</div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#94a3b8;margin-top:4px;">Actions Due</div>
      </td>
    </tr>
    </table>

    ${followUps.length > 0 ? `
    <!-- Actions Due -->
    <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;margin-bottom:12px;">Actions Due</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${followUpRows}
    </table>
    <div style="margin-bottom:24px;"></div>
    ` : ''}

    ${scanMatches.length > 0 ? `
    <!-- New Matches -->
    <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;margin-bottom:12px;">New Scan Matches</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${scanRows}
    </table>
    <div style="margin-bottom:24px;"></div>
    ` : ''}

    <!-- CTA -->
    <a href="${dashboardUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;font-size:13px;font-weight:600;padding:12px 24px;border-radius:6px;text-decoration:none;">
      Open dashboard
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:24px;text-align:center;">
    <div style="font-size:12px;color:#cbd5e1;">Starting Monday &mdash; startingmonday.app</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.BRIEFING_CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  // Fetch all users with completed onboarding and active/trialing subscription
  const { data: rows, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      subscription_status,
      user_profiles (
        full_name,
        briefing_timezone,
        briefing_days,
        last_briefing_sent_at,
        onboarding_completed_at
      )
    `)
    .in('subscription_status', ['trialing', 'active'])

  if (error || !rows) {
    return NextResponse.json({ error: error?.message ?? 'Query failed' }, { status: 500 })
  }

  const dashboardUrl = `${APP_URL}/dashboard`
  let sent = 0
  let skipped = 0

  for (const row of rows) {
    const profile = Array.isArray(row.user_profiles) ? row.user_profiles[0] : row.user_profiles
    if (!profile?.onboarding_completed_at) { skipped++; continue }

    const tz = profile.briefing_timezone ?? 'America/New_York'
    if (!isDue(profile, tz)) { skipped++; continue }

    const todayLocal = todayInTz(tz)
    const dateLabel  = fullDateInTz(tz)

    // Fetch pipeline data for this user
    const [{ data: companies }, { data: followUps }, { data: scanResults }] = await Promise.all([
      supabase.from('companies').select('stage').eq('user_id', row.id).is('archived_at', null),
      supabase
        .from('follow_ups')
        .select('action, due_date, companies(name)')
        .eq('user_id', row.id)
        .eq('status', 'pending')
        .lte('due_date', todayLocal)
        .order('due_date', { ascending: true })
        .limit(10),
      supabase
        .from('scan_results')
        .select('company_id, scanned_at, raw_hits, companies(name)')
        .eq('user_id', row.id)
        .eq('status', 'success')
        .gte('scanned_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ])

    const allCompanies = companies ?? []
    const totalCompanies = allCompanies.length
    const activeCount = allCompanies.filter(c => ['interviewing', 'applied', 'offer'].includes(c.stage)).length
    const overdueCount = (followUps ?? []).length

    const followUpItems = (followUps ?? []).map(f => {
      const co = f.companies as unknown as { name: string } | null
      const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(f.due_date + 'T00:00:00').getTime()) / 86400000))
      return { action: f.action, company: co?.name ?? null, daysOverdue }
    })

    const scanMatchItems: { company: string; title: string; score: number }[] = []
    for (const sr of scanResults ?? []) {
      const co = sr.companies as unknown as { name: string } | null
      const hits = ((sr.raw_hits ?? []) as { title: string; score: number; is_match: boolean }[])
        .filter(h => h.is_match)
        .slice(0, 3)
      for (const h of hits) {
        scanMatchItems.push({ company: co?.name ?? 'Unknown', title: h.title, score: h.score })
      }
    }

    const firstName = profile.full_name?.split(' ')[0] ?? 'there'
    const subject = `Your briefing for ${dateLabel}`

    const html = buildHtml({
      firstName,
      dateLabel,
      totalCompanies,
      activeCount,
      overdueCount,
      followUps: followUpItems,
      scanMatches: scanMatchItems,
      dashboardUrl,
    })

    const { error: sendError } = await sendEmail({ to: row.email, subject, html })
    if (!sendError) {
      await supabase
        .from('user_profiles')
        .update({ last_briefing_sent_at: new Date().toISOString() })
        .eq('user_id', row.id)
      sent++
    }
  }

  return NextResponse.json({ sent, skipped })
}
