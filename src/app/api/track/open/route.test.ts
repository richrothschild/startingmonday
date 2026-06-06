import { createHash } from 'crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const state = vi.hoisted(() => ({
  parsePixelTokenSigned: vi.fn(),
  parsePixelTokenLegacyForTelemetry: vi.fn(),
  insert: vi.fn(async () => ({ error: null })),
}))

vi.mock('@/lib/pixel-token', () => ({
  parsePixelTokenSigned: state.parsePixelTokenSigned,
  parsePixelTokenLegacyForTelemetry: state.parsePixelTokenLegacyForTelemetry,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: state.insert,
    }),
  }),
}))

import { GET } from './route'

describe('track open pixel route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.parsePixelTokenLegacyForTelemetry.mockReturnValue(null)
    state.parsePixelTokenSigned.mockReturnValue({ uid: 'user_1', type: 'brief', d: '2026-06-05' })
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  it('hashes signed token before writing watermark event', async () => {
    const token = 'signed-token-value'
    const request = new NextRequest(`https://startingmonday.app/api/track/open?t=${token}`, {
      headers: { 'user-agent': 'vitest', 'x-real-ip': '127.0.0.1' },
    })

    const response = await GET(request)
    expect(response.status).toBe(200)

    await Promise.resolve()

    expect(state.insert).toHaveBeenCalledTimes(1)
    const payload = (state.insert as any).mock.calls[0]?.[0] as {
      raw_token: string
      token_signed: boolean
    } | undefined
    expect(payload).toBeDefined()
    if (!payload) return
    expect(payload.raw_token).toBe(createHash('sha256').update(token).digest('hex'))
    expect(payload.raw_token).not.toBe(token)
    expect(payload.token_signed).toBe(true)
  })
})
