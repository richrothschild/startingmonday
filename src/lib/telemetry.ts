/**
 * Route-level telemetry for API handlers (R1.1).
 *
 * Wraps a Next.js App Router route handler to emit structured JSON log lines
 * that include: route tier, HTTP method, path, status code, latency_ms,
 * correlation_id (from X-Request-Id header), and deploy_sha.
 *
 * Usage:
 *   export const POST = withApiTelemetry('/api/feedback/items', handler)
 *   export const GET  = withApiTelemetry('/api/contacts', handler)
 */

import { type NextRequest, NextResponse } from 'next/server'

// Set once per cold start from Railway / CI environment.
const DEPLOY_SHA = process.env.RAILWAY_GIT_COMMIT_SHA
  ?? process.env.VERCEL_GIT_COMMIT_SHA
  ?? process.env.GIT_COMMIT_SHA
  ?? 'unknown'

type Tier = 'P0' | 'P1' | 'P2'

/**
 * Mirrors the tier assignment in docs/sre/slo-catalog.md (API section).
 * First-match wins, same precedence order as the catalog.
 */
function classifyTier(path: string): Tier {
  // P0 routes
  const p0Prefixes = [
    '/api/auth/',
    '/api/feedback/',
    '/api/contacts',
    '/api/follow-ups',
    '/api/optimize',
    '/api/billing/',
    '/api/webhooks/stripe',
    '/api/briefing',
    '/api/outreach',
  ]
  for (const prefix of p0Prefixes) {
    if (path.startsWith(prefix)) return 'P0'
  }

  // P1 routes
  const p1Prefixes = [
    '/api/intelligence/',
    '/api/companies',
    '/api/settings',
    '/api/prep',
  ]
  for (const prefix of p1Prefixes) {
    if (path.startsWith(prefix)) return 'P1'
  }

  return 'P2'
}

type RouteHandler = (req: NextRequest, ctx: unknown) => Promise<NextResponse> | NextResponse

/**
 * Wraps an App Router route handler with structured telemetry logging.
 *
 * The emitted log line looks like:
 * {
 *   "ts":"2026-05-18T12:34:56.789Z",
 *   "event":"api_request",
 *   "method":"POST",
 *   "path":"/api/feedback/items",
 *   "tier":"P0",
 *   "status":201,
 *   "latency_ms":142,
 *   "correlation_id":"req_abc123",
 *   "deploy_sha":"a1b2c3d",
 *   "user_scope":"authenticated"
 * }
 */
export function withApiTelemetry(path: string, handler: RouteHandler): RouteHandler {
  const tier = classifyTier(path)

  return async function telemetryHandler(req: NextRequest, ctx: unknown): Promise<NextResponse> {
    const start = Date.now()
    const correlationId = req.headers.get('x-request-id') ?? 'unset'
    const method = req.method

    let response: NextResponse
    let status = 500

    try {
      response = await handler(req, ctx)
      status = response.status
    } catch (err) {
      console.error(JSON.stringify({
        ts: new Date().toISOString(),
        event: 'api_request_error',
        method,
        path,
        tier,
        latency_ms: Date.now() - start,
        correlation_id: correlationId,
        deploy_sha: DEPLOY_SHA,
        error: err instanceof Error ? err.message : String(err),
      }))
      throw err
    }

    const latencyMs = Date.now() - start
    const userScope = req.cookies.get('sb-access-token') ? 'authenticated' : 'public'

    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      event: 'api_request',
      method,
      path,
      tier,
      status,
      latency_ms: latencyMs,
      correlation_id: correlationId,
      deploy_sha: DEPLOY_SHA,
      user_scope: userScope,
    }))

    return response
  }
}
