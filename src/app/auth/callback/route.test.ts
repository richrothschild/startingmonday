import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const state = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  cookieSet: vi.fn(),
  partnerMaybeSingle: vi.fn(),
  adminUpsert: vi.fn(),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      exchangeCodeForSession: state.exchangeCodeForSession,
      verifyOtp: state.verifyOtp,
    },
    from: () => ({
      upsert: state.upsert,
      update: state.update,
    }),
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'partners') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: state.partnerMaybeSingle,
              }),
            }),
          }),
        }
      }
      if (table === 'referral_attributions') {
        return {
          upsert: state.adminUpsert,
        }
      }
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null }),
            }),
          }),
        }),
        upsert: async () => ({ error: null }),
      }
    },
  }),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    getAll: () => [],
    set: state.cookieSet,
  }),
}))

import { GET } from './route'

describe('auth callback route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    state.upsert.mockResolvedValue({ error: null })
    state.update.mockReturnValue({ eq: state.eq })
    state.eq.mockResolvedValue({ error: null })
    state.partnerMaybeSingle.mockResolvedValue({ data: null })
    state.adminUpsert.mockResolvedValue({ error: null })
    state.exchangeCodeForSession.mockResolvedValue({
      data: {
        session: { access_token: 'token' },
        user: {
          id: 'user_1',
          email: 'user@example.com',
          // Keep this old to avoid "new user" side-effects in the route.
          created_at: '2026-01-01T00:00:00.000Z',
          user_metadata: {},
        },
      },
      error: null,
    })
    state.verifyOtp.mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  it('redirects to login with an error when callback has no auth params', async () => {
    const req = new NextRequest('https://startingmonday.app/auth/callback?next=/dashboard')
    const res = await GET(req)
    const html = await res.text()

    expect(res.status).toBe(200)
    expect(html).toContain('location.replace("/login?error=oauth&next=%2Fdashboard")')
  })

  it('uses a path-only redirect after successful OAuth exchange to prevent loop-prone history behavior', async () => {
    const req = new NextRequest('https://startingmonday.app/auth/callback?code=oauth-code&next=/dashboard/briefing', {
      headers: {
        'x-forwarded-host': 'startingmonday.app',
        'x-forwarded-proto': 'https',
      },
    })

    const res = await GET(req)
    const html = await res.text()

    expect(res.status).toBe(200)
    expect(state.exchangeCodeForSession).toHaveBeenCalledWith('oauth-code')
    expect(html).toContain('location.replace("/dashboard/briefing")')
    expect(html).not.toContain('https://startingmonday.app/dashboard/briefing')
  })

  it('sanitizes unsafe next destinations and falls back to the briefing route', async () => {
    const req = new NextRequest('https://startingmonday.app/auth/callback?code=oauth-code&next=https://evil.example')
    const res = await GET(req)
    const html = await res.text()

    expect(res.status).toBe(200)
    expect(html).toContain('location.replace("/dashboard/briefing")')
  })

  it('writes referral attribution for new OAuth users with a valid referral code', async () => {
    state.exchangeCodeForSession.mockResolvedValueOnce({
      data: {
        session: { access_token: 'token' },
        user: {
          id: 'user_1',
          email: 'user@example.com',
          created_at: new Date().toISOString(),
          user_metadata: {},
        },
      },
      error: null,
    })
    state.partnerMaybeSingle.mockResolvedValueOnce({ data: { id: 'partner_1' } })

    const req = new NextRequest('https://startingmonday.app/auth/callback?code=oauth-code&next=/dashboard/briefing&ref_code=coach123&referrer_name=Jordan%20Patel&referrer_company=Coach%20One%20LLC')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(state.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user_1',
        referred_by: 'coach123',
        referred_by_name: 'Jordan Patel',
        referred_by_company: 'Coach One LLC',
      }),
      expect.any(Object)
    )
    expect(state.adminUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ signup_user_id: 'user_1', partner_id: 'partner_1' }),
      expect.any(Object)
    )
  })
})
