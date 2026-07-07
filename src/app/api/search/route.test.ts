import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const state = vi.hoisted(() => ({
  getUser: vi.fn(),
  companySelect: vi.fn(),
  companyEq: vi.fn(),
  companyIs: vi.fn(),
  companyIlike: vi.fn(),
  companyLimit: vi.fn(),
  contactSelect: vi.fn(),
  contactEq: vi.fn(),
  contactIlike: vi.fn(),
  contactLimit: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: state.getUser },
    from(table: string) {
      if (table === 'companies') {
        return {
          select: state.companySelect,
        }
      }
      if (table === 'contacts') {
        return {
          select: state.contactSelect,
        }
      }
      return {}
    },
  })),
}))

import { GET } from './route'

describe('search route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    state.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    state.companySelect.mockReturnValue({
      eq: state.companyEq,
    })
    state.companyEq.mockReturnValue({
      is: state.companyIs,
    })
    state.companyIs.mockReturnValue({
      ilike: state.companyIlike,
    })
    state.companyIlike.mockReturnValue({
      limit: state.companyLimit,
    })
    state.companyLimit.mockResolvedValue({
      data: [{ id: 'company-1', name: 'Acme', stage: 'growth', sector: 'software' }],
      error: null,
    })

    state.contactSelect.mockReturnValue({
      eq: state.contactEq,
    })
    state.contactEq.mockReturnValue({
      ilike: state.contactIlike,
    })
    state.contactIlike.mockReturnValue({
      limit: state.contactLimit,
    })
    state.contactLimit.mockResolvedValue({
      data: [{ id: 'contact-1', name: 'Ada', title: 'VP Engineering', firm: 'Acme' }],
      error: null,
    })
  })

  it('returns empty results for short queries', async () => {
    const response = await GET(new NextRequest('https://startingmonday.app/api/search?q=a'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ companies: [], contacts: [] })
    expect(state.getUser).not.toHaveBeenCalled()
  })

  it('returns unauthorized when no user is present', async () => {
    state.getUser.mockResolvedValueOnce({ data: { user: null } })

    const response = await GET(new NextRequest('https://startingmonday.app/api/search?q=ac'))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('aggregates company and contact matches', async () => {
    const response = await GET(new NextRequest('https://startingmonday.app/api/search?q=ac'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      companies: [{ id: 'company-1', name: 'Acme', stage: 'growth', sector: 'software' }],
      contacts: [{ id: 'contact-1', name: 'Ada', title: 'VP Engineering', firm: 'Acme' }],
    })
    expect(state.companyEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(state.companyIs).toHaveBeenCalledWith('archived_at', null)
    expect(state.companyIlike).toHaveBeenCalledWith('name', '%ac%')
    expect(state.contactEq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(state.contactIlike).toHaveBeenCalledWith('name', '%ac%')
  })
})
