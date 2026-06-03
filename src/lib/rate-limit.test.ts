import { afterEach, describe, expect, it, vi } from 'vitest'
import { __resetRateLimitBucketsForTests, checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  afterEach(() => {
    vi.useRealTimers()
    __resetRateLimitBucketsForTests()
  })

  it('allows requests until the limit and then blocks with retryAfter', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T00:00:00.000Z'))

    expect(checkRateLimit('user-1', 2, 60_000)).toEqual({ allowed: true })
    expect(checkRateLimit('user-1', 2, 60_000)).toEqual({ allowed: true })

    const blocked = checkRateLimit('user-1', 2, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBe(60)
  })

  it('resets the bucket after the window elapses', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T00:00:00.000Z'))

    expect(checkRateLimit('user-2', 1, 60_000)).toEqual({ allowed: true })
    expect(checkRateLimit('user-2', 1, 60_000).allowed).toBe(false)

    vi.advanceTimersByTime(60_001)

    expect(checkRateLimit('user-2', 1, 60_000)).toEqual({ allowed: true })
  })

  it('keeps buckets isolated per key', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T00:00:00.000Z'))

    expect(checkRateLimit('user-a', 1, 60_000)).toEqual({ allowed: true })
    expect(checkRateLimit('user-b', 1, 60_000)).toEqual({ allowed: true })

    expect(checkRateLimit('user-a', 1, 60_000).allowed).toBe(false)
    expect(checkRateLimit('user-b', 1, 60_000).allowed).toBe(false)
  })
})
