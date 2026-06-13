import { beforeEach, describe, expect, it } from 'vitest'
import type { NextRequest } from 'next/server'
import { validateCronRequest } from '@/lib/cron-auth'

function makeRequest(headers: Record<string, string> = {}, query = ''): NextRequest {
  const url = new URL(`https://example.test/api/cron${query ? `?${query}` : ''}`)
  return {
    headers: new Headers(headers),
    nextUrl: url,
  } as unknown as NextRequest
}

describe('validateCronRequest', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'top-secret'
  })

  it('accepts x-cron-secret header', () => {
    const request = makeRequest({ 'x-cron-secret': 'top-secret' })
    expect(validateCronRequest(request)).toBe(true)
  })

  it('accepts bearer token auth header', () => {
    const request = makeRequest({ authorization: 'Bearer top-secret' })
    expect(validateCronRequest(request)).toBe(true)
  })

  it('accepts query-string secret fallback', () => {
    const request = makeRequest({}, 'secret=top-secret')
    expect(validateCronRequest(request)).toBe(true)
  })
})
