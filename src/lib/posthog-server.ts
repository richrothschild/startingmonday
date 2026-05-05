import { PostHog } from 'posthog-node'

let _client: PostHog | null = null

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return null
  if (!_client) {
    _client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
  }
  return _client
}

export function captureServerEvent(
  userId: string,
  event: string,
  properties: Record<string, string | number | boolean | null> = {}
): void {
  try {
    const ph = getClient()
    ph?.capture({ distinctId: userId, event, properties })
  } catch {
    // never throw - analytics must not interrupt product flows
  }
}
