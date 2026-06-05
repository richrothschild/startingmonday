type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

type RateLimitResult = { allowed: boolean; retryAfter?: number }

function checkRateLimitInMemory(
  key: string,
  maxPerWindow: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (existing.count >= maxPerWindow) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count++
  return { allowed: true }
}

export function __resetRateLimitBucketsForTests() {
  buckets.clear()
}

export async function checkRateLimit(
  key: string,
  maxPerWindow = 20,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey || process.env.RATE_LIMIT_FORCE_MEMORY === '1') {
    return checkRateLimitInMemory(key, maxPerWindow, windowMs)
  }

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs
    const periodKey = `${windowMs}:${new Date(windowStart).toISOString()}`
    const { data, error } = await admin.rpc('check_and_increment_rate_limit', {
      p_key: key,
      p_window: periodKey,
      p_limit: maxPerWindow,
    })

    if (error || typeof data !== 'boolean') {
      return checkRateLimitInMemory(key, maxPerWindow, windowMs)
    }

    if (data) {
      return { allowed: true }
    }

    const retryAfter = Math.ceil((windowStart + windowMs - Date.now()) / 1000)
    return { allowed: false, retryAfter: Math.max(1, retryAfter) }
  } catch {
    return checkRateLimitInMemory(key, maxPerWindow, windowMs)
  }
}
