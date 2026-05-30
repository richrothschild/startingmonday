import { type NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

type GuardOptions = {
  request: NextRequest
  rateLimitKey: string
  maxPerMinute: number
  requireCaptcha?: boolean
}

type TurnstileVerificationResponse = {
  success?: boolean
  'error-codes'?: string[]
}

function isTurnstileEnforced(): boolean {
  return process.env.TURNSTILE_ENFORCED === '1'
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'
  )
}

export async function enforcePublicEndpointGuard(
  options: GuardOptions,
): Promise<NextResponse | null> {
  const {
    request,
    rateLimitKey,
    maxPerMinute,
    requireCaptcha = false,
  } = options
  const ip = getClientIp(request)

  const { allowed, retryAfter } = checkRateLimit(`${rateLimitKey}:${ip}`, maxPerMinute)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {} },
    )
  }

  if (requireCaptcha && isTurnstileEnforced()) {
    const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { ok: false, error: 'Captcha is currently unavailable' },
          { status: 503 },
        )
      }
      return null
    }

    const token = request.headers.get('x-captcha-token')?.trim() ?? ''
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Captcha token is required' },
        { status: 400 },
      )
    }

    const payload = new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    })

    let verified = false
    try {
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      })

      if (response.ok) {
        const data = await response.json() as TurnstileVerificationResponse
        verified = data.success === true
      }
    } catch {
      verified = false
    }

    if (!verified) {
      return NextResponse.json(
        { ok: false, error: 'Captcha verification failed' },
        { status: 403 },
      )
    }
  }

  return null
}
