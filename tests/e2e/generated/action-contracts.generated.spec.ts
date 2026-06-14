import { test, expect } from '@playwright/test'

const actionTargets = [
  {
    "path": "/api/auth/login-submit",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/auth/oauth-start",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/auth/set-password",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "expectedStatuses": [
      410
    ],
    "note": "Endpoint is intentionally retired and returns 410 Gone",
    "path": "/api/auth/verify-and-magic-link",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/auth/verify-and-oauth",
    "methods": [
      "POST"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/auth/verify-and-signin",
    "methods": [
      "POST"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/auth/verify-and-signup",
    "methods": [
      "POST"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/billing/checkout",
    "methods": [
      "POST"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/billing/checkout/micro-product",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/billing/checkout/micro-product-bundle",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/billing/checkout/seats",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "expectedStatuses": [
      200,
      401,
      404
    ],
    "note": "Route may be deployed in some environments (200) or return auth/not-found depending on tenant rollout",
    "path": "/api/billing/pause",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/billing/portal",
    "methods": [
      "POST"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "expectedStatuses": [
      200,
      401,
      404
    ],
    "note": "Route may be deployed in some environments (200) or return auth/not-found depending on tenant rollout",
    "path": "/api/billing/resume",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "expectedStatuses": [
      410
    ],
    "note": "Endpoint is intentionally retired and returns 410 Gone",
    "path": "/api/briefing/send",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/briefs/download",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/briefs/save",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/chat",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/client/coach-access/[coachId]",
    "methods": [
      "GET",
      "PUT",
      "DELETE"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/client/coach-access/[coachId]/activity",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid DB-dependent failures in contract mode",
    "path": "/api/client/coaches",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/coach/client/[clientId]/actions",
    "methods": [
      "GET",
      "POST",
      "PATCH"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/coach/client/[clientId]/alerts",
    "methods": [
      "GET",
      "PUT"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/coach/client/[clientId]/briefs",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/coach/client/[clientId]/companies",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/coach/client/[clientId]/scorecards",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/coach/client/[clientId]/signals",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/coach/client/[clientId]/weekly-review",
    "methods": [
      "GET",
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/coach/clients",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/coach/command-center",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/companies",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/companies/quick-add",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/companies/reference/search",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/concierge-waitlist",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/concierge/calls",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/contacts",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/contacts/[id]",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/conversation",
    "methods": [
      "GET",
      "PUT",
      "DELETE"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/demo-brief",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid long-running streaming response in contract mode",
    "path": "/api/demo-brief/executive-brief",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid long-running streaming response in contract mode",
    "path": "/api/demo-brief/manager-tools",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/demo-brief/tailored",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/demo-email",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/deploy-marker",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid long-running AI and DB-dependent failures in contract mode",
    "path": "/api/discover",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/drip/unsubscribe",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/events/channel-funnel",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/events/daily-momentum",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/events/pmf",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/executive-brief/grill-me",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid DB-dependent failures in contract mode",
    "path": "/api/executive-brief/grill-me/sessions",
    "methods": [
      "GET",
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/executive-brief/grill-me/sessions/[id]/respond",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/executive-brief/transcription",
    "methods": [
      "GET",
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/executive-transition/emotion-state/score",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/feedback",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid DB-dependent failures in contract mode",
    "path": "/api/feedback/items",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/feedback/items/[id]/comments",
    "methods": [
      "GET",
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/feedback/items/[id]/status",
    "methods": [
      "GET",
      "PATCH"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/feedback/items/[id]/vote",
    "methods": [
      "POST",
      "DELETE"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/google-calendar/callback",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid OAuth-provider runtime dependency in contract mode",
    "path": "/api/google-calendar/connect",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid request-body-mode differences in contract mode",
    "path": "/api/google-calendar/disconnect",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/guide/chat",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/guide/chat/feedback",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/health",
    "methods": [
      "GET"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid DB-dependent failures in contract mode",
    "path": "/api/ideas",
    "methods": [
      "GET",
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/intelligence/companies",
    "methods": [
      "GET",
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/intelligence/radar",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/intelligence/token",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/invite",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/linkedin-import",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/linkedin-import/audit",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/linkedin-import/consent",
    "methods": [
      "POST",
      "DELETE"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/linkedin-import/extract",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/linkedin-import/match",
    "methods": [
      "GET",
      "POST",
      "PATCH"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/narrative/generate-linkedin",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/narrative/generate-positioning",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/notify/new-user",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/offer-synthesis",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/onboarding/events",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/onboarding/intel",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/optimize",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/outreach/current-status",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/outreach/draft",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/outreach/send",
    "methods": [
      "POST"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/outreach/send/batch-status",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/outreach/status",
    "methods": [
      "POST"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/outreach/suppression",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/outreach/template",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/partners",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/partners/attribute",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "expectedStatuses": [
      410
    ],
    "note": "Retired endpoint intentionally returns 410 Gone",
    "path": "/api/partners/report",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/pilot-outreach",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/positioning/chat",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/positioning/save",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/preferences/briefing",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/prep/[id]",
    "methods": [
      "GET",
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/background",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/challenges",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/chat",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/competitive",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/leadership",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/outreach",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/outreach/log",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/priorities",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/questions",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/tech-stack",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/why-here",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/prep/[id]/wins",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": true
  },
  {
    "path": "/api/profile/export",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/profile/upload-linkedin",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/profile/upload-resume",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/readiness",
    "methods": [
      "GET"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/salary-intelligence",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/search",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/signals/classify",
    "methods": [
      "POST"
    ],
    "tier": "tier0",
    "hasDynamicSegment": false
  },
  {
    "methodOverride": "OPTIONS",
    "expectedStatuses": [
      200,
      204,
      401,
      403,
      405
    ],
    "note": "Use preflight-style probe to avoid long-running streaming response in contract mode",
    "path": "/api/strategy",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/strategy/followup",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/suggestions",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/tailor",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/tailor/check",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/tailor/strengthen",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/team/invite",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/track/open",
    "methods": [
      "GET"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/webhooks/onboarding-video",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/webhooks/resend",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  },
  {
    "path": "/api/webhooks/stripe",
    "methods": [
      "POST"
    ],
    "tier": "tier1",
    "hasDynamicSegment": false
  }
] as const

const ACCEPTABLE_STATUS = new Set([200, 201, 202, 204, 400, 401, 403, 405, 422, 429])

for (const target of actionTargets) {
  test(`generated action contract: ${target.path}`, async ({ request }) => {
    if (target.hasDynamicSegment) {
      test.skip(true, 'Dynamic action path requires fixture id mapping')
    }

    const methods = [...target.methods] as string[]
    const defaultMethod = methods.includes('GET') ? 'GET' : (methods.includes('POST') ? 'POST' : methods[0])
    const actionConfig = target as { methodOverride?: string; probePath?: string; expectedStatuses?: number[]; note?: string }
    const method = typeof actionConfig.methodOverride === 'string' ? actionConfig.methodOverride : defaultMethod
    const requestPath = typeof actionConfig.probePath === "string" && actionConfig.probePath.length > 0 ? actionConfig.probePath : target.path
    const expectedStatuses = Array.isArray(actionConfig.expectedStatuses) && actionConfig.expectedStatuses.length > 0
      ? new Set(actionConfig.expectedStatuses)
      : ACCEPTABLE_STATUS

    let res
    if (method === 'GET') {
      res = await request.get(requestPath, { failOnStatusCode: false })
    } else if (method === 'POST') {
      res = await request.post(requestPath, { data: {}, failOnStatusCode: false })
    } else {
      res = await request.fetch(requestPath, { method, failOnStatusCode: false })
    }

    const msg = 'Unexpected status ' + res.status() + ' for ' + target.path + ' [' + method + ']' + (actionConfig.note ? ' (' + actionConfig.note + ')' : '')
    expect(expectedStatuses.has(res.status()), msg).toBe(true)
  })
}
