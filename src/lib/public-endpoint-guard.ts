import { type NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

type GuardOptions = {
  request: NextRequest
  rateLimitKey: string
  maxPerMinute: number
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
  } = options
  const ip = getClientIp(request)

  const { allowed, retryAfter } = checkRateLimit(`${rateLimitKey}:${ip}`, maxPerMinute)
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {} },
    )
  }

  return null
}
