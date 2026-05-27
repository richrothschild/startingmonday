import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const state = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getStaffMember: vi.fn(),
  reviewEmail: vi.fn(() => []),
  sendEmail: vi.fn(),
  insert: vi.fn(async () => ({ error: null })),
}))

vi.mock('@/lib/require-auth', () => ({ requireAuth: state.requireAuth }))
vi.mock('@/lib/staff', () => ({ getStaffMember: state.getStaffMember }))
vi.mock('@/lib/email-quality', () => ({ reviewEmail: state.reviewEmail }))
vi.mock('@/lib/email', () => ({ sendEmail: state.sendEmail }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { email: 'sender@example.com' } } })) },
    from: () => {
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        ilike: vi.fn(() => query),
        limit: vi.fn(() => query),
        maybeSingle: vi.fn(async () => ({ data: null })),
        insert: state.insert,
      }
      return query
    },
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

  it('sends test emails with richard sender and reply-to', async () => {
    state.sendEmail.mockResolvedValue({ data: { id: 'msg_123' } })

    const req = new NextRequest('https://startingmonday.app/api/outreach/send', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Alex Morgan',
        company: 'Acme',
        emailTo: 'alex@example.com',
        subject: 'Quick intro for Acme role context',
        messageText: 'Hi Alex, I noticed recent leadership movement at Acme and wanted to share a concise perspective on likely search timing and what candidates are missing right now. Best, Rich',
        mode: 'test_to_self',
        outreachChannel: 'executives',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(state.sendEmail).toHaveBeenCalledTimes(1)
    expect(state.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      from: expect.stringMatching(/richard@startingmonday\.app/i),
      replyTo: 'richard@startingmonday.app',
    }))
  })
})
