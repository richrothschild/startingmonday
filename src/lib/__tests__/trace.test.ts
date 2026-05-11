import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { recordTrace, recordTraceError } from '@/lib/trace'
import type { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

function makeFakeSupabase() {
  const mockThen = vi.fn()
  const mockInsert = vi.fn().mockReturnValue({ then: mockThen })
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert })
  return { supabase: { from: mockFrom } as unknown as Supabase, mockFrom, mockInsert, mockThen }
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('recordTraceError', () => {
  it('calls console.error with valid JSON', () => {
    recordTraceError({ feature: 'chat', userId: 'u-1', model: 'claude-sonnet-4-6', latencyMs: 1200, error: 'timeout' })
    expect(console.error).toHaveBeenCalledOnce()
    const [rawArg] = vi.mocked(console.error).mock.calls[0]
    expect(() => JSON.parse(rawArg as string)).not.toThrow()
  })

  it('includes all required fields with success: false', () => {
    recordTraceError({ feature: 'prep_brief', userId: 'u-2', model: 'claude-sonnet-4-6', latencyMs: 500, error: 'rate limit' })
    const logged = JSON.parse(vi.mocked(console.error).mock.calls[0][0] as string)
    expect(logged.event).toBe('ai_call_error')
    expect(logged.feature).toBe('prep_brief')
    expect(logged.user_id).toBe('u-2')
    expect(logged.model).toBe('claude-sonnet-4-6')
    expect(logged.latency_ms).toBe(500)
    expect(logged.error).toBe('rate limit')
    expect(logged.success).toBe(false)
    expect(typeof logged.ts).toBe('string')
  })

  it('omits model and latency_ms as null when not provided', () => {
    recordTraceError({ feature: 'outreach_draft', userId: 'u-3', error: 'network error' })
    const logged = JSON.parse(vi.mocked(console.error).mock.calls[0][0] as string)
    expect(logged.model).toBeNull()
    expect(logged.latency_ms).toBeNull()
  })
})

describe('recordTrace', () => {
  it('emits structured JSON to console.log', () => {
    const { supabase } = makeFakeSupabase()
    recordTrace({
      supabase, userId: 'u-1', feature: 'chat', model: 'claude-sonnet-4-6',
      promptTokens: 100, completionTokens: 200, latencyMs: 800,
    })
    expect(console.log).toHaveBeenCalledOnce()
    const [rawArg] = vi.mocked(console.log).mock.calls[0]
    expect(() => JSON.parse(rawArg as string)).not.toThrow()
  })

  it('log includes required fields with success: true', () => {
    const { supabase } = makeFakeSupabase()
    recordTrace({
      supabase, userId: 'u-1', feature: 'chat', model: 'claude-sonnet-4-6',
      promptTokens: 100, completionTokens: 200, latencyMs: 800,
    })
    const logged = JSON.parse(vi.mocked(console.log).mock.calls[0][0] as string)
    expect(logged.event).toBe('ai_call')
    expect(logged.feature).toBe('chat')
    expect(logged.model).toBe('claude-sonnet-4-6')
    expect(logged.prompt_tokens).toBe(100)
    expect(logged.completion_tokens).toBe(200)
    expect(logged.total_tokens).toBe(300)
    expect(logged.latency_ms).toBe(800)
    expect(logged.user_id).toBe('u-1')
    expect(logged.success).toBe(true)
    expect(typeof logged.ts).toBe('string')
  })

  it('writes to llm_traces via supabase insert', () => {
    const { supabase, mockFrom, mockInsert } = makeFakeSupabase()
    recordTrace({
      supabase, userId: 'u-1', feature: 'chat', model: 'claude-sonnet-4-6',
      promptTokens: 50, completionTokens: 100, latencyMs: 400,
    })
    expect(mockFrom).toHaveBeenCalledWith('llm_traces')
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'u-1',
      feature: 'chat',
      model: 'claude-sonnet-4-6',
      prompt_tokens: 50,
      completion_tokens: 100,
      latency_ms: 400,
    }))
  })

  it('stores outputSnapshot truncated to 2000 chars', () => {
    const { supabase, mockInsert } = makeFakeSupabase()
    const longOutput = 'x'.repeat(3000)
    recordTrace({
      supabase, userId: 'u-1', feature: 'chat', model: 'claude-sonnet-4-6',
      promptTokens: 10, completionTokens: 10, latencyMs: 100,
      outputSnapshot: longOutput,
    })
    const insertArg = mockInsert.mock.calls[0][0]
    expect(insertArg.output_snapshot).toHaveLength(2000)
  })

  it('stores null output_snapshot when not provided', () => {
    const { supabase, mockInsert } = makeFakeSupabase()
    recordTrace({
      supabase, userId: 'u-1', feature: 'discover', model: 'claude-sonnet-4-6',
      promptTokens: 10, completionTokens: 10, latencyMs: 100,
    })
    expect(mockInsert.mock.calls[0][0].output_snapshot).toBeNull()
  })
})
