import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const state = vi.hoisted(() => ({
  burstLimit: vi.fn(),
  getQuery: {
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  },
  countQuery: {
    eq: vi.fn(),
    gte: vi.fn(),
  },
  insert: vi.fn(),
}))

vi.mock('@/lib/burst-limit', () => ({
  checkBurstLimit: state.burstLimit,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: (columns: string, options?: { count?: 'exact'; head?: boolean }) => {
        void columns
        return (
        options?.head ? state.countQuery : state.getQuery
        )
      },
      insert: state.insert,
    }),
  }),
}))

import { GET, POST } from './route'

describe('ideas route', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    state.burstLimit.mockResolvedValue(true)
    state.insert.mockResolvedValue({ error: null })

    state.getQuery.eq.mockImplementation(() => state.getQuery)
    state.getQuery.order.mockImplementation(() => state.getQuery)
    state.getQuery.limit.mockResolvedValue({
      data: [{ id: 'idea-1', name: 'Ada', category: 'bug', body: 'Fix the dashboard search flow', ai_rating: null, created_at: '2026-01-01T00:00:00.000Z' }],
      error: null,
    })

    state.countQuery.eq.mockImplementation(() => state.countQuery)
    state.countQuery.gte.mockResolvedValue({ count: 0 })
  })

  it('returns ideas from the public listing', async () => {
    const response = await GET(new NextRequest('https://startingmonday.app/api/ideas'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      ideas: [
        {
          id: 'idea-1',
          name: 'Ada',
          category: 'bug',
          body: 'Fix the dashboard search flow',
          ai_rating: null,
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    })
    expect(state.getQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('returns a degraded payload when the listing query fails', async () => {
    state.getQuery.limit.mockResolvedValueOnce({ data: [], error: { message: 'boom' } })

    const response = await GET(new NextRequest('https://startingmonday.app/api/ideas?sortBy=rated'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ideas: [], degraded: true })
    expect(state.getQuery.order).toHaveBeenCalledWith('ai_rating->score', { ascending: false, nullsFirst: false })
  })

  it('rejects invalid json and rate limits before insert', async () => {
    state.burstLimit.mockResolvedValueOnce(false)

    const limited = await POST(new NextRequest('https://startingmonday.app/api/ideas', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.10' },
      body: JSON.stringify({ email: 'coach@example.com' }),
    }))

    expect(limited.status).toBe(429)

    const invalid = await POST(new NextRequest('https://startingmonday.app/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    }))

    expect(invalid.status).toBe(400)
  })

  it('validates and saves a submitted idea', async () => {
    const response = await POST(new NextRequest('https://startingmonday.app/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.10' },
      body: JSON.stringify({
        name: 'Ada',
        email: 'Ada@Example.com ',
        category: 'feature_request',
        body: 'We should add a better executive dashboard for search tracking.',
      }),
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(state.countQuery.eq).toHaveBeenCalledWith('email', 'ada@example.com')
    expect(state.insert).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      category: 'feature_request',
      body: 'We should add a better executive dashboard for search tracking.',
    })
  })
})
