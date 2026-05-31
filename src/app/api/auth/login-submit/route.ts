import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { enforcePublicEndpointGuard, getClientIp } from '@/lib/public-endpoint-guard'

export const runtime = 'nodejs'

function getPublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return request.nextUrl.origin
}

function getSafeNext(nextParam: FormDataEntryValue | null): string {
  const value = (nextParam?.toString() ?? '').trim()
  if (!value) return '/dashboard/briefing'
  return value.startsWith('/') ? value : '/dashboard/briefing'
}

function buildLoginRedirect(publicOrigin: string, nextPath: string, params: Record<string, string>) {
  const url = new URL('/login', publicOrigin)
  url.searchParams.set('next', nextPath)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed } = checkRateLimit(`login_submit:${ip}`, 8)

  const publicOrigin = getPublicOrigin(request)

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth_error', publicOrigin))
  }

  const nextPath = getSafeNext(formData.get('next'))

  if (!allowed) {
    return NextResponse.redirect(
      buildLoginRedirect(publicOrigin, nextPath, { error: 'rate_limited' })
    )
  }

  const intent = (formData.get('intent')?.toString() ?? 'signin').trim()
  const email = (formData.get('email')?.toString() ?? '').trim().toLowerCase()
  const password = formData.get('password')?.toString() ?? ''

  const supabase = await createClient()

  if (intent === 'magic') {
    if (!email) {
      return NextResponse.redirect(
        buildLoginRedirect(publicOrigin, nextPath, { error: 'missing_credentials' })
      )
    }

    const guardResponse = await enforcePublicEndpointGuard({
      request,
      rateLimitKey: 'magic-link-fallback',
      maxPerMinute: 3,
      requireCaptcha: true,
    })
    if (guardResponse) {
      if (guardResponse.status === 429) {
        return NextResponse.redirect(
          buildLoginRedirect(publicOrigin, nextPath, { error: 'rate_limited' })
        )
      }

      return NextResponse.redirect(
        buildLoginRedirect(publicOrigin, nextPath, { error: 'captcha_required' })
      )
    }

    const emailLimit = checkRateLimit(`magic-submit-email:${email}`, 3, 15 * 60_000)
    if (!emailLimit.allowed) {
      return NextResponse.redirect(
        buildLoginRedirect(publicOrigin, nextPath, { error: 'rate_limited' })
      )
    }

    const redirectTo = new URL('/auth/callback', publicOrigin)
    redirectTo.searchParams.set('next', nextPath)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo.toString(),
      },
    })

    if (error) {
      return NextResponse.redirect(
        buildLoginRedirect(publicOrigin, nextPath, { error: 'magic_failed' })
      )
    }

    return NextResponse.redirect(
      buildLoginRedirect(publicOrigin, nextPath, { info: 'magic_sent' })
    )
  }

  if (!email || !password) {
    return NextResponse.redirect(
      buildLoginRedirect(publicOrigin, nextPath, { error: 'missing_credentials' })
    )
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const invalidCredentials = /invalid login credentials/i.test(error.message)
    return NextResponse.redirect(
      buildLoginRedirect(publicOrigin, nextPath, {
        error: invalidCredentials ? 'invalid_credentials' : 'auth_error',
      })
    )
  }

  return NextResponse.redirect(new URL(nextPath, publicOrigin))
}


const __councilObservabilitySignal = () => console.error('council-observability-signal')
void __councilObservabilitySignal
