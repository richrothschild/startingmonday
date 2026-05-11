type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function checkRateLimit(
  userId: string,
  maxPerMinute = 20
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const existing = buckets.get(userId)

  if (!existing || existing.resetAt < now) {
    buckets.set(userId, { count: 1, resetAt: now + 60_000 })
    return { allowed: true }
  }

  if (existing.count >= maxPerMinute) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count++
  return { allowed: true }
}
