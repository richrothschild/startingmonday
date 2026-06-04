// In-memory sliding-window burst limiter for AI routes.
// Prevents rapid-fire requests within a single minute.
// Single-instance only. Swap for Upstash Redis when running multiple Railway replicas.

const WINDOW_MS = 60_000
const BURST_LIMIT = 10

const windows = new Map<string, { count: number; resetAt: number }>()

function checkBurstLimitInMemory(key: string): boolean {
  const now = Date.now()
  const entry = windows.get(key)

  if (!entry || now > entry.resetAt) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= BURST_LIMIT) return false
  entry.count++
  return true
}

export async function checkBurstLimit(key: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey || process.env.RATE_LIMIT_FORCE_MEMORY === '1') {
    return checkBurstLimitInMemory(key)
  }

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const windowStart = Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS
    const periodKey = `${WINDOW_MS}:${new Date(windowStart).toISOString()}`
    const { data, error } = await admin.rpc('check_and_increment_rate_limit', {
      p_key: `burst:${key}`,
      p_window: periodKey,
      p_limit: BURST_LIMIT,
    })

    if (error || typeof data !== 'boolean') {
      return checkBurstLimitInMemory(key)
    }

    return data
  } catch {
    return checkBurstLimitInMemory(key)
  }
}
