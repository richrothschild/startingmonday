import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import { canUserSeeAdminHeader, getStaffMember, hasAdminHeaderAccess } from './staff'

const mockCreateAdminClient = vi.mocked(createAdminClient)

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('staff access helpers', () => {
  it('grants admin header access only to owner/admin roles', () => {
    expect(hasAdminHeaderAccess({ role: 'owner' } as never)).toBe(true)
    expect(hasAdminHeaderAccess({ role: 'admin' } as never)).toBe(true)
    expect(hasAdminHeaderAccess({ role: 'viewer' } as never)).toBe(false)
    expect(hasAdminHeaderAccess(null)).toBe(false)
  })

  it('normalizes email lookup and returns stored staff member', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'staff-1',
        email: 'admin@example.com',
        role: 'admin',
        permissions: {},
        created_at: '2026-01-01T00:00:00.000Z',
        created_by: null,
      },
    })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })

    mockCreateAdminClient.mockReturnValue({ from } as never)

    const staff = await getStaffMember('  ADMIN@Example.com  ')

    expect(eq).toHaveBeenCalledWith('email', 'admin@example.com')
    expect(staff?.role).toBe('admin')
  })

  it('returns development fallback owner when no row exists in dev mode', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('DEV_AUTH_EMAIL', 'dev@example.com')

    const maybeSingle = vi.fn().mockResolvedValue({ data: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })
    mockCreateAdminClient.mockReturnValue({ from } as never)

    const staff = await getStaffMember('')

    expect(staff?.role).toBe('owner')
    expect(staff?.email).toBe('dev@example.com')
  })

  it('canUserSeeAdminHeader delegates to staff lookup and role check', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'staff-2',
        email: 'viewer@example.com',
        role: 'viewer',
        permissions: {},
        created_at: '2026-01-01T00:00:00.000Z',
        created_by: null,
      },
    })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })
    mockCreateAdminClient.mockReturnValue({ from } as never)

    await expect(canUserSeeAdminHeader('viewer@example.com')).resolves.toBe(false)
  })
})
