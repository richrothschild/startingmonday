import { afterEach, describe, expect, it, vi } from 'vitest'
import { __resetRateLimitBucketsForTests, checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  afterEach(() => {
    vi.useRealTimers()
    __resetRateLimitBucketsForTests()
  })

  it('allows requests until the limit and then blocks with retryAfter', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T00:00:00.000Z'))

    await expect(checkRateLimit('user-1', 2, 60_000)).resolves.toEqual({ allowed: true })
    await expect(checkRateLimit('user-1', 2, 60_000)).resolves.toEqual({ allowed: true })

    const blocked = await checkRateLimit('user-1', 2, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBe(60)
  })

  it('resets the bucket after the window elapses', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T00:00:00.000Z'))

    await expect(checkRateLimit('user-2', 1, 60_000)).resolves.toEqual({ allowed: true })
    await expect(checkRateLimit('user-2', 1, 60_000)).resolves.toMatchObject({ allowed: false })

    vi.advanceTimersByTime(60_001)

    await expect(checkRateLimit('user-2', 1, 60_000)).resolves.toEqual({ allowed: true })
  })

  it('keeps buckets isolated per key', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T00:00:00.000Z'))

    await expect(checkRateLimit('user-a', 1, 60_000)).resolves.toEqual({ allowed: true })
    await expect(checkRateLimit('user-b', 1, 60_000)).resolves.toEqual({ allowed: true })

    await expect(checkRateLimit('user-a', 1, 60_000)).resolves.toMatchObject({ allowed: false })
    await expect(checkRateLimit('user-b', 1, 60_000)).resolves.toMatchObject({ allowed: false })
  })
})
