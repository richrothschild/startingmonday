// In-memory sliding-window burst limiter for AI routes.
// Prevents rapid-fire requests within a single minute.
// Single-instance only. Swap for Upstash Redis when running multiple Railway replicas.

const WINDOW_MS = 60_000
const BURST_LIMIT = 10

const windows = new Map<string, { count: number; resetAt: number }>()

export function checkBurstLimit(userId: string): boolean {
  const now = Date.now()
  const entry = windows.get(userId)

  if (!entry || now > entry.resetAt) {
    windows.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= BURST_LIMIT) return false
  entry.count++
  return true
}
