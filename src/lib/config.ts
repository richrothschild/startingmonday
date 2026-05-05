// App-wide configuration derived from environment variables.
// Import from here rather than reading process.env directly in route handlers.

// Full https:// URL. Handles both "startingmonday.app" and "https://startingmonday.app" env formats.
export const APP_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
  return raw.startsWith('http') ? raw : `https://${raw}`
})()
