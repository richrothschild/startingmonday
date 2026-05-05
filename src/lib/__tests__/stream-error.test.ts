import { describe, it, expect } from 'vitest'
import { streamErrorMessage } from '@/lib/stream-error'

describe('streamErrorMessage', () => {
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
