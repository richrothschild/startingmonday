import { timingSafeEqual } from 'crypto'
import { type NextRequest } from 'next/server'

export function validateCronRequest(request: NextRequest): boolean {
  const explicit = request.headers.get('x-cron-secret')?.trim() ?? ''
  const authorization = request.headers.get('authorization') ?? ''
  const [scheme, bearerToken] = authorization.split(' ')
  const bearer = scheme?.toLowerCase() === 'bearer' ? (bearerToken?.trim() ?? '') : ''
  
  // Check query string as fallback
  const url = request.nextUrl
  const querySecret = url.searchParams.get('secret')?.trim() ?? ''
  
  const secret = explicit || bearer || querySecret
  const expected = process.env.CRON_SECRET
  if (!secret || !expected) return false
  try {
    const a = Buffer.from(secret)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
