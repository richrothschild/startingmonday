import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

describe('api health route', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://supabase.example.com')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('RESEND_API_KEY', 'resend-key')
    vi.stubEnv('CRON_SECRET', 'cron-secret')
    vi.stubEnv('OWNER_EMAIL', 'owner@example.com')
    vi.stubEnv('npm_package_version', '1.2.3')
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-01-01T00:00:00.000Z')
  })

  it('returns ok when required env vars are present', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')

    const payload = await response.json()
    expect(payload).toMatchObject({
      kind: 'liveness',
      status: 'ok',
      live: true,
      version: '1.2.3',
      missing: [],
      checks: {
        NEXT_PUBLIC_SUPABASE_URL: true,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
        RESEND_API_KEY: true,
        CRON_SECRET: true,
        OWNER_OR_NOTIFY_EMAIL: true,
      },
    })
    expect(payload.timestamp).toBe('2026-01-01T00:00:00.000Z')
  })

  it('reports degraded when required env vars are missing', async () => {
    vi.unstubAllEnvs()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://supabase.example.com')

    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.status).toBe('degraded')
    expect(payload.missing).toEqual([
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'RESEND_API_KEY',
      'CRON_SECRET',
      'OWNER_OR_NOTIFY_EMAIL',
    ])
  })
})
