import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getClientIp } from '@/lib/public-endpoint-guard'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

type RequestBody = {
  email?: unknown
  redirectTo?: unknown
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rateLimitKey = `magic-link:${ip}`

  const { allowed, retryAfter } = checkRateLimit(rateLimitKey, 5)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {} }
    )
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const redirectTo = typeof body.redirectTo === 'string' && body.redirectTo
    ? body.redirectTo
    : `${new URL(request.url).origin}/auth/callback?next=/dashboard/briefing`

  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email is required' }, { status: 400 })
  }

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

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: false,
      },
    })

    return NextResponse.json(
      {
        ok: true,
        message: 'If an account exists for that email, a sign-in link has been sent.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Magic link request error:', error)
    return NextResponse.json({ ok: false, error: 'Failed to send sign-in link' }, { status: 500 })
  }
}