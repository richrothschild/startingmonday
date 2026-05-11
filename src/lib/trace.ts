import type { createClient } from '@/lib/supabase/server'

type Supabase = Awaited<ReturnType<typeof createClient>>

type TraceParams = {
  supabase: Supabase
  userId: string
  feature: string
  model: string
  promptTokens: number
  completionTokens: number
  latencyMs: number
  inputSnapshot?: Record<string, unknown>
  outputSnapshot?: string
}

export function recordTrace(params: TraceParams): void {
  const { supabase, userId, feature, model, promptTokens, completionTokens, latencyMs, inputSnapshot, outputSnapshot } = params
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    event: 'ai_call',
    feature,
    model,
    latency_ms: latencyMs,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: promptTokens + completionTokens,
    user_id: userId,
    success: true,
  }))
  supabase.from('llm_traces').insert({
    user_id: userId,
    feature,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    latency_ms: latencyMs,
    input_snapshot: inputSnapshot ?? null,
    output_snapshot: outputSnapshot ? outputSnapshot.slice(0, 2000) : null,
  }).then(
    () => {},
    (err) => console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'trace_write_error', feature, error: String(err) }))
  )
}
