# EMI Now-Lane One-Week Pull Plan

Week of: 2026-05-25
Scope source: docs/development/emi-engineering-board-now-next-later.md (Now lane only)
Plan owner: Engineering Lead

Daily standup companion:

1. docs/development/emi-daily-standup-companion-2026-05-25.md

## Dependency-Safe Start Order

1. DEV-EMI-401, DEV-EMI-103, DEV-EMI-003 start first (no dependencies).
2. DEV-EMI-402 and DEV-EMI-408 start after DEV-EMI-401.
3. DEV-EMI-101 starts after DEV-EMI-103 schema alignment checkpoint.
4. DEV-EMI-204 starts after DEV-EMI-103.
5. DEV-EMI-201 starts after DEV-EMI-101 API contract lock.
6. DEV-EMI-502 starts only after DEV-EMI-204 signal contract is stable.
7. DEV-EMI-102 starts after DEV-EMI-101 is functionally complete.
8. DEV-EMI-202 and DEV-EMI-203 start after DEV-EMI-201 baseline merge.

## Pull Capacity Guardrails

1. Product + Engineering remains capped at 10 effort points this week.
2. Engineering + Data/SRE is split into two streams to reduce overload risk.
3. No owner takes new work mid-week unless all assigned day commitments are complete.

## Daily Assignments By Owner

## Day 1 (Monday)

1. Data Engineering
- Ticket: DEV-EMI-401
- Assignment: define pipeline validation rules and implement denominator or timeframe or confidence blockers.
- Output by end of day: validation rule set merged behind feature flag.

2. Engineering + Data
- Ticket: DEV-EMI-103
- Assignment: event schema lock and instrumentation contract for assessment funnel.
- Output by end of day: event contract document and implementation stubs.

3. Legal + Web
- Ticket: DEV-EMI-003
- Assignment: trust center page structure and claims policy section draft.
- Output by end of day: trust center skeleton and legal review checklist.

4. Engineering (parallel stream)
- Ticket: DEV-EMI-402 (prep only)
- Assignment: prep run-log automation scaffolding pending DEV-EMI-401 completion.
- Output by end of day: logging job template ready.

## Day 2 (Tuesday)

1. Data Engineering
- Ticket: DEV-EMI-401
- Assignment: complete blocker enforcement and run validation tests.
- Output by end of day: DEV-EMI-401 complete.

2. Data + Legal Ops
- Ticket: DEV-EMI-408
- Assignment: start claim compliance audit job using DEV-EMI-401 output.
- Output by end of day: first audit job run in staging.

3. Engineering + Data
- Ticket: DEV-EMI-103
- Assignment: wire event emission for all assessment funnel stages.
- Output by end of day: full funnel event capture in dev.

4. Product + Engineering
- Ticket: DEV-EMI-101 (start gate)
- Assignment: start assessment flow implementation once schema alignment from DEV-EMI-103 is signed off.
- Output by end of day: step flow routes and required-field validation baseline.

5. Engineering
- Ticket: DEV-EMI-402 (start gate)
- Assignment: implement run-log automation after DEV-EMI-401 completion.
- Output by end of day: run-log generation in test pipeline.

## Day 3 (Wednesday)

1. Product + Engineering
- Ticket: DEV-EMI-101
- Assignment: finalize scoring submission and persona handling.
- Output by end of day: DEV-EMI-101 functionally complete for QA.

2. Product Design + Frontend
- Ticket: DEV-EMI-102 (start gate)
- Assignment: begin segmented results UI after DEV-EMI-101 reaches QA-ready state.
- Output by end of day: score-band page and CTA wiring in feature branch.

3. Product + Frontend
- Ticket: DEV-EMI-201 (start gate)
- Assignment: start one-screen daily loop implementation after DEV-EMI-101 contract lock.
- Output by end of day: daily loop layout and action card components.

4. Engineering + SRE
- Ticket: DEV-EMI-204 (start gate)
- Assignment: implement observability dashboard panels after DEV-EMI-103 event stream is active.
- Output by end of day: first dashboard panels populated in staging.

5. Data + Legal Ops
- Ticket: DEV-EMI-408
- Assignment: complete compliance audit scheduling and alert policy.
- Output by end of day: DEV-EMI-408 complete.

## Day 4 (Thursday)

1. Engineering
- Ticket: DEV-EMI-402
- Assignment: finalize run-log automation and quality checks.
- Output by end of day: DEV-EMI-402 complete.

2. Product Design + Frontend
- Ticket: DEV-EMI-102
- Assignment: finalize segmented recommendations and onboarding CTA behavior.
- Output by end of day: DEV-EMI-102 complete.

3. Product + Frontend
- Ticket: DEV-EMI-201
- Assignment: complete completion toggles, reflection prompt, and end-of-day logic.
- Output by end of day: DEV-EMI-201 complete.

4. Product + Backend
- Ticket: DEV-EMI-202 (start gate)
- Assignment: start 72-hour recovery protocol flow after DEV-EMI-201 completion.
- Output by end of day: day-based protocol state model implemented.

5. Product + Backend
- Ticket: DEV-EMI-203 (start gate)
- Assignment: start optionality mode controls after DEV-EMI-201 completion.
- Output by end of day: weekly checkpoint mode and signal filter baseline.

6. SRE + Engineering
- Ticket: DEV-EMI-502 (start gate)
- Assignment: start SLO alert wiring after DEV-EMI-204 baseline panels are stable.
- Output by end of day: SLO alert config draft and threshold mapping.

## Day 5 (Friday)

1. Product + Backend
- Ticket: DEV-EMI-202
- Assignment: finish protocol completion and handoff flow.
- Output by end of day: DEV-EMI-202 complete.

2. Product + Backend
- Ticket: DEV-EMI-203
- Assignment: finish optionality mode controls and checkpoint tracking.
- Output by end of day: DEV-EMI-203 complete.

3. Engineering + SRE
- Ticket: DEV-EMI-204
- Assignment: finish observability alerts and dashboard QA.
- Output by end of day: DEV-EMI-204 complete.

4. SRE + Engineering
- Ticket: DEV-EMI-502
- Assignment: complete SLO monitoring and alert wiring for EMI critical flows.
- Output by end of day: DEV-EMI-502 complete.

5. Legal + Web
- Ticket: DEV-EMI-003
- Assignment: finalize trust center publish and legal signoff.
- Output by end of day: DEV-EMI-003 complete.

## End-of-Week Target Completion

1. Complete: DEV-EMI-401, DEV-EMI-402, DEV-EMI-408, DEV-EMI-103, DEV-EMI-101, DEV-EMI-102, DEV-EMI-201, DEV-EMI-202, DEV-EMI-203, DEV-EMI-204, DEV-EMI-502, DEV-EMI-003.
2. Open carryover allowed: none planned.

## Friday Review Checklist

1. Confirm all dependency-gated tickets started only after prerequisite completion.
2. Recompute owner workload before pulling any Next-lane tickets.
3. If any ticket slips, move only its direct dependents and preserve critical path order.
