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

describe('concierge waitlist route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.guard.mockResolvedValue(null)
    state.upsert.mockResolvedValue({ error: null })
  })

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(new NextRequest('https://startingmonday.app/api/concierge-waitlist', {
      method: 'POST',
      body: '{',
    }))

    expect(response.status).toBe(400)
  })

  it('returns the guard response when rate limited', async () => {
    state.guard.mockResolvedValue(new Response(JSON.stringify({ ok: false }), { status: 429 }))

    const response = await POST(new NextRequest('https://startingmonday.app/api/concierge-waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'coach@example.com' }),
    }))

    expect(response.status).toBe(429)
    expect(state.upsert).not.toHaveBeenCalled()
  })

  it('normalizes the lead payload before upserting', async () => {
    const response = await POST(new NextRequest('https://startingmonday.app/api/concierge-waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Coach@Example.com ',
        company: '  Nash Group  ',
        role: '  Founder  ',
        situation: 'Looking for a faster pipeline',
        program: 'beta',
      }),
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(state.upsert).toHaveBeenCalledWith({
      email: 'coach@example.com',
      company: 'Nash Group',
      role: 'Founder | beta | note:Looking for a faster pipeline',
    }, { onConflict: 'email' })
  })

  it('rejects invalid email addresses', async () => {
    const response = await POST(new NextRequest('https://startingmonday.app/api/concierge-waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' }),
    }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ ok: false, error: 'Invalid email' })
  })
})
