# Sprint 2 Channel Entry Experiment Plan

Date: 2026-05-24
Sprint: 2 (Landing and channel entry implementation)
Status: Active

## Objective

Run an A/B test on homepage channel entry messaging and measure channel click-through and persona-route pull-through for authenticated cohorts.

## Experiment

- Feature flag: NEXT_PUBLIC_CHANNEL_ENTRY_AB_TEST=1 (enable in staging)
- Variant assignment key: sm_channel_entry_variant (localStorage)
- Variants:
  - control
  - emphasis

## Events used

- channel_entry_clicked
- persona_route_selected

## Primary metrics

- Channel entry click-through by channel (authenticated)
- Persona selections per channel entry by channel
- Segment slices:
  - source_page
  - experiment_variant

## Baseline and target contract

- Baseline window: first 7 days after staging launch.
- Target window: days 8-14 after launch.
- Success thresholds:
  - No channel loses more than 10 percent relative entry clicks versus baseline.
  - At least one channel improves persona-per-entry by 10 percent relative.
  - Data completeness: less than 2 percent events missing channel or source_page.

## Dashboard

- Admin page: /dashboard/admin/channel-benchmarks
- Source: user_events (authenticated cohort only)

## Rollout gate

- Keep experiment in staging until at least 200 channel entry events are captured.
- Promote variant decision to production after Sprint 2 review.
