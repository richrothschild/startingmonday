import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const state = vi.hoisted(() => ({
  executiveBriefPost: vi.fn(),
  createClient: vi.fn(),
  getUser: vi.fn(),
  getStaffMember: vi.fn(),
  hasAdminHeaderAccess: vi.fn(),
}))

vi.mock('../executive-brief/route', () => ({
  POST: state.executiveBriefPost,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: state.createClient,
}))

vi.mock('@/lib/staff', () => ({
  getStaffMember: state.getStaffMember,
  hasAdminHeaderAccess: state.hasAdminHeaderAccess,
}))

import { POST } from './route'

describe('src/app/api/demo-brief/manager-tools/route.ts', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.getUser.mockResolvedValue({ data: { user: { email: 'admin@startingmonday.com' } } })
    state.createClient.mockResolvedValue({ auth: { getUser: state.getUser } })
    state.getStaffMember.mockResolvedValue({ role: 'admin' })
    state.hasAdminHeaderAccess.mockReturnValue(true)
    state.executiveBriefPost.mockResolvedValue(NextResponse.json({ ok: true, delegated: true }))
  })

  it('returns monitor mode without auth checks when monitor=1', async () => {
    const req = new NextRequest('https://startingmonday.app/api/demo-brief/manager-tools?monitor=1', { method: 'POST' })
    const res = await POST(req)

    expect(res.status).toBe(202)
    await expect(res.json()).resolves.toMatchObject({ ok: true, mode: 'monitor' })
    expect(state.createClient).not.toHaveBeenCalled()
    expect(state.executiveBriefPost).not.toHaveBeenCalled()
  })

  it('returns 401 when no authenticated user is present', async () => {
    state.getUser.mockResolvedValue({ data: { user: null } })

    const req = new NextRequest('https://startingmonday.app/api/demo-brief/manager-tools', { method: 'POST' })
    const res = await POST(req)

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toMatchObject({ error: 'Unauthorized' })
    expect(state.getStaffMember).not.toHaveBeenCalled()
    expect(state.executiveBriefPost).not.toHaveBeenCalled()
  })

  it('returns 403 when staff member does not have admin header access', async () => {
    state.hasAdminHeaderAccess.mockReturnValue(false)

    const req = new NextRequest('https://startingmonday.app/api/demo-brief/manager-tools', { method: 'POST' })
    const res = await POST(req)

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toMatchObject({ error: 'Forbidden' })
    expect(state.executiveBriefPost).not.toHaveBeenCalled()
  })

  it('delegates to executive-brief POST when authorized', async () => {
    const req = new NextRequest('https://startingmonday.app/api/demo-brief/manager-tools', { method: 'POST' })
    const res = await POST(req)

    expect(state.executiveBriefPost).toHaveBeenCalledTimes(1)
    expect(state.executiveBriefPost).toHaveBeenCalledWith(req)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, delegated: true })
  })
})
