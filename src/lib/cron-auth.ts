import { timingSafeEqual } from 'crypto'
import { type NextRequest } from 'next/server'

export function validateCronRequest(request: NextRequest): boolean {
  const secret = request.nextUrl.searchParams.get('secret')
    ?? request.headers.get('x-cron-secret')
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
