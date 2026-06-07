# Sprint 6 Onboarding Speed Scorecard

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-24
Sprint: 6

## Scope delivered

Sprint 6 focused on reducing time-to-first-value, guided onboarding by channel/persona, progressive setup defaults, implementation timer nudges, and low-energy completion mode.

Delivered components:
- Shared onboarding-speed model and scoring helpers:
  - src/lib/onboarding-speed.ts
- Onboarding flow upgrades (timer, checklist, channel path, low-energy mode):
  - src/app/onboarding/onboarding-form.tsx
  - src/app/onboarding/actions.ts
- Onboarding milestone telemetry route:
  - src/app/api/onboarding/events/route.ts
- Weekly onboarding QA scorecard automation endpoint:
  - src/app/api/admin/automation/reporting/onboarding-qa-scorecard/route.ts
- Admin onboarding QA scorecard page:
  - src/app/(dashboard)/dashboard/admin/onboarding/qa/page.tsx

## Data model updates

Migration:
- supabase/migrations/111_sprint6_onboarding_speed_qa.sql

New table:
- onboarding_qa_weekly_scorecards

## Acceptance mapping

- S6-001 Transition-first quickstart under 10 minutes: complete
  - Transition-first cohort detection is captured on completion events.
  - Under-10-minute first-value timing captured and reported in weekly scorecard.
- S6-002 Progressive setup defaults and autofill: complete
  - Persona/company defaults plus import/manual fallback now tracked with manual-field reduction rate.
  - Reduction metric computed and saved in onboarding completion analytics.
- S6-003 Guided onboarding by channel and persona: complete
  - Guided checklist now adapts by selected channel, persona state, and completion progress.
- S6-004 Implementation timer and milestone nudges: complete
  - Visible implementation timer and milestone progress shipped.
  - Nudge events emitted when users approach timing risk windows.
- S6-005 Cognitive-load reduction for low-energy mode: complete
  - Low-energy mode toggle removes non-critical path decisions and shortens completion path.

## QA thresholds used

PASS thresholds for weekly scorecard:
- under_ten_min_rate >= 70%
- avg_manual_fields_reduction_rate >= 40%
- completion conversion >= 60% of started users

Attention required if:
- median_seconds_to_first_value trends upward week-over-week
- low_energy_mode_rate remains below 10%
- nudge_coverage_rate climbs while completion conversion declines

## Operational review loop

Weekly review owner cadence:
- Product Ops reviews onboarding QA scorecard in /dashboard/admin/onboarding/qa.
- Growth Engineering reviews timer and nudge event patterns.
- UX reviews low-energy mode usage and completion outcomes.

## Notes

Sprint 6 prioritizes deterministic, instrumentation-first onboarding velocity improvements. The scorecard allows iterative UX tuning while preserving measurable outcomes by cohort and channel.
