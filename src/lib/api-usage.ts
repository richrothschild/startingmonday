import { type SupabaseClient } from '@supabase/supabase-js'

const USER_MONTHLY_TOKEN_LIMIT   = parseInt(process.env.USER_MONTHLY_TOKEN_LIMIT   ?? '3000000')
const USER_MONTHLY_REQUEST_LIMIT = parseInt(process.env.USER_MONTHLY_REQUEST_LIMIT ?? '200')
const USER_DAILY_REQUEST_LIMIT   = parseInt(process.env.USER_DAILY_REQUEST_LIMIT   ?? '30')

function dayKey()   { return new Date().toISOString().slice(0, 10) } // 'YYYY-MM-DD'
function monthKey() { return new Date().toISOString().slice(0, 7)  } // 'YYYY-MM'

function userDayKey(userId: string) { return `user:${userId}` }

// Returns true if the user has hit their monthly token/request cap OR their
// daily request cap. The daily cap catches burst abuse (competitors stress-testing
// every feature in one session) without punishing normal multi-day usage.
export async function isRateLimited(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const [{ data: monthly }, { data: dailyCount }] = await Promise.all([
    supabase
      .from('api_usage')
      .select('token_count, request_count')
      .eq('user_id', userId)
      .eq('service', 'anthropic')
      .eq('month_key', monthKey())
      .maybeSingle(),
    supabase.rpc('get_rate_limit_count', {
      p_key:    userDayKey(userId),
      p_window: dayKey(),
    }),
  ])

  if ((monthly?.token_count   ?? 0) >= USER_MONTHLY_TOKEN_LIMIT)   return true
  if ((monthly?.request_count ?? 0) >= USER_MONTHLY_REQUEST_LIMIT) return true
  if ((dailyCount             ?? 0) >= USER_DAILY_REQUEST_LIMIT)   return true

  return false
}

// Called after a successful Claude API call.
// Increments monthly token + request counts AND the daily request counter
// used for burst detection. The daily entry in rate_limits can be queried
// to spot accounts hammering multiple endpoints in one session:
//
//   select key, window, count from public.rate_limits
//   where key like 'user:%' and window = current_date::text and count > 10
//   order by count desc;
export async function trackApiUsage(
  supabase: SupabaseClient,
  userId: string,
  tokens: number
): Promise<void> {
  await Promise.all([
    supabase.rpc('increment_api_usage', {
      p_user_id:   userId,
      p_service:   'anthropic',
      p_month_key: monthKey(),
      p_requests:  1,
      p_tokens:    tokens,
    }),
    supabase.rpc('check_and_increment_rate_limit', {
      p_key:    userDayKey(userId),
      p_window: dayKey(),
      p_limit:  999999, // no hard block here; isRateLimited enforces the cap
    }),
  ])
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
