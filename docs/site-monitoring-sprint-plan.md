# Site Monitoring Sprint Plan

**Goal:** Watch Starting Monday the way a user experiences it, 24x7x365, and alert on any broken journey before a customer reports it.

## What We Are Building

This is not just uptime monitoring. It is a user-perspective reliability layer that checks:

- page loads and route transitions
- auth flows and dashboard rendering
- visible 404s, blank states, and unresponsive screens
- JS console errors, CSP errors, and hydration failures
- API-backed content freshness and failure states
- slow responses, worker failures, and broken alerts

## Inputs From the Existing Docs

- [docs/architecture.md](architecture.md) already defines the core stack: `/api/health`, Sentry, UptimeRobot, Railway logs, and PostHog.
- [docs/epic-sre-council-backlog.md](epic-sre-council-backlog.md) already calls for stronger observability, traceability, worker logging, Playwright in CI, staging, and rate limiting.
- [docs/content/software-sre-synthetic-council.md](content/software-sre-synthetic-council.md) provides the operating principle: if you cannot observe user-impacting behavior, you cannot improve it.
- [docs/content/site-review-may-2026.md](content/site-review-may-2026.md) emphasizes that observability must answer novel questions about production behavior, not just collect logs.
- The attached article reinforces the same engineering themes: clean architecture, reliable deployment, automated testing, networking awareness, and observability as feedback.

## Sprint 1: Observe the User Journey

**Goal:** Detect route-level failures and broken rendering in the browser.

### Sprint 1 Deliverables

- Add Playwright synthetic checks for the top user journeys:
  - `/`
  - `/login`
  - `/signup`
  - `/pricing`
  - `/dashboard`
  - `/dashboard/outreach`
  - `/dashboard/companies/[id]`
  - `/dashboard/briefing`
- Assert the page is usable, not just reachable:
  - heading exists
  - primary CTA exists
  - no console errors
  - no page error
  - no fatal CSP violations
  - no blank viewport after load
- Capture screenshots on failure.

### Sprint 1 Acceptance Criteria

- Every monitored journey passes on a clean deploy.
- Any 404, hydration error, or console error on a critical path fails the check.
- Failures include URL, screenshot, console log, and timestamp.

## Sprint 2: Detect Content and Freshness Failures

**Goal:** Catch cases where the page loads but the content is stale, missing, or incorrect.

### Sprint 2 Deliverables

- Add content assertions for the most important copy blocks.
- Check that pricing, CTA labels, and key dashboard sections render expected text.
- Check that dynamic pages contain non-empty data sections when the user is authenticated.
- Add freshness checks for content that depends on recent data:
  - daily briefing
  - signal digests
  - outreach queue
  - company detail pages
- Track when a page last changed successfully, and alert if expected content disappears.

### Sprint 2 Acceptance Criteria

- A route that returns HTML but renders empty or partial content fails the check.
- A route that returns old or missing business-critical text fails the check.

## Sprint 3: Add Production Observability

**Goal:** Make every failure traceable to a user, page, and system cause.

### Sprint 3 Deliverables

- Keep Sentry as the exception layer for browser and server failures.
- Expand Railway logging so every synthetic failure emits a structured event.
- Add trace context for route, user, and journey name.
- Add PostHog events for:
  - page load success
  - page load failure
  - CTA click
  - journey completion
  - repeated error on the same route
- Keep `/api/health` as the basic uptime check, but treat it as the last line of defense rather than the main signal.

### Sprint 3 Acceptance Criteria

- Every synthetic alert links to a concrete failing journey.
- Support can see whether the problem is route rendering, API failure, or browser execution.

## Sprint 4: Add Safety Nets for Production

**Goal:** Prevent silent regressions from reaching users.

### Sprint 4 Deliverables

- Add Playwright to CI so the critical journeys run before deploy.
- Add a staging environment or preview environment for the synthetic suite.
- Add worker timeout handling for scans, digests, and outbound jobs.
- Add per-route rate limits where user-triggered requests can exhaust APIs.
- Keep the CSP checks in place and treat new inline-script regressions as release blockers.

### Sprint 4 Acceptance Criteria

- A failing synthetic test blocks release.
- Staging catches issues before production.
- Hung jobs do not block the worker indefinitely.

## Sprint 5: Make It Operational

**Goal:** Ensure the monitoring system itself is maintainable.

### Sprint 5 Deliverables

- Create a single dashboard for the reliability layer:
  - uptime
  - journey pass/fail status
  - last screenshot
  - last console error
  - last failing route
  - unresolved incidents
- Add an alert policy:
  - page-level failure: immediate
  - repeated failure on same route: escalate
  - single transient failure: warn only
- Document runbooks for the top failure classes:
  - 404 or missing route
  - CSP block
  - hydration error
  - auth loop
  - blank render
  - slow response

### Sprint 5 Acceptance Criteria

- On-call can identify the issue in under 5 minutes.
- A non-engineer can open the dashboard and understand what is broken.

## Recommended Tooling

- Playwright for browser-level synthetic checks.
- Sentry for exceptions and stack traces.
- PostHog for funnel and behavior telemetry.
- UptimeRobot for basic availability on `/api/health`.
- Railway logs for structured backend and worker events.
- Existing Next.js route and middleware logging for request-level context.

## Priority Order

| Sprint | Risk | Effort | Ship by |
| --- | --- | --- | --- |
| 1 — User journey checks | High | Low | Next week |
| 2 — Content freshness | High | Low | Next week |
| 3 — Observability context | High | Medium | 2 weeks |
| 4 — Production safety | High | Medium | 2 weeks |
| 5 — Operational dashboard | Medium | Medium | 3 weeks |

## Why This Is the Right Shape

The site already has the primitives: health checks, Sentry, logs, analytics, and a reliability backlog. The missing piece is a user-perspective watcher that turns those primitives into a continuous, action-oriented system. That is the shortest path to eliminating silent 404s, blank pages, and unresponsive flows.
