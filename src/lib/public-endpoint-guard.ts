import { type NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

type GuardOptions = {
  request: NextRequest
  captchaToken: string | null
  rateLimitKey: string
  maxPerMinute: number
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'
  )
}

async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return false

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  })

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })

    if (!response.ok) return false

    const data = await response.json() as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

export async function enforcePublicEndpointGuard(
  options: GuardOptions,
): Promise<NextResponse | null> {
  const { request, captchaToken, rateLimitKey, maxPerMinute } = options
  const ip = getClientIp(request)

  const { allowed, retryAfter } = checkRateLimit(`${rateLimitKey}:${ip}`, maxPerMinute)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {} },
    )
  }

  if (!captchaToken) {
    return NextResponse.json({ ok: false, error: 'Captcha is required' }, { status: 400 })
  }

  const captchaValid = await verifyTurnstileToken(captchaToken, ip)
  if (!captchaValid) {
    return NextResponse.json({ ok: false, error: 'Captcha verification failed' }, { status: 403 })
  }

  return null
}
