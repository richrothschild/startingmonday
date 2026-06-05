import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { recordTraceError } from './trace'

describe('recordTraceError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls console.error with a JSON line including event=ai_call_error', () => {
    recordTraceError({ feature: 'discovery', userId: 'u-2', error: 'API timeout' })
    expect(console.error).toHaveBeenCalledOnce()
    const arg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    const parsed = JSON.parse(arg)
    expect(parsed.event).toBe('ai_call_error')
    expect(parsed.feature).toBe('discovery')
    expect(parsed.user_id).toBe('u-2')
    expect(parsed.success).toBe(false)
    expect(parsed.error).toBe('API timeout')
    expect(typeof parsed.ts).toBe('string')
  })

  it('includes model and latency_ms when provided', () => {
    recordTraceError({ feature: 'chat', userId: 'u-3', model: 'claude-3-5-sonnet', latencyMs: 1234, error: 'fail' })
    const arg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    const parsed = JSON.parse(arg)
    expect(parsed.model).toBe('claude-3-5-sonnet')
    expect(parsed.latency_ms).toBe(1234)
  })

  it('defaults model and latency_ms to null when omitted', () => {
    recordTraceError({ feature: 'suggestions', userId: 'u-4', error: 'err' })
    const arg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    const parsed = JSON.parse(arg)
    expect(parsed.model).toBeNull()
    expect(parsed.latency_ms).toBeNull()
  })
})
