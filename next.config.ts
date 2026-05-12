import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs'

const CSP = [
  "default-src 'self'",
  // Next.js App Router requires unsafe-inline for hydration scripts.
  // unsafe-eval is required by some Next.js internals and Sentry.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  // External services the browser connects to at runtime
  "connect-src 'self' *.supabase.co wss://*.supabase.co https://api.stripe.com https://us.i.posthog.com https://*.sentry.io https://*.ingest.sentry.io",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'Strict-Transport-Security',  value: 'max-age=31536000; includeSubDomains' },
  { key: 'Content-Security-Policy',    value: CSP },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.startingmonday.app' }],
        destination: 'https://startingmonday.app/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
  // Source map upload requires SENTRY_AUTH_TOKEN — omitting it skips upload gracefully.
  // Set SENTRY_AUTH_TOKEN in Railway to enable source-mapped stack traces.
  widenClientFileUpload: true,
});
