import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const state = vi.hoisted(() => ({
  guard: vi.fn(),
  upsert: vi.fn(),
}))

vi.mock('@/lib/public-endpoint-guard', () => ({
  enforcePublicEndpointGuard: state.guard,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: state.upsert,
    }),
  }),
}))

import { POST } from './route'

describe('demo email route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.guard.mockResolvedValue(null)
    state.upsert.mockResolvedValue({ error: null })
  })

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(new NextRequest('https://startingmonday.app/api/demo-email', {
      method: 'POST',
      body: '{',
    }))

    expect(response.status).toBe(400)
  })

  it('returns the guard response when blocked', async () => {
    state.guard.mockResolvedValue(new Response(JSON.stringify({ ok: false }), { status: 429 }))

    const response = await POST(new NextRequest('https://startingmonday.app/api/demo-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'coach@example.com' }),
    }))

    expect(response.status).toBe(429)
    expect(state.upsert).not.toHaveBeenCalled()
  })

  it('stores the normalized demo lead payload', async () => {
    const response = await POST(new NextRequest('https://startingmonday.app/api/demo-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'Coach@Example.com ', company: '  Northstar  ', role: '  CEO  ' }),
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(state.upsert).toHaveBeenCalledWith({
      email: 'coach@example.com',
      company: 'Northstar',
      role: 'CEO',
    }, { onConflict: 'email' })
  })
})
