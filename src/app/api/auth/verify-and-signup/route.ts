import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { enforcePublicEndpointGuard } from '@/lib/public-endpoint-guard'

export const runtime = 'nodejs'

type RequestBody = {
  email?: unknown
  password?: unknown
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
