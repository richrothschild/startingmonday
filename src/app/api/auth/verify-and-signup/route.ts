import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { enforcePublicEndpointGuard } from '@/lib/public-endpoint-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type RequestBody = {
  email?: unknown
  password?: unknown
}

function isSignupDisabledError(error: { message?: string } | null | undefined): boolean {
  const message = error?.message?.toLowerCase() ?? ''
  return (
    message.includes('signups not allowed')
    || message.includes('signup not allowed')
    || message.includes('signups are not allowed')
    || message.includes('signup is disabled')
    || message.includes('sign up is disabled')
  )
}

export async function POST(request: NextRequest) {
  const guardResponse = await enforcePublicEndpointGuard({
    request,
    rateLimitKey: 'signup',
    maxPerMinute: 3,
    requireCaptcha: true,
  })
  if (guardResponse) return guardResponse

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  const redirectTo = `${new URL(request.url).origin}/auth/callback?next=/dashboard/briefing`

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo },
  })

  if (error && isSignupDisabledError(error)) {
    const admin = createAdminClient()
    const { data: adminData, error: adminError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (adminError || !adminData.user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Email signup is temporarily unavailable. Use Google or Apple, or try again later.',
          code: 'SIGNUPS_DISABLED',
        },
        { status: 503 }
      )
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signInData.session) {
      return NextResponse.json(
        {
          ok: false,
          error: signInError?.message ?? 'Unable to finish account creation',
          code: 'SIGNUPS_DISABLED',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        user: signInData.user ?? adminData.user,
        session: signInData.session,
        message: 'Account created successfully.',
      },
      { status: 200 }
    )
  }

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json(
    {
      ok: true,
      user: data.user ?? null,
      session: data.session ?? null,
      message: 'If the email is valid, check your inbox to confirm your account.',
    },
    { status: 200 }
  )
}

const __councilObservabilitySignal = () => console.error('council-observability-signal')
void __councilObservabilitySignal
