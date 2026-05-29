# Sprint 5 Intelligence Quality Scorecard

Date: 2026-05-24
Sprint: 5
Status: Complete

## Scope delivered

Sprint 5 focused on signal quality, confidence scoring, persona relevance ranking, suppression rules, and a repeatable QA review loop.

Delivered components:
- Confidence scoring and persona-relevance ranking library:
  - src/lib/intelligence-quality.ts
- Signal enrichment at creation time:
  - src/app/api/signals/classify/route.ts
  - src/app/api/cron/edgar-signals/route.ts
- Persona-aware ranking and suppression in dashboard feed:
  - src/app/(dashboard)/dashboard/signals/page.tsx
- Public intelligence feed quality ranking:
  - src/lib/intelligence.ts
- Weekly QA scorecard automation endpoint:
  - src/app/api/admin/automation/reporting/intelligence-qa-scorecard/route.ts
- Admin QA scorecard dashboard:
  - src/app/(dashboard)/dashboard/admin/intelligence/qa/page.tsx

## Data model updates

Migration:
- supabase/migrations/110_sprint5_intelligence_quality.sql

New company_signals fields:
- profile_channel
- profile_persona
- relevance_score
- suppressed_at
- suppression_reason

New QA scorecard table:
- intelligence_qa_weekly_scorecards

## Acceptance mapping

- S5-001 Expand signal coverage by channel and persona: complete
  - Channel/persona profile metadata attached to newly generated signals.
  - Source-kind matrix captured by weekly QA scorecard.
- S5-002 Implement confidence scoring pipeline: complete
  - Deterministic confidence scoring added via source/evidence/recency model.
- S5-003 Persona-aware ranking logic: complete
  - Dashboard signals ranked with persona-aware relevance weighting.
- S5-004 False-positive and stale-signal suppression: complete
  - Duplicate, stale, and low-confidence suppression enabled in feed ranking.
- S5-005 Intelligence QA scorecard and review loop: complete
  - Weekly scorecard automation endpoint + admin review page delivered.

## QA thresholds used

PASS thresholds for weekly scorecard:
- source_coverage_rate >= 95%
- confidence_coverage_rate >= 95%
- false_positive_proxy_rate <= 8%

Attention required if:
- suppression_rate > 35%
- stale_rate increases week-over-week

## Operational review loop

Weekly review owner cadence:
- Product Ops reviews scorecard in /dashboard/admin/intelligence/qa.
- Intelligence Engineering reviews source_kind and channel matrix gaps.
- Data Engineering investigates regressions in confidence and suppression.

## Notes

The Sprint 5 implementation introduces a deterministic, explainable ranking model that can be iterated with model-driven scoring later without breaking current trust and auditability requirements.
