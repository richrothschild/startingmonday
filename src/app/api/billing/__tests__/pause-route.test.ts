import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/require-auth')
vi.mock('@/lib/stripe')
vi.mock('@/lib/stripe-customer')

import { POST } from '../pause/route'
import { requireAuth } from '@/lib/require-auth'
import { getStripe } from '@/lib/stripe'
import { getOrRecoverStripeCustomerId } from '@/lib/stripe-customer'

const mockRequireAuth = vi.mocked(requireAuth)
const mockGetStripe = vi.mocked(getStripe)
const mockGetOrRecoverStripeCustomerId = vi.mocked(getOrRecoverStripeCustomerId)

function requestWithDays(days: unknown) {
  return new NextRequest('https://startingmonday.app/api/billing/pause', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days }),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  mockRequireAuth.mockResolvedValue({ ok: true as const, userId: 'user-1', response: new NextResponse() })
  mockGetOrRecoverStripeCustomerId.mockResolvedValue('cus_123')
})

describe('POST /api/billing/pause', () => {
  it('returns auth response when unauthenticated', async () => {
    mockRequireAuth.mockResolvedValue({ ok: false as const, response: new NextResponse(null, { status: 401 }) })
    const res = await POST(requestWithDays(14))
    expect(res.status).toBe(401)
  })

  it('uses default 14-day pause for invalid input', async () => {
    const list = vi.fn().mockResolvedValue({ data: [{ id: 'sub_1' }] })
    const update = vi.fn().mockResolvedValue({})
    mockGetStripe.mockReturnValue({ subscriptions: { list, update } } as unknown as ReturnType<typeof getStripe>)

    const before = Math.floor((Date.now() + 14 * 24 * 60 * 60 * 1000) / 1000)
    const res = await POST(requestWithDays(999))
    const after = Math.floor((Date.now() + 14 * 24 * 60 * 60 * 1000) / 1000)

    expect(res.status).toBe(200)
    expect(update).toHaveBeenCalledTimes(1)

    const [, payload] = update.mock.calls[0]
    expect(payload.pause_collection.behavior).toBe('void')
    expect(payload.pause_collection.resumes_at).toBeGreaterThanOrEqual(before)
    expect(payload.pause_collection.resumes_at).toBeLessThanOrEqual(after)

    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.pauseDays).toBe(14)
  })

  it('honors valid 30-day pause selection', async () => {
    const list = vi.fn().mockResolvedValue({ data: [{ id: 'sub_1' }] })
    const update = vi.fn().mockResolvedValue({})
    mockGetStripe.mockReturnValue({ subscriptions: { list, update } } as unknown as ReturnType<typeof getStripe>)

    const res = await POST(requestWithDays(30))
    expect(res.status).toBe(200)

    const [, payload] = update.mock.calls[0]
    expect(payload.pause_collection.behavior).toBe('void')

    const body = await res.json()
    expect(body.pauseDays).toBe(30)
  })
})
