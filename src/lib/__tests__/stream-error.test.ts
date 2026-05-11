import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { streamErrorMessage } from '@/lib/stream-error'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('streamErrorMessage - sentinel format', () => {
  it('prefixes Error message with __ERROR__', () => {
    expect(streamErrorMessage(new Error('Anthropic rate limit exceeded')))
      .toBe('__ERROR__Anthropic rate limit exceeded')
  })

  it('uses fallback for non-Error thrown values', () => {
    expect(streamErrorMessage('some string')).toBe('__ERROR__Unknown error')
    expect(streamErrorMessage(42)).toBe('__ERROR__Unknown error')
    expect(streamErrorMessage(null)).toBe('__ERROR__Unknown error')
    expect(streamErrorMessage(undefined)).toBe('__ERROR__Unknown error')
    expect(streamErrorMessage({ code: 500 })).toBe('__ERROR__Unknown error')
  })

  it('handles empty error message', () => {
    expect(streamErrorMessage(new Error(''))).toBe('__ERROR__')
  })

  it('preserves full error message including special characters', () => {
    const msg = 'API error: 529 {"type":"overloaded_error"}'
    expect(streamErrorMessage(new Error(msg))).toBe(`__ERROR__${msg}`)
  })
})

describe('streamErrorMessage - structured logging', () => {
  it('always calls console.error', () => {
    streamErrorMessage(new Error('test'))
    expect(console.error).toHaveBeenCalledOnce()
  })

  it('logs valid JSON to console.error', () => {
    streamErrorMessage(new Error('boom'))
    const [rawArg] = vi.mocked(console.error).mock.calls[0]
    expect(() => JSON.parse(rawArg as string)).not.toThrow()
  })

  it('includes ts, event, feature, user_id, error fields', () => {
    streamErrorMessage(new Error('bad'), { feature: 'chat', userId: 'u-123' })
    const logged = JSON.parse(vi.mocked(console.error).mock.calls[0][0] as string)
    expect(logged.event).toBe('stream_error')
    expect(logged.feature).toBe('chat')
    expect(logged.user_id).toBe('u-123')
    expect(logged.error).toBe('bad')
    expect(typeof logged.ts).toBe('string')
  })

  it('defaults feature to "unknown" and user_id to null when no context', () => {
    streamErrorMessage(new Error('no context'))
    const logged = JSON.parse(vi.mocked(console.error).mock.calls[0][0] as string)
    expect(logged.feature).toBe('unknown')
    expect(logged.user_id).toBeNull()
  })

  it('uses partial context when only feature is provided', () => {
    streamErrorMessage(new Error('partial'), { feature: 'strategy_brief' })
    const logged = JSON.parse(vi.mocked(console.error).mock.calls[0][0] as string)
    expect(logged.feature).toBe('strategy_brief')
    expect(logged.user_id).toBeNull()
  })
})
