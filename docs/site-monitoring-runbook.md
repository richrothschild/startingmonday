# Site Monitoring Incident Runbook

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: weekly
Source of truth: yes


This runbook is for customer-observable failures detected by synthetic monitoring.

## Triage Checklist

1. Identify failing check from `Production Monitoring` or `CI` run.
2. Capture failing route, timestamp, HTTP status, and first error string.
3. Pull artifacts: `monitoring-summary`, Playwright report, screenshot, trace/video.
4. Classify incident using one of the failure classes below.
5. Fix, redeploy, and confirm one clean monitoring run.

## Failure Class: 404 Or Missing Route

### Symptoms (404 Or Missing Route)

- Synthetic route check returns `404`.
- Page contains visible `404` content despite expected route.

### Likely Causes (404 Or Missing Route)

- Route moved or deleted without redirect.
- Middleware rewrite mismatch.
- Dynamic route param no longer resolves.

### Immediate Actions (404 Or Missing Route)

1. Verify route file and expected path mapping in app router.
2. Add/repair redirect or restore route.
3. Re-run route synthetic test locally and in CI.

## Failure Class: CSP Block

### Symptoms (CSP Block)

- Console includes CSP violation errors.
- Hydration or client execution fails on production only.

### Likely Causes (CSP Block)

- Header policy drift in `next.config.ts`.
- New inline/runtime script blocked by `script-src` or `script-src-elem`.

### Immediate Actions (CSP Block)

1. Inspect response headers for current CSP on failing route.
2. Compare with known-good policy in source control.
3. Deploy minimal CSP correction and verify no policy over-broadening.

## Failure Class: Hydration Error

### Symptoms (Hydration Error)

- Console shows hydration mismatch or recoverable render errors.
- Visible blank/partial content after initial load.

### Likely Causes (Hydration Error)

- Server/client render divergence.
- Time- or environment-dependent UI output.
- Browser-only code path rendering on server.

### Immediate Actions (Hydration Error)

1. Reproduce with Playwright trace and browser console capture.
2. Isolate component rendering mismatch.
3. Patch deterministic rendering and verify route synthetic pass.

## Failure Class: Auth Loop

### Symptoms (Auth Loop)

- `/dashboard` repeatedly redirects to `/login` despite valid session.
- Auth-required synthetic journeys consistently skip or fail unexpectedly.

### Likely Causes (Auth Loop)

- Cookie/session parsing regression.
- Middleware auth guard mismatch.
- Supabase auth token refresh failure.
- OAuth callback regression: redirect history behavior changed (for example `location.replace` removed).
- OAuth callback host normalization drift (forwarded host/proto handling causes cookie domain mismatch).
- Unsafe or malformed `next` parameter causing repeated bounce between auth routes.

### Immediate Actions (Auth Loop)

1. Verify login session in `tests/e2e/.auth/user.json` setup flow.
2. Confirm middleware and server auth checks are aligned.
3. Validate protected route load manually and via Playwright.
4. Validate callback behavior directly:
   - `/auth/callback?code=probe&next=/dashboard/briefing` returns a path-only client redirect (`location.replace("/dashboard/briefing")`).
   - Invalid `next` values (absolute URLs) are sanitized back to `/dashboard/briefing`.
5. Re-run targeted callback regression tests:
   - `npx vitest run src/app/auth/callback/route.test.ts`

## Failure Class: Blank Render

### Symptoms (Blank Render)

- Route returns `200` but has no meaningful body content.
- Synthetic body-text or shell checks fail.

### Likely Causes (Blank Render)

- Runtime exception swallowed by client boundary.
- Data fetch resolves empty with no fallback UI.
- Critical component gate prevents render.

### Immediate Actions (Blank Render)

1. Inspect browser console and page errors in synthetic artifacts.
2. Verify empty-state UI appears when no data exists.
3. Patch rendering guardrails and add/adjust freshness assertions.

## Failure Class: Slow Response

### Symptoms (Slow Response)

- Monitoring checks exceed normal latency baseline.
- User flow still passes but with degraded duration.

### Likely Causes (Slow Response)

- Slow upstream dependencies.
- Worker backlog or contention.
- Recent deploy introduced expensive queries.

### Immediate Actions (Slow Response)

1. Compare current and historical durations from monitoring summaries.
2. Correlate with Railway logs and Sentry traces.
3. Roll back or optimize hotspot and confirm duration recovery.

## Incident Closure Criteria

- Failing journey passes in CI and scheduled monitoring.
- Root cause is recorded in the related PR/incident notes.
- If class is new, runbook is updated before closure.
