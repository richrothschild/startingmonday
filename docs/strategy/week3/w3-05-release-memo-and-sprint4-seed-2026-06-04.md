# Week 3 Release Memo and Sprint 4 Seed

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-06-04
Epic: SMK-115
Ticket: SMK-118 (W3-05)
Release owner: Engineering + Product + Growth

## Week 3 Shipped Scope

1. W3-01 Deterministic variant assignment
- Added deterministic variant assignment helper:
  - `src/lib/experiment-variants.ts`
- Wired tracked CTA events to ensure stable variant context:
  - `src/components/TrackLink.tsx`
- Extended event typing for `variant_key` coverage:
  - `src/lib/channel-metrics-events.ts`

1. W3-02 High-intent route coverage expansion
- Added tracked CTA instrumentation on:
  - `src/app/for-cio/page.tsx`
  - `src/app/for-coaches/page.tsx`

1. W3-03 Weekly segmented conversion readout
- Added Week 3 route x variant readout artifact and query pack:
  - `docs/strategy/week3/w3-03-weekly-segmented-conversion-readout-2026-06-04.md`

1. W3-04 Mobile QA and release readiness
- Added Week 3 mobile QA evidence artifact:
  - `docs/strategy/week3/w3-04-mobile-qa-and-release-readiness-2026-06-04.md`

## Release Validation

Required checks completed:
- [x] `npm run build` passed in release push flow.
- [x] `npm run test:e2e:mobile-ui:quick` passed (3 passed, 1 skipped).
- [x] `npm run test:e2e:mobile-routes` passed.
- [x] Push guardrails passed (guide freshness, growth gates, preflight build).

## Operating Decision

Decision: SHIP and monitor weekly

Rationale:
- Variant assignment is now deterministic and consistent by channel.
- Additional high-intent route CTA surfaces now include route context and variant-aware telemetry.
- QA and release guardrails show no blocking defects.

## Thresholds and Triggers

Keep-live thresholds:
- `variant_key` null rate <= 1% on key conversion events.
- No blocking mobile regressions in quick rubric.
- Stable or improving route-level CTA engagement trend.

Iterate or rollback triggers:
- Route-level CTA engagement declines > 10% for two consecutive readouts.
- Any route exceeds 1% null rate for `variant_key` on tracked conversion events.
- Blocking mobile regression appears on a conversion-critical path.

## Sprint 4 Seed Backlog

1. Build automated weekly route x variant KPI export to markdown snapshot.
1. Add alerting for variant-key null-rate threshold breaches by route.
1. Expand variant-aware instrumentation to executive persona and adjacent decision routes.
1. Add experiment guard tests that fail CI when route coverage drops below target.

## Decision Log

Current release outcome: GO
Next review date: next weekly conversion readout cycle
