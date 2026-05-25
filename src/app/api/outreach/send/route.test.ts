import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const state = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getStaffMember: vi.fn(),
  reviewEmail: vi.fn(() => []),
}))

vi.mock('@/lib/require-auth', () => ({ requireAuth: state.requireAuth }))
vi.mock('@/lib/staff', () => ({ getStaffMember: state.getStaffMember }))
vi.mock('@/lib/email-quality', () => ({ reviewEmail: state.reviewEmail }))
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { email: 'sender@example.com' } } })) },
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null }) }) }) }) }) }),
    }),
  }),
}))

import { POST } from './route'

describe('outreach send route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.requireAuth.mockResolvedValue({ ok: true, userId: 'u_1' })
    state.getStaffMember.mockResolvedValue({ id: 'staff_1' })
  })

  it('passes through auth failure', async () => {
    state.requireAuth.mockResolvedValue({ ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) })
    const req = new NextRequest('https://startingmonday.app/api/outreach/send', { method: 'POST', body: '{}' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('rejects missing required fields', async () => {
    const req = new NextRequest('https://startingmonday.app/api/outreach/send', {
      method: 'POST',
      body: JSON.stringify({ fullName: 'Alex', emailTo: 'alex@example.com' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid send mode', async () => {
    const req = new NextRequest('https://startingmonday.app/api/outreach/send', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Alex',
        emailTo: 'alex@example.com',
        subject: 'Hello there',
        messageText: 'This is a valid message body with enough length to pass minimum guardrails and include context.',
        mode: 'invalid_mode',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'Invalid mode.' })
  })
})
