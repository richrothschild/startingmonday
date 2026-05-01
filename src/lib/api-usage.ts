import { type SupabaseClient } from '@supabase/supabase-js'

const USER_DAILY_TOKEN_LIMIT = parseInt(process.env.USER_DAILY_TOKEN_LIMIT ?? '100000')

function dayKey() {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

function monthKey() {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

// Returns true if the user has exceeded their daily token budget.
export async function isRateLimited(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('api_usage')
    .select('token_count')
    .eq('user_id', userId)
    .eq('service', 'anthropic')
    .eq('month_key', monthKey())
    .maybeSingle()

  // Use monthly total against daily limit * 30 as a simple rolling check.
  // A proper per-day check would require a day_key column; monthly is sufficient for now.
  const used = data?.token_count ?? 0
  return used >= USER_DAILY_TOKEN_LIMIT * 30
}

// Atomically increment usage via the RPC created in migration 004.
export async function trackApiUsage(
  supabase: SupabaseClient,
  userId: string,
  tokens: number
): Promise<void> {
  await supabase.rpc('increment_api_usage', {
    p_user_id:   userId,
    p_service:   'anthropic',
    p_month_key: monthKey(),
    p_requests:  1,
    p_tokens:    tokens,
  })
}

// Trim message history to avoid context overflow.
// Keeps the most recent messages whose combined char length stays under maxChars.
// Always retains at least the last 2 messages (one exchange).
export function trimMessages<T extends { content: string }>(
  messages: T[],
  maxChars = 80_000
): T[] {
  if (!messages.length) return messages
  let total = 0
  const result: T[] = []
  for (let i = messages.length - 1; i >= 0; i--) {
    total += messages[i].content.length
    if (total > maxChars && result.length >= 2) break
    result.unshift(messages[i])
  }
  return result
}
