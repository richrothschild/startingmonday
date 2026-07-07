import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const state = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  createClient: vi.fn(),
  select: vi.fn(),
  upcoming: vi.fn(),
  past: vi.fn(),
}))

vi.mock('@/lib/require-auth', () => ({ requireAuth: state.requireAuth }))
vi.mock('@/lib/supabase/server', () => ({ createClient: state.createClient }))

import { GET } from './route'

describe('concierge calls route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.requireAuth.mockResolvedValue({ ok: true as const, userId: 'user-1', response: new NextResponse() })
    state.select.mockReturnValueOnce({
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [{ id: 'upcoming-1' }], error: null }),
    }).mockReturnValueOnce({
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [{ id: 'past-1' }], error: null }),
    })
    state.createClient.mockResolvedValue({
      from: () => ({ select: state.select }),
    })
  })

  it('returns auth response when unauthenticated', async () => {
    state.requireAuth.mockResolvedValueOnce({ ok: false as const, response: new NextResponse(null, { status: 401 }) })

    const response = await GET(new NextRequest('https://startingmonday.app/api/concierge/calls'))

    expect(response.status).toBe(401)
  })

  it('returns upcoming and past concierge calls', async () => {
    const response = await GET(new NextRequest('https://startingmonday.app/api/concierge/calls'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ upcoming: [{ id: 'upcoming-1' }], past: [{ id: 'past-1' }] })
  })
})
