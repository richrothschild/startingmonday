import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const state = vi.hoisted(() => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/lib/require-auth', () => ({ requireAuth: state.requireAuth }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { full_name: 'Owner User' } }) }) }),
    }),
  }),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: { token: 'tok_1' }, error: null }) }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  }),
}))
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn(async () => ({ data: { id: 'msg_1' } })) }))
vi.mock('@/lib/config', () => ({ APP_URL: 'https://startingmonday.app' }))

import { POST } from './route'

describe('team invite route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.requireAuth.mockResolvedValue({ ok: true, userId: 'u_1' })
  })

  it('passes through auth failure', async () => {
    state.requireAuth.mockResolvedValue({ ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) })
    const req = new NextRequest('https://startingmonday.app/api/team/invite', { method: 'POST', body: '{}' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('rejects empty invite payload', async () => {
    const req = new NextRequest('https://startingmonday.app/api/team/invite', { method: 'POST', body: '{}' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid emails', async () => {
    const req = new NextRequest('https://startingmonday.app/api/team/invite', {
      method: 'POST',
      body: JSON.stringify({ emails: ['good@example.com', 'bad-email'] }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: expect.stringContaining('Invalid email') })
  })
})
