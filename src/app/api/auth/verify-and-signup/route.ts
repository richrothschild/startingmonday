import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { getClientIp, verifyTurnstileToken } from '@/lib/public-endpoint-guard'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

type RequestBody = {
  email?: unknown
  password?: unknown
  turnstileToken?: unknown
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rateLimitKey = `signup:${ip}`

  const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 3)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many signup attempts. Please try again later.' },
      { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {} }
    )
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : ''

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const redirectTo = `${new URL(request.url).origin}/dashboard/briefing`

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: { redirectTo },
  })

  if (error || !data?.properties?.action_link) {
    return NextResponse.json({ ok: false, error: error?.message ?? 'Failed to generate confirmation link' }, { status: 400 })
  }

  const confirmationLink = data.properties.action_link

  await sendEmail({
    to: email,
    subject: 'Confirm your Starting Monday account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Confirm your Starting Monday account</h1>
        <p style="margin: 0 0 16px;">Click the button below to confirm your email address and finish creating your account.</p>
        <p style="margin: 24px 0;">
          <a href="${confirmationLink}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600;">Confirm email</a>
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; color: #4b5563;">If the button does not work, paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 14px; color: #1f2937;">${confirmationLink}</p>
        <p style="margin: 24px 0 0; font-size: 12px; color: #6b7280;">If you did not request this email, you can ignore it.</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true, user: data.user ?? null, session: null }, { status: 200 })
}