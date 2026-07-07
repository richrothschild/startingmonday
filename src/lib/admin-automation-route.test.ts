import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/admin-automation-auth', () => ({
  requireStaffAutomationAccess: vi.fn(),
}))

import { requireStaffAutomationAccess } from '@/lib/admin-automation-auth'
import {
  asLooseSupabaseClient,
  parseAutomationBody,
  requireAutomationAccess,
} from './admin-automation-route'

const mockRequireStaffAutomationAccess = vi.mocked(requireStaffAutomationAccess)

describe('admin-automation-route helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes through automation auth failures', async () => {
    mockRequireStaffAutomationAccess.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'forbidden' }, { status: 403 }),
    })

    const request = new NextRequest('https://startingmonday.app/api/admin/automation/test')
    const result = await requireAutomationAccess(request)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(403)
    }
  })

  it('returns normalized auth context on success', async () => {
    const supabase = { from: vi.fn() }
    mockRequireStaffAutomationAccess.mockResolvedValue({ ok: true, userId: 'u1', userEmail: 'u1@example.com', supabase: supabase as never })

    const request = new NextRequest('https://startingmonday.app/api/admin/automation/test')
    const result = await requireAutomationAccess(request)

    expect(result).toEqual({ ok: true, userId: 'u1', supabase })
  })

  it('validates JSON request body against provided schema', async () => {
    const schema = z.object({ runId: z.string().min(1) })
    const good = new NextRequest('https://startingmonday.app/api/admin/automation/test', {
      method: 'POST',
      body: JSON.stringify({ runId: 'abc-123' }),
      headers: { 'content-type': 'application/json' },
    })

    const goodParsed = await parseAutomationBody(good, schema)
    expect(goodParsed).toEqual({ ok: true, body: { runId: 'abc-123' } })

    const bad = new NextRequest('https://startingmonday.app/api/admin/automation/test', {
      method: 'POST',
      body: JSON.stringify({ runId: '' }),
      headers: { 'content-type': 'application/json' },
    })

    const badParsed = await parseAutomationBody(bad, schema)
    expect(badParsed.ok).toBe(false)
    if (!badParsed.ok) {
      expect(badParsed.response.status).toBe(400)
      await expect(badParsed.response.json()).resolves.toMatchObject({
        error: 'Invalid request body',
      })
    }
  })

  it('casts auth supabase client to a loose query facade', () => {
    const authSupabase = { from: vi.fn() }
    const loose = asLooseSupabaseClient(authSupabase as never)
    expect(loose.from).toBe(authSupabase.from)
  })
})
