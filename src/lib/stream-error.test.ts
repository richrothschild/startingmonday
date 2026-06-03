import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { streamErrorMessage } from './stream-error'

describe('streamErrorMessage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the __ERROR__ sentinel prefix with the error message', () => {
    const result = streamErrorMessage(new Error('something went wrong'))
    expect(result).toBe('__ERROR__something went wrong')
  })

  it('handles non-Error thrown values', () => {
    const result = streamErrorMessage('plain string error')
    expect(result).toBe('__ERROR__Unknown error')
  })

  it('calls console.error with a JSON line including event=stream_error', () => {
    streamErrorMessage(new Error('fail'), { feature: 'chat', userId: 'u-1' })
    expect(console.error).toHaveBeenCalledOnce()
    const arg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    const parsed = JSON.parse(arg)
    expect(parsed.event).toBe('stream_error')
    expect(parsed.feature).toBe('chat')
    expect(parsed.user_id).toBe('u-1')
    expect(parsed.error).toBe('fail')
    expect(typeof parsed.ts).toBe('string')
  })

  it('defaults feature to "unknown" and user_id to null when context is omitted', () => {
    streamErrorMessage(new Error('x'))
    const arg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    const parsed = JSON.parse(arg)
    expect(parsed.feature).toBe('unknown')
    expect(parsed.user_id).toBeNull()
  })
})
