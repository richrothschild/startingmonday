# Week 2 Release Package and Decision Memo

Date: 2026-06-04
Epic: SMK-108
Ticket: SMK-114 (W2-06)
Release owner: Engineering + Product + Growth

## Week 2 Shipped Scope

1. W2-01 BLUF expansion on coach entry pages
- Added tracked BLUF accordion sections to:
  - `src/app/coaches/page.tsx`
  - `src/app/for-coaches/page.tsx`

1. W2-02 Proof modules in decision zones
- Added reusable proof-highlight module support in:
  - `src/components/LandingPage.tsx`
- Added route-level proof entries in:
  - `src/app/page.tsx`
  - `src/app/for-executives/page.tsx`

1. W2-03 CTA variant telemetry context
- Added `variant_key` to key executive and coach CTA event payloads:
  - `executive_proof_v1`
  - `coach_bluf_v1`

1. W2-04 / W2-05 artifacts
- Telemetry schema and coverage contract documented.
- Mobile-first QA evidence completed and recorded.

## Release Validation

Required release checks completed:
- [x] Build and type checks passed (`npm run build`).
- [x] Mobile quick rubric passed (`npm run test:e2e:mobile-ui:quick`).
- [x] Mobile route coverage command completed (`npm run test:e2e:mobile-routes`).
- [x] Repository push guardrails passed (guide freshness, growth gates, preflight build).

## Operating Decision

Decision: SHIP and monitor

Rationale:
- Conversion surfaces now have stronger proof placement and clearer progressive disclosure.
- Event payloads now include variant context for Week 2 CTA analysis.
- Mobile QA and build gates show no blocking defects.

## Weekly Operating Cadence (Post-release)

Cadence: weekly, Mondays

Owners:
- Product: decision and prioritization owner
- Engineering: implementation and instrumentation owner
- Growth: readout and KPI owner

Required weekly checks:
1. Variant-key event coverage by route.
2. BLUF interaction volume and open/close behavior.
3. CTA click-through trend on executive and coach entry pages.
4. Mobile rubric quick suite health.

## Thresholds and Triggers

Ship/keep thresholds:
- Variant-key null rate: <= 1%
- BLUF interaction events present on all Week 2 target routes
- No release-blocking mobile rubric failures

Rollback or iterate triggers:
- CTA click-through drops > 15% week-over-week on modified route
- Variant-key missing on key conversion events
- New blocking mobile regression in quick rubric checks

## Next Sprint Backlog Seeds

1. Introduce deterministic experiment assignment per session/user for variant routing.
2. Expand proof module testing across additional persona/channel landing surfaces.
3. Build a lightweight weekly conversion dashboard filtered by `variant_key`.
4. Add explicit non-blocking skip reason tracking for mobile rubric skipped scenarios.

## Decision Log

Current release outcome: GO
Next review date: next weekly conversion review cycle
