# DEV-EMI-410: Replace Cookie-Based EMI Smoke Auth with Service Token

Status: Complete (2026-06-19)
Owner: Platform/Security
Priority: High
Created: 2026-05-26

## Problem

Current EMI post-deploy and weekly validation automation authenticates using user credentials or a session cookie. This is operationally fragile and not ideal for CI security posture.

## Goal

Replace user-session authentication in EMI smoke automation with a non-user, scoped, revocable service-token path.

## Scope

1. Add a secure internal endpoint for EMI smoke triggering that accepts a dedicated token.
2. Validate token server-side with constant-time comparison and rate limiting.
3. Restrict endpoint to post-deploy smoke actions only.
4. Update smoke script and workflows to use service token.
5. Remove dependence on user password/session-cookie env vars in CI.

## Acceptance Criteria

1. `npm run emi:smoke:postdeploy` supports `EMI_SMOKE_TOKEN` and does not require user credentials.
2. `.github/workflows/post-deploy.yml` runs EMI smoke with token auth only.
3. `.github/workflows/emi-weekly-validation.yml` runs EMI smoke with token auth only.
4. Validation remains `status=ok`, `mismatchCount=0`, `nullStreakCount=0` in production checks.
5. Runbook updated with token rotation and incident fallback steps.

## Security Notes

1. Token must be stored only in repository/workflow secrets.
2. Token must be rotatable without code changes.
3. Endpoint must return identical error shape for invalid/missing token.
4. Endpoint must not expose staff session or user identity details.

## Implementation Notes

1. Added dedicated internal endpoint: `POST /api/internal/automation/emi-smoke` in `src/app/api/internal/automation/emi-smoke/route.ts`.
2. Endpoint auth uses `EMI_SMOKE_TOKEN` with constant-time comparison and identical `401 Unauthorized` response for missing/invalid token.
3. Endpoint enforces request rate limiting before execution and only runs the fixed EMI post-deploy smoke action path.
4. `scripts/emi-postdeploy-smoke.mjs` now requires `EMI_SMOKE_TOKEN` and no longer uses session cookie or user-password login fallbacks.
5. Workflows updated to token-only secret usage:
   - `.github/workflows/post-deploy.yml`
   - `.github/workflows/emi-weekly-validation.yml`
6. Runbook updated with token rotation and incident fallback guidance in `docs/strategy/emi-sprints/artifacts/emi-production-validation-rerun-procedure.md`.

## Live Cutover Evidence (2026-06-18)

1. Dedicated CI secret `EMI_SMOKE_TOKEN` was created and updated in GitHub Actions repository secrets.
2. Dedicated production environment variable `EMI_SMOKE_TOKEN` was set on Railway service `startingmonday` in `production`.
3. Production service identity variables are now present and wired:
   - `AUTOMATION_SERVICE_TOKEN`
   - `AUTOMATION_SERVICE_USER_ID`
4. Deployment `403a1065-a084-4246-969b-9d648e2ecd46` reached `SUCCESS` with the internal URL fix for EMI smoke fan-out calls.
5. Live automation requests now execute successfully through both internal admin endpoints:
   - `weekly-kpi-summaries` returned `ok=true`, run `b00f875d-467c-4fb0-961c-09c4b4c19e0a`
   - `emi-validation-reruns` returned `ok=true`, run `cdf577e5-0e02-47a7-92ba-d7f1a5a31211`
6. Final acceptance pass captured on deployment `e198891d-0a5f-48f5-90f4-0709114cb8ca`:
   - smoke weekly run `292fd0aa-238b-407a-986d-5206bc7e560c`
   - smoke validation run `27febb82-c98d-4fac-826a-aabebb7bbda5`
   - `status=ok`
   - `mismatchCount=0`
   - `nullStreakCount=0`

## Closure Notes

1. Endpoint and workflow auth now rely on dedicated `EMI_SMOKE_TOKEN` and no longer depend on cookie/session flows.
2. Production smoke contract is green and repeatable in CI and post-deploy contexts.
3. Ticket accepted and closed.
