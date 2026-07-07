import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ kind: 'server-client' })),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { createClient } from './server'

const mockCreateServerClient = vi.mocked(createServerClient)
const mockCookies = vi.mocked(cookies)
const mockHeaders = vi.mocked(headers)

describe('supabase server client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://supabase.example.com')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates server client using request cookie adapter in production mode', async () => {
    const cookieStore = {
      getAll: vi.fn(() => [{ name: 'sb-access-token', value: 'token', Path: '/' }]),
      set: vi.fn(),
    }
    mockCookies.mockResolvedValue(cookieStore as never)
    mockHeaders.mockResolvedValue(new Headers() as never)

    const client = await createClient()

    expect(client).toEqual({ kind: 'server-client' })
    expect(mockCreateServerClient).toHaveBeenCalledTimes(1)
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://supabase.example.com',
      'anon-key',
      expect.objectContaining({ cookies: expect.any(Object) }),
    )
  })

  it('passes through cookie read/write helpers to the Supabase adapter', async () => {
    const cookieStore = {
      getAll: vi.fn(() => [{ name: 'sb-refresh-token', value: 'refresh-token', Path: '/' }]),
      set: vi.fn(),
    }
    mockCookies.mockResolvedValue(cookieStore as never)
    mockHeaders.mockResolvedValue(new Headers() as never)

    await createClient()

    const options = mockCreateServerClient.mock.calls[0][2]
    expect(options.cookies.getAll()).toHaveLength(1)

    if (!options.cookies || !options.cookies.setAll) {
      throw new Error('Expected cookies adapter setAll to be defined')
    }

    options.cookies.setAll([{ name: 'sb-access-token', value: 'new-token', options: { path: '/' } }], {})
    expect(cookieStore.set).toHaveBeenCalledWith('sb-access-token', 'new-token', { path: '/' })
  })
})
