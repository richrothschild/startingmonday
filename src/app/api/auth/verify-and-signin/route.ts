import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { verifyTurnstileToken, getClientIp } from '@/lib/public-endpoint-guard'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

type RequestBody = {
  email?: unknown
  password?: unknown
  turnstileToken?: unknown
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rateLimitKey = `login:${ip}`

  // Rate limit login attempts (5 per minute per IP)
  const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 5)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {},
      }
    )
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { email, password, turnstileToken } = body

  // Validate input types
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'Missing or invalid required fields' },
      { status: 400 }
    )
  }

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Server-side Turnstile verification - skipped when TURNSTILE_SECRET_KEY is not configured
  // (allows staging/dev environments without Cloudflare Turnstile set up)
  const turnstileConfigured = !!process.env.TURNSTILE_SECRET_KEY
  if (turnstileConfigured) {
    if (typeof turnstileToken !== 'string' || !turnstileToken) {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }
    const captchaValid = await verifyTurnstileToken(turnstileToken, ip)
    if (!captchaValid) {
      return NextResponse.json(
        { ok: false, error: 'Captcha verification failed' },
        { status: 403 }
      )
    }
  }

  // Proceed with authentication
  try {
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 401 }
      )
    }

    if (data.user) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      await supabase.from('user_profiles').upsert(
        { user_id: data.user.id, briefing_timezone: tz },
        { onConflict: 'user_id' }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        user: data.user,
        session: data.session,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { ok: false, error: 'An error occurred during sign-in' },
      { status: 500 }
    )
  }
}
