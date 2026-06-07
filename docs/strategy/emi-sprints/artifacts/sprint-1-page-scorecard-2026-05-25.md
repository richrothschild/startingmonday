# Sprint 1 Page-by-Page Scorecard (A+ Pass/Fail)

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-25  
Rubric source: docs/strategy/emi-sprints/artifacts/sprint-1-content-a-plus-rubric-sheet-2026-05-25.md
H4 validation runbook: docs/strategy/emi-sprints/artifacts/sprint-1-telemetry-completeness-validation-runbook-2026-05-25.md

Scored pages:
- src/app/page.tsx
- src/app/pricing/page.tsx
- src/app/for-cio/page.tsx
- src/app/for-coaches/page.tsx

## Baseline Scoring (Current State)

| Page | R1/15 | R2/15 | R3/10 | R4/10 | R5/15 | R6/10 | R7/10 | R8/15 | Total/100 | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| src/app/page.tsx | 13 | 12 | 8 | 5 | 6 | 8 | 9 | 2 | 63 | FAIL |
| src/app/pricing/page.tsx | 12 | 11 | 9 | 6 | 10 | 8 | 9 | 2 | 67 | FAIL |
| src/app/for-cio/page.tsx | 13 | 13 | 8 | 4 | 5 | 8 | 9 | 2 | 62 | FAIL |
| src/app/for-coaches/page.tsx | 13 | 14 | 9 | 8 | 10 | 8 | 8 | 2 | 72 | FAIL |

## Execution Sequence and Rescoring (Implemented)

### Step 1: Home updated (`src/app/page.tsx` + shared landing template)
Applied deltas:
- Added explicit alternatives contrast near hero.
- Added Day 1/3/7 first-week execution strip.
- Converted objection blocks to expandable details near decision path.
- Added telemetry data attributes and page-level EMI instrumentation.

Rescore after home update:

| Page | R1/15 | R2/15 | R3/10 | R4/10 | R5/15 | R6/10 | R7/10 | R8/15 | Total/100 | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| src/app/page.tsx | 15 | 14 | 10 | 9 | 14 | 10 | 9 | 14 | 95 | PASS (provisional pending H4 sample check) |

### Step 2: Pricing updated (`src/app/pricing/page.tsx` + `src/app/pricing/pricing-cards.tsx`)
Applied deltas:
- Added EMI differentiation and first-7-days decision framing.
- Added objection block before plan decision.
- Added source-path and freshness copy to proof snapshot.
- Added telemetry attributes to nav, cards, proof, and support CTAs.

Rescore after pricing update:

| Page | R1/15 | R2/15 | R3/10 | R4/10 | R5/15 | R6/10 | R7/10 | R8/15 | Total/100 | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| src/app/pricing/page.tsx | 15 | 14 | 10 | 9 | 14 | 10 | 9 | 14 | 95 | PASS (provisional pending H4 sample check) |

### Step 3: For-CIO updated (`src/app/for-cio/page.tsx` + shared landing template)
Applied deltas:
- Added CIO-specific proof module with denominator/window/source-path language.
- Added CIO objection block (confidentiality, timing, recruiter reliance).
- Added explicit CTA ladder (trial, evidence, method).
- Added telemetry instrumentation and tracked CTA paths.

Rescore after for-cio update:

| Page | R1/15 | R2/15 | R3/10 | R4/10 | R5/15 | R6/10 | R7/10 | R8/15 | Total/100 | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| src/app/for-cio/page.tsx | 15 | 15 | 10 | 9 | 14 | 10 | 9 | 14 | 96 | PASS (provisional pending H4 sample check) |

### Step 4: For-Coaches updated (`src/app/for-coaches/page.tsx` + `src/app/for-coaches/coach-preview-actions.tsx`)
Applied deltas:
- Added economic-buyer vs practitioner split module.
- Updated metadata to EMI-first framing.
- Upgraded proof block governance text with denominator/window/source path.
- Added telemetry instrumentation and objection expansion tracking.

Rescore after for-coaches update:

