import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getClientIp, verifyTurnstileToken } from '@/lib/public-endpoint-guard'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

type RequestBody = {
  provider?: unknown
  turnstileToken?: unknown
  redirectTo?: unknown
}

const ALLOWED_PROVIDERS = new Set(['google', 'apple'])

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rateLimitKey = `oauth:${ip}`

  const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 5)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {} }
    )
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  const provider = typeof body.provider === 'string' ? body.provider : ''
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : ''
  const redirectTo = typeof body.redirectTo === 'string' && body.redirectTo ? body.redirectTo : `${new URL(request.url).origin}/auth/callback`

  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json({ ok: false, error: 'Unsupported provider' }, { status: 400 })
  }

  if (!turnstileToken) {
    return NextResponse.json({ ok: false, error: 'Captcha is required' }, { status: 400 })
  }

  const captchaValid = await verifyTurnstileToken(turnstileToken, ip)
  if (!captchaValid) {
    return NextResponse.json({ ok: false, error: 'Captcha verification failed' }, { status: 403 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'apple',
    options: { redirectTo },
  })

  if (error || !data.url) {
    return NextResponse.json({ ok: false, error: error?.message ?? 'Failed to start OAuth sign-in' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, url: data.url }, { status: 200 })
}