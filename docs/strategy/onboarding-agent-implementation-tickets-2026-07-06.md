# Onboarding Agent Implementation Tickets

Date: 2026-07-06
Purpose: Convert the onboarding agent program into sprint-ready implementation tickets with exact file targets and acceptance tests.
Depends on:
- docs/strategy/onboarding-agent-program-plan-2026-07-06.md
- docs/strategy/onboarding-journey-health-agent-spec-2026-07-06.md
- docs/strategy/onboarding-event-integrity-agent-spec-2026-07-06.md
- docs/strategy/onboarding-alert-reporting-agent-spec-2026-07-06.md

## Phase 1 Sprint Board

Phase 1 should ship the correctness boundary first: shared contracts, event integrity, and the core journey-health computation. Nothing in Phase 2 should duplicate logic from these tickets.

### OA-P1-01
Title: Define canonical onboarding agent contracts and shared metric helpers
Owner: Engineering + Data
Priority: P0
Goal:
- establish one event and metric contract surface for all onboarding agents
- eliminate duplicated query and parsing logic before any agent ships

Acceptance:
- all monitored event names and required properties exist in one shared contract module
- shared helper functions cover time-window filtering, baseline comparison, severity classification, and payload validation
- no Phase 2 ticket duplicates contract strings or threshold logic outside the shared module
- unit tests cover contract parsing and threshold helpers with synthetic fixtures

File targets:
- src/lib/onboarding-agent-contracts.ts
- src/lib/onboarding-agent-contracts.test.ts
- src/lib/onboarding-agent-metrics.ts
- src/lib/onboarding-agent-metrics.test.ts
- docs/strategy/onboarding-agent-program-plan-2026-07-06.md
- docs/product-requirements.md

Acceptance tests:
- `npm run typecheck`
- `npx vitest run src/lib/onboarding-agent-contracts.test.ts src/lib/onboarding-agent-metrics.test.ts`
- contract tests fail if an event required property is removed or renamed without an explicit spec update

### OA-P1-02
Title: Implement Event Integrity Agent checks and contract violation detection
Owner: Engineering + Data
Priority: P0
Goal:
- validate telemetry completeness, property types, and event sequencing for onboarding and briefing
- detect schema drift before it affects reporting or alerts

Acceptance:
- agent validates required properties for auth callback and briefing events
- agent detects missing critical events, suspicious redirect sequences, and impossible transitions
- agent produces a severity-tagged findings list with sample payload hints
- agent uses shared contract definitions from OA-P1-01 only

File targets:
- src/lib/onboarding-event-integrity-agent.ts
- src/lib/onboarding-event-integrity-agent.test.ts
- src/app/api/admin/automation/reporting/onboarding-event-integrity/route.ts
- src/app/api/admin/automation/reporting/onboarding-event-integrity/route.test.ts
- tmp/onboarding-event-integrity-agent.latest.json
- docs/strategy/onboarding-event-integrity-agent-spec-2026-07-06.md

Acceptance tests:
- `npm run typecheck`
- `npx vitest run src/lib/onboarding-event-integrity-agent.test.ts src/app/api/admin/automation/reporting/onboarding-event-integrity/route.test.ts`
- contract regression test fails if `auth_callback_completed` loses `redirect_path` or `explicit_next` validation
- sequence regression test covers onboarding_completed without onboarding_started and guided view without briefing_viewed

### OA-P1-03
Title: Implement Journey Health Agent checks and daily rollup artifact
Owner: Engineering + Product
Priority: P0
Goal:
- detect onboarding funnel regressions, first-value drift, and guided briefing exposure anomalies
- emit a daily rollup artifact for operational review

Acceptance:
- agent computes funnel conversion, step drop-off, TTFV p50/p90, and day-7 return for the onboarding cohort
- agent flags regressions using the thresholds defined in the spec
- agent writes a daily JSON artifact containing findings, severity, owner, and recommendations
- coverage includes the first-session guided briefing branch and onboarding callback-to-onboarding path

File targets:
- src/lib/onboarding-journey-health-agent.ts
- src/lib/onboarding-journey-health-agent.test.ts
- src/app/api/admin/automation/reporting/onboarding-journey-health/route.ts
- src/app/api/admin/automation/reporting/onboarding-journey-health/route.test.ts
- tmp/onboarding-journey-health-agent.latest.json
- docs/strategy/onboarding-journey-health-agent-spec-2026-07-06.md

Acceptance tests:
- `npm run typecheck`
- `npx vitest run src/lib/onboarding-journey-health-agent.test.ts src/app/api/admin/automation/reporting/onboarding-journey-health/route.test.ts`
- `node tmp/onboarding-journey-health-agent.mjs` produces a JSON artifact with non-empty schema even when no events are present
- at least one synthetic fixture test covers a critical funnel drop and a warning-level TTFV drift

## Phase 2 Sprint Board

Phase 2 can assume the shared contract and validation layer exists. These tickets focus on transport, reporting, and operability, with explicit rollout guardrails.

### OA-P2-01
Title: Implement alert routing, cooldowns, and dedupe for onboarding findings
Owner: Product Ops + Engineering
Priority: P1
Goal:
- route findings to the right channel with dedupe and cooldown rules
- keep notification volume low enough for daily operations use

Acceptance:
- critical findings are routed to an immediate internal channel path
- warning findings are deduped and batched into daily digest output
- identical findings do not re-alert inside the cooldown window
- alert payloads validate before dispatch

File targets:
- src/lib/onboarding-agent-alerts.ts
- src/lib/onboarding-agent-alerts.test.ts
- docs/strategy/onboarding-alert-reporting-agent-spec-2026-07-06.md

Acceptance tests:
- `npm run typecheck`
- `npx vitest run src/lib/onboarding-agent-alerts.test.ts`
- dedupe test ensures identical findings do not re-alert inside the cooldown window
- payload validation test fails if a required alert field is missing

### OA-P2-02
Title: Implement daily and weekly reporting routes for onboarding agents
Owner: Product Ops + Engineering
Priority: P1
Goal:
- publish a daily digest and weekly executive summary without manual stitching
- persist fallback artifacts if a provider fails

Acceptance:
- weekly report includes trend deltas, false-positive rate, and owner commitments
- reporter validates payload schema before dispatch
- fallback artifact is written on provider failure
- report completeness fails if any required weekly section is missing

File targets:
- src/lib/onboarding-agent-reporter.ts
- src/lib/onboarding-agent-reporter.test.ts
- src/app/api/admin/automation/reporting/onboarding-agent-daily/route.ts
- src/app/api/admin/automation/reporting/onboarding-agent-daily/route.test.ts
- src/app/api/admin/automation/reporting/onboarding-agent-weekly/route.ts
- src/app/api/admin/automation/reporting/onboarding-agent-weekly/route.test.ts

Acceptance tests:
- `npm run typecheck`
- `npx vitest run src/lib/onboarding-agent-reporter.test.ts src/app/api/admin/automation/reporting/onboarding-agent-daily/route.test.ts src/app/api/admin/automation/reporting/onboarding-agent-weekly/route.test.ts`
- report completeness test fails if any required weekly section is missing
- provider failure test writes a fallback artifact instead of silently dropping the report

### OA-P2-03
Title: Add runbooks, ownership matrix, and staging rollout guardrails
Owner: Product + Engineering + Data
Priority: P1
Goal:
- make the program operable before external rollout expands
- document ownership, alert response, and rollback paths

Acceptance:
- each critical check links to a runbook and owner team
- staging rollout is gated behind a feature flag and shadow mode first
- runbook includes false-positive triage and rollback steps
- the rollout plan matches the phase gates in the program plan

File targets:
- docs/strategy/onboarding-agent-program-plan-2026-07-06.md
- docs/strategy/onboarding-agent-runbook-2026-07-06.md
- docs/strategy/onboarding-agent-ownership-matrix-2026-07-06.md
- config/feature-rollout-policy.json
- docs/ux/first-run-remediation-plan-2026-07-06.md

Acceptance tests:
- review checklist confirms every critical finding has a runbook link and owner
- config review confirms the rollout remains reversible via feature flag
- staging smoke proves the agents can run in shadow mode without notifications

## Suggested Sequencing

1. OA-P1-01
2. OA-P1-02
3. OA-P1-03
4. OA-P2-01
5. OA-P2-02
6. OA-P2-03

## Minimal First Sprint Slice

If only one sprint slice ships first, ship:
- OA-P1-01 shared contracts and helpers
- OA-P1-02 event integrity checks

Those two establish the correctness boundary before higher-level alerting and reporting automate around them.