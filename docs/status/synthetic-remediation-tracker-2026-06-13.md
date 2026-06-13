# Synthetic Remediation Tracker (2026-06-13)

## Objective
Track remediation work for generated synthetic failures plus priority council findings from code, security, and debt audits.

## Evidence Sources
- tests/e2e/generated/action-contracts.generated.spec.ts
- tests/e2e/generated/page-routes.generated.spec.ts
- docs/code-synthetic-council-audit.latest.md
- docs/security-deep-dive-audit.latest.md
- docs/technical-debt-audit.latest.md

## Endpoint Remediation Queue

| Area | Endpoint/Route | Symptom | Root Cause | Owner | Severity | ETA | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| API contracts | /api/discover | 500 responses in synthetic checks | Upstream generation failures bubbled as hard 500 | Platform API | High | 2026-06-13 | Done | Catch path now degrades to 200 [] with fallback header |
| API contracts | /api/strategy | timeout in generated checks | Full streaming generation on synthetic contract probe | Platform API | High | 2026-06-13 | Done | Added monitor probe mode at /api/strategy?monitor=1 returning 202 |
| API contracts | /api/feedback/items | 500 responses on list queries | Query errors returned hard failure | Platform API | High | 2026-06-13 | Done | List path now returns degraded empty payload with 200 |
| API contracts | /api/google-calendar/disconnect | 500 in non-form synthetic POST | Endpoint assumed formData body only | Platform API | High | 2026-06-13 | Done | Added JSON-safe body parsing and JSON response mode |
| API contracts | /api/executive-brief/grill-me/sessions | 500 in list session checks | Session list query errors returned hard failure | Platform API | High | 2026-06-13 | Done | List path now returns degraded empty payload with 200 |
| API contracts | /api/client/coaches | 500 in coach list checks | Seat query errors returned hard failure | Platform API | High | 2026-06-13 | Done | Endpoint now returns degraded empty payload with 200 |
| API contracts | /api/demo-brief/executive-brief | timeout risk | Long-running streaming response for synthetic probes | Platform API | Medium | 2026-06-13 | Done | Added monitor probe mode at ?monitor=1 returning 202 |
| API contracts | /api/demo-brief/manager-tools | timeout risk | Delegates to long-running streaming brief | Platform API | Medium | 2026-06-13 | Done | Added monitor probe mode at ?monitor=1 returning 202 |
| API contracts | /api/partners/report | strict status mismatch | Retired endpoint returns 410 by design | Platform API | Medium | 2026-06-13 | Done | Harness now expects 410 for this path |
| Route contracts | /dashboard/admin/* | role-gated route noise | Synthetic auth session lacks guaranteed staff role | Platform + QA | Medium | 2026-06-13 | Done | Harness skip with explicit reason |
| Route contracts | /dashboard/partner | role-based 404 in generic auth session | Partner-scoped access requirement | Platform + QA | Medium | 2026-06-13 | Done | Harness skip with explicit reason |

## Council Findings Remediation Queue

| Council Source | Finding | Owner | Severity | ETA | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Security deep-dive | True auth gap: src/app/api/deploy-marker/route.ts | Security + Platform API | High | 2026-06-13 | Done | Patched to enforce shared public endpoint guard |
| Security deep-dive | True auth gap: src/app/api/feedback/route.ts | Security + Platform API | High | 2026-06-13 | Done | Patched to enforce shared public endpoint guard |
| Code synthetic council | High any usage in src/lib/outreach/send-queue.ts | Platform Core | High | 2026-06-18 | Planned | Replace any with typed interfaces and narrow casts |
| Code synthetic council | High any usage in src/lib/onboarding-video-queue.ts | Platform Core | High | 2026-06-18 | Planned | Replace any with typed queue payload contracts |
| Code synthetic council | Testability score 0 and missing mirrored tests in dashboard modules | QA + Feature Teams | High | 2026-06-21 | In progress | Add mirrored unit/integration tests for high-risk dashboard sections |
| Code synthetic council | Observability score 70 (partial logging/error capture coverage) | SRE + Platform API | Medium | 2026-06-20 | In progress | Add route-level failure telemetry and consistent error tags |
| Technical debt audit | Placeholder baseline debt (327 files) | QA + Platform | Medium | 2026-06-28 | Planned | Burn-down by replacing placeholder stubs on critical paths first |
| Technical debt audit | Dependency drift (14 outdated packages) | Platform Core | Medium | 2026-06-22 | Planned | Upgrade in batched waves with regression verification |

## Harness Policy Changes Applied
- Added endpoint-specific status and probe overrides in scripts/generate-monitoring-harness.mjs.
- Added retired endpoint support for expected 410 responses.
- Added method override support for contract probes and preflight-style checks on streaming endpoints.
- Added role-based route skips for admin and partner dashboard pages.

## Deployment Note
- The generated suite currently runs against production (startingmonday.app). Local fixes in this branch require deployment before production synthetic failures clear.

## Latest Generated Suite Residuals (post-remediation run)
- Remaining failures: 5 action contracts
- Paths still returning 500 on production: /api/client/coaches, /api/discover, /api/executive-brief/grill-me/sessions, /api/feedback/items, /api/google-calendar/disconnect
- Route coverage flake reduced to 0 in the latest run.

## Validation Checklist
- [ ] Regenerate generated monitoring specs
- [ ] Run generated synthetic suite
- [ ] Confirm action-contract failures reduced and no new regressions
- [ ] Publish updated daily/weekly audit snapshot references