| Page | R1/15 | R2/15 | R3/10 | R4/10 | R5/15 | R6/10 | R7/10 | R8/15 | Total/100 | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| src/app/for-coaches/page.tsx | 15 | 15 | 10 | 9 | 14 | 10 | 9 | 14 | 96 | PASS (provisional pending H4 sample check) |

## Remaining Risk (Post-Implementation)

### Cross-page blocker: telemetry completeness threshold
- H4 requires production sample validation (>=100 unique sessions per page or 7 days).
- Code-level instrumentation is in place, but statistical completeness cannot be verified pre-traffic.

### Cross-page blocker: final legal/compliance pass on live claim render
- Claims now include denominator/window/source-path language in copy.
- Final signoff must be executed against deployed render snapshots.

### Operational note
- Sprint closeout remains conditional until H4 null-rate checks pass on production events.

### Current status
- All four pages now meet the >=95 rubric threshold in implementation review.
- Sprint remains open until telemetry completeness threshold is validated.

## Page-Level Gate Matrix

| Gate | Home | Pricing | For CIO | For Coaches |
|---|---|---|---|---|
| H1: Denominator + freshness on numeric claims | PASS | PASS | PASS | PASS |
| H2: Source path on every claim | PASS | PASS | PASS | PASS |
| H3: Primary CTA telemetry event | PASS | PASS | PASS | PASS |
| H4: Critical event null rate <=1% | PENDING | PENDING | PENDING | PENDING |
| H5: Single core promise consistency | PASS | PASS | PASS | PASS |
| H6: Persona mismatch in hero/CTA | PASS | PASS | PASS | PASS |
| H7: Metadata/body promise alignment | PASS | PASS | PASS | PASS |
| H8: Legal-safe caveat presence | PASS | PASS | PASS | PASS |

Legend: PASS = gate met, PENDING = requires post-publish sample validation.

## Telemetry Completeness Validation Plan (H4)

1. Wait until each Sprint 1 page reaches >=100 unique sessions (or 7 days elapsed).
2. Run null-rate checks for `page_slug`, `persona_segment`, `session_id`, `week_start`.
3. Confirm null rate is <=1% for each critical field by page.
4. Confirm event coverage includes `emi_page_view`, `emi_cta_click`, `emi_proof_block_view`, `emi_objection_expand`, and `emi_path_transition`.
5. Record evidence query outputs in sprint artifacts before final close.

## Local Validation Evidence (Pre-Publish)

- `npm run typecheck`: PASS on 2026-05-25 after Sprint 1 content and telemetry changes.
- `npm exec vitest run src/components/EmiMarketingTelemetry.test.ts src/components/LandingPage.test.tsx src/components/PosthogProvider.test.tsx src/lib/posthog-server.test.ts`: PASS on 2026-05-25.
- Validation harness repaired in `vitest.config.ts` so both `.test.ts` and `.test.tsx` files execute.

## Exact Requirements To Close Sprint 1

1. Complete H4 post-publish telemetry null-rate validation for all four pages.
2. Archive validation evidence in sprint artifacts.
3. Obtain legal/trust signoff from final deployed render snapshots.
4. Mark sprint status as CLOSED only after all gates are PASS.

## Sprint 1 Exit Rule

Sprint 1 is complete only when all four pages:
1. Score >= 95/100,
2. Meet category floors,
3. Clear all hard-fail gates H1-H8,
4. Pass telemetry completeness checks after release sample threshold.

## Owner Assignment (Assigned)

| Page | Content Owner | Growth Owner | Analytics Owner | Legal/Trust Owner | Target Date |
|---|---|---|---|---|---|
| src/app/page.tsx | Richard Rothschild | Chris Goodwin | EMI Reliability Owner | Mary O'Carroll | 2026-05-30 |
| src/app/pricing/page.tsx | Richard Rothschild | Chris Goodwin | EMI Reliability Owner | Mary O'Carroll | 2026-05-30 |
| src/app/for-cio/page.tsx | Richard Rothschild | Chris Goodwin | EMI Reliability Owner | Mary O'Carroll | 2026-05-30 |
| src/app/for-coaches/page.tsx | Richard Rothschild | Chris Goodwin | EMI Reliability Owner | Mary O'Carroll | 2026-05-30 |
