import { type NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

const OWNER_EMAIL = process.env.OWNER_EMAIL

const TIER_LABELS: Record<string, string> = {
  trialing:  'Free trial',
  passive:   'Intelligence ($49/mo)',
  active:    'Search ($129/mo)',
  executive: 'Executive ($249/mo)',
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email   = (body?.email  ?? '').toString().trim()
  const tier    = (body?.tier   ?? 'trialing').toString().trim()
  const source  = (body?.source ?? '').toString().trim() || null

  if (!email) return NextResponse.json({ ok: true })
  if (!OWNER_EMAIL) return NextResponse.json({ ok: true })

  const tierLabel = TIER_LABELS[tier] ?? tier
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  sendEmail({
    to: OWNER_EMAIL,
    subject: `New signup: ${email}`,
    html: `
      <p style="font-family:sans-serif;font-size:14px;color:#0f172a;margin:0 0 12px 0;">
        <strong>${email}</strong> just signed up.
      </p>
      <table style="font-family:sans-serif;font-size:13px;color:#334155;border-collapse:collapse;">
        <tr><td style="padding:4px 16px 4px 0;color:#64748b;">Plan</td><td><strong>${tierLabel}</strong></td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:#64748b;">Time</td><td>${now} CT</td></tr>
        ${source ? `<tr><td style="padding:4px 16px 4px 0;color:#64748b;">Source</td><td>${source}</td></tr>` : ''}
      </table>
    `,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
