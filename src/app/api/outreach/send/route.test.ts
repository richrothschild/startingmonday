import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const state = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  getStaffMember: vi.fn(),
  reviewEmail: vi.fn(() => []),
  autoRefineEmailDraft: vi.fn(),
  sendEmail: vi.fn(),
  insert: vi.fn(async () => ({ error: null })),
}))

vi.mock('@/lib/require-auth', () => ({ requireAuth: state.requireAuth }))
vi.mock('@/lib/staff', () => ({ getStaffMember: state.getStaffMember }))
vi.mock('@/lib/email-quality', () => ({ reviewEmail: state.reviewEmail }))
vi.mock('@/lib/email-council', () => ({ autoRefineEmailDraft: state.autoRefineEmailDraft }))
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
    state.autoRefineEmailDraft.mockReturnValue({
      evaluation: {
        scores: { open: 0.9, understand: 0.9, reply: 0.9, productLift: 0.9, ejes: 92 },
        blockers: [],
        warnings: [],
      },
      rewritesApplied: [],
      passesAfterRefine: true,
    })
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

  it('returns council details for dry runs when preflight passes', async () => {
    const req = new NextRequest('https://startingmonday.app/api/outreach/send', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Alex Morgan',
        company: 'Acme',
        emailTo: 'alex@example.com',
        subject: 'Simple CFO first-call plan for Acme',
        messageText: 'Hi Alex,\n\nStarting Monday helps transition programs with a shared readiness check before first serious outreach.\n\nIn our recent pilot (n=27), active users reached first qualified outreach faster; this is directional evidence, not a guarantee.\n\nIf useful, reply yes and I will send the checklist. If not useful right now, reply pass and I will close the loop.\n\nRich',
        mode: 'dry_run',
        outreachChannel: 'executives',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      ok: true,
      mode: 'dry_run',
      council: {
        minScore: 90,
        scores: { ejes: 92 },
      },
    })
    expect(state.sendEmail).not.toHaveBeenCalled()
  })

  it('blocks dry runs when council preflight fails', async () => {
    state.autoRefineEmailDraft.mockReturnValue({
      evaluation: {
        scores: { open: 0.8, understand: 0.8, reply: 0.8, productLift: 0.8, ejes: 87 },
        blockers: ['EJES 87 is below required 90.'],
        warnings: ['Binary yes/pass CTA not found.'],
      },
      rewritesApplied: [],
      passesAfterRefine: false,
    })

    const req = new NextRequest('https://startingmonday.app/api/outreach/send', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Alex Morgan',
        company: 'Acme',
        emailTo: 'alex@example.com',
        subject: 'Intro plan for Acme',
        messageText: 'Hi Alex, this note includes enough words to satisfy base route guardrails while the mocked council still blocks the draft for quality reasons in this test case.',
        mode: 'dry_run',
        outreachChannel: 'executives',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({
      error: 'Blocked by email council gate: EJES 87 < 90',
      violations: ['EJES 87 is below required 90.'],
      council: {
        scores: { ejes: 87 },
      },
    })
  })
})
