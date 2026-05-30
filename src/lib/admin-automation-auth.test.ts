import { describe, expect, it } from 'vitest'
import type { NextRequest } from 'next/server'
import { extractAutomationServiceToken, tokensMatch } from '@/lib/admin-automation-auth'

describe('extractAutomationServiceToken', () => {
  it('prefers explicit automation token header', () => {
    const request = {
      headers: new Headers({
        'x-automation-service-token': 'abc123',
        authorization: 'Bearer ignored',
      }),
    } as unknown as NextRequest

    expect(extractAutomationServiceToken(request)).toBe('abc123')
  })

  it('falls back to bearer token', () => {
    const request = {
      headers: new Headers({
        authorization: 'Bearer token-from-bearer',
      }),
    } as unknown as NextRequest

    expect(extractAutomationServiceToken(request)).toBe('token-from-bearer')
  })
})

describe('tokensMatch', () => {
  it('returns true for exact matches and false otherwise', () => {
    expect(tokensMatch('same-token', 'same-token')).toBe(true)
    expect(tokensMatch('different-a', 'different-b')).toBe(false)
    expect(tokensMatch('', 'different-b')).toBe(false)
  })
})
