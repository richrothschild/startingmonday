import { describe, expect, it } from 'vitest'
import { postSearchDigestFrequency, resolveCareerMode } from '@/lib/career-mode'

describe('career mode resolver', () => {
  it('uses post-search mode when placement exists', () => {
    expect(resolveCareerMode({ placedAt: '2026-05-31T00:00:00.000Z', searchStatus: 'active' })).toBe('post_search')
  })

  it('uses post-search mode for complete or paused status even without placed_at', () => {
    expect(resolveCareerMode({ searchStatus: 'complete' })).toBe('post_search')
    expect(resolveCareerMode({ searchStatus: 'paused' })).toBe('post_search')
  })

  it('defaults to active search mode for all other states', () => {
    expect(resolveCareerMode({ searchStatus: 'active' })).toBe('active_search')
    expect(resolveCareerMode({ searchStatus: null, placedAt: null })).toBe('active_search')
  })
})

describe('post-search digest frequency', () => {
  it('defaults to weekly and only returns daily when explicitly set', () => {
    expect(postSearchDigestFrequency({ briefingFrequency: undefined })).toBe('weekly')
    expect(postSearchDigestFrequency({ briefingFrequency: 'weekly' })).toBe('weekly')
    expect(postSearchDigestFrequency({ briefingFrequency: 'daily' })).toBe('daily')
  })
})