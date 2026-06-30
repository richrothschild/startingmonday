import * as Sentry from '@sentry/nextjs'

function eventContainsBlockedHostNoise(event: Sentry.Event): boolean {
  const message = (event.message ?? '').toLowerCase()
  const exceptionMessages = (event.exception?.values ?? [])
    .map((value) => `${value.type ?? ''} ${value.value ?? ''}`.toLowerCase())
  const combined = [message, ...exceptionMessages].join(' ')

  return (
    combined.includes('blocked-host')
    && combined.includes('frontend-cdn.perplexity.ai')
  ) || (
    combined.includes('font-src')
    && combined.includes('perplexity.ai')
  )
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'production',
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  // Only run in production; keeps local dev noise-free
  enabled: process.env.NODE_ENV === 'production',
  beforeSend(event) {
    if (eventContainsBlockedHostNoise(event)) {
      return null
    }
    return event
  },
})
