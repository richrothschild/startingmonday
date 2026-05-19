import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'production',
  // Sample P0 routes at 10%, P1 at 2%, everything else at 0.
  // Keeps trace volume low while ensuring P0 coverage for SLO latency signals.
  tracesSampler(samplingContext) {
    const url: string = (samplingContext.request as { url?: string } | undefined)?.url ?? ''
    if (
      url.includes('/api/auth/') ||
      url.includes('/api/feedback/') ||
      url.includes('/api/contacts') ||
      url.includes('/api/follow-ups') ||
      url.includes('/api/optimize') ||
      url.includes('/api/billing/') ||
      url.includes('/api/webhooks/stripe') ||
      url.includes('/api/briefing') ||
      url.includes('/api/outreach')
    ) {
      return 0.1  // P0: 10%
    }
    if (
      url.includes('/api/intelligence/') ||
      url.includes('/api/companies') ||
      url.includes('/api/settings') ||
      url.includes('/api/prep')
    ) {
      return 0.02  // P1: 2%
    }
    return 0  // P2: no traces
  },
  enabled: process.env.NODE_ENV === 'production',
})
