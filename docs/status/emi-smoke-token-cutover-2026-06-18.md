# EMI Smoke Token Cutover - 2026-06-18

Status: Complete (2026-06-19)
Owner: Platform/Security
Ticket: docs/development/tickets/DEV-EMI-410-service-token-smoke-auth.md

## Completed Cutover Steps

1. Added dedicated internal smoke endpoint: `/api/internal/automation/emi-smoke`.
2. Updated smoke script to token-only auth (`EMI_SMOKE_TOKEN`).
3. Updated workflows to use dedicated secret name `EMI_SMOKE_TOKEN`:
   - `.github/workflows/post-deploy.yml`
   - `.github/workflows/emi-weekly-validation.yml`
4. Set GitHub Actions secret `EMI_SMOKE_TOKEN`.
5. Set Railway production variable `EMI_SMOKE_TOKEN` on service `startingmonday`.

## Live Validation Evidence

1. Live run artifact: `docs/status/emi-smoke-token-live-validation-2026-06-18.json`.
2. Latest deployment with validation drift fix and final smoke pass: `e198891d-0a5f-48f5-90f4-0709114cb8ca` (`SUCCESS`).
3. Internal route is active in production (`/api/internal/automation/emi-smoke`) and successfully fan-outs to:
   - `/api/admin/automation/reporting/weekly-kpi-summaries`
   - `/api/admin/automation/reporting/emi-validation-reruns`
7. Scheduler fan-out coverage has been expanded in repo and now includes:
   - `/api/admin/automation/reporting/proof-asset-publisher`
   - `/api/admin/automation/reporting/tier1-claim-compliance-audit`
   - `/api/admin/automation/reporting/sprint-5-exit-metrics`
   - `/api/admin/automation/reporting/gtm-proof-sequence`
   - `/api/admin/automation/reporting/q4-cadence-automation`
   - `/api/admin/automation/reporting/capstone-report-generation`
   - `/api/admin/automation/reporting/success-criteria-audit-automation`
8. Weekly workflow summary now persists run IDs for the full fan-out chain in `.github/workflows/emi-weekly-validation.yml`.
9. Local guardrail cycle evidence (2026-06-18) passed:
   - `npm run growth:council:strict`
   - `npm run growth:metrics:strict`
   - `npm run growth:weekly-outputs:strict`
   - `npm run release:sitewide-note:strict`
   - `npm run marketing:trust-proof:gate`
4. Final weekly run succeeded:
   - `runId=292fd0aa-238b-407a-986d-5206bc7e560c`
5. Final validation rerun succeeded:
   - `runId=27febb82-c98d-4fac-826a-aabebb7bbda5`
   - `status=ok`
   - `mismatchCount=0`
   - `nullStreakCount=0`
6. Interpretation: deployment, auth cutover, and smoke acceptance criteria are now all satisfied in production.

## Deployment Queue Snapshot

1. `403a1065-a084-4246-969b-9d648e2ecd46` - SUCCESS (includes internal URL fix in EMI smoke route)
2. `077093e6-1671-42ce-b64f-60bda383774c` - REMOVED

## Finalization Step

Executed command:

```bash
npm run emi:smoke:postdeploy -- --json
```

Pass criteria result:

1. Met: HTTP 200 from `/api/internal/automation/emi-smoke`
2. Met: `weeklyRunId` and `validationRunId` are non-null
3. Met: `validationStatus=ok`
4. Met: `mismatchCount=0`
5. Met: `nullStreakCount=0`
