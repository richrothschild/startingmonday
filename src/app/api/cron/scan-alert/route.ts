import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

const OWNER_EMAIL = 'rothschild@gmail.com'
const CONSECUTIVE_THRESHOLD = 3
const RE_ALERT_DAYS = 7

function isEmpty(scan: { status: string; raw_hits: unknown }): boolean {
  if (scan.status === 'error') return true
  if (!scan.raw_hits) return true
  if (Array.isArray(scan.raw_hits) && scan.raw_hits.length === 0) return true
  return false
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  // Get all active companies with career pages
  const { data: companies, error: compErr } = await admin
    .from('companies')
    .select('id, name, user_id, career_page_url, scan_alert_sent_at')
    .not('career_page_url', 'is', null)
    .is('archived_at', null)

  if (compErr) return NextResponse.json({ error: compErr.message }, { status: 500 })
  if (!companies?.length) return NextResponse.json({ checked: 0, alerted: 0 })

  const reAlertCutoff = new Date(Date.now() - RE_ALERT_DAYS * 86_400_000).toISOString()

  const failing: { companyId: string; name: string; userId: string; lastScans: string[] }[] = []

  for (const company of companies) {
    // Skip if alerted recently
    if (company.scan_alert_sent_at && company.scan_alert_sent_at > reAlertCutoff) continue

    const { data: scans } = await admin
      .from('scan_results')
      .select('status, raw_hits, scanned_at')
      .eq('company_id', company.id)
      .order('scanned_at', { ascending: false })
      .limit(CONSECUTIVE_THRESHOLD)

    if (!scans || scans.length < CONSECUTIVE_THRESHOLD) continue
    if (!scans.every(s => isEmpty(s))) continue

    failing.push({
      companyId: company.id,
      name: company.name,
      userId: company.user_id,
      lastScans: scans.map(s => `${new Date(s.scanned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -- ${s.status}`),
    })
  }

  if (!failing.length) {
    return NextResponse.json({ checked: companies.length, alerted: 0 })
  }

  // Get owner emails for the failing companies
  const userIds = [...new Set(failing.map(f => f.userId))]
  const { data: users } = await admin
    .from('users')
    .select('id, email')
    .in('id', userIds)

  const emailByUser: Record<string, string> = {}
  for (const u of users ?? []) emailByUser[u.id] = u.email

  const rows = failing.map(f => {
    const ownerEmail = emailByUser[f.userId] ?? '(unknown)'
    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a;">${f.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;">${ownerEmail}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;">${f.lastScans.join('<br>')}</td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px;color:#334155;">
<p style="font-size:16px;font-weight:700;color:#dc2626;margin:0 0 8px 0;">Scan failure alert: ${failing.length} company${failing.length > 1 ? 'ies' : 'y'} with ${CONSECUTIVE_THRESHOLD} consecutive empty results</p>
<p style="font-size:14px;color:#64748b;margin:0 0 20px 0;">Each company below has had ${CONSECUTIVE_THRESHOLD} consecutive scans return 0 results. This may mean the career page URL is broken, the page requires JavaScript, or the site structure changed.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;font-size:13px;">
  <thead>
    <tr style="background:#f8fafc;">
      <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Company</th>
      <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Owner</th>
      <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Last 3 scans</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<p style="font-size:12px;color:#94a3b8;margin-top:24px;">Starting Monday scan monitor</p>
</body></html>`

  await sendEmail({
    to: OWNER_EMAIL,
    subject: `[SM Alert] ${failing.length} company scan${failing.length > 1 ? 's' : ''} returning empty results`,
    html,
  })

  // Stamp scan_alert_sent_at on each failing company
  const now = new Date().toISOString()
  for (const f of failing) {
    await admin.from('companies').update({ scan_alert_sent_at: now }).eq('id', f.companyId)
  }

  return NextResponse.json({ checked: companies.length, alerted: failing.length })
}
