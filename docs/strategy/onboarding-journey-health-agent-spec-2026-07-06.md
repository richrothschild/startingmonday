# Onboarding Journey Health Agent Spec

Date: 2026-07-06
Owner: Product + Engineering
Status: Proposed

## Mission

Continuously detect onboarding and first-session journey regressions before they materially impact activation and retention.

## Inputs

Primary tables:
- users
- user_profiles
- user_events

Key events:
- onboarding_started
- onboarding_step_completed
- onboarding_first_value_ready
- onboarding_completed
- briefing_viewed
- briefing_first_session_guided_viewed

## Checks (v1)

1. Funnel conversion checks
- signup to onboarding_started
- onboarding_started to onboarding_completed
- onboarding_started to onboarding_first_value_ready

2. Time-to-first-value checks
- p50 and p90 for elapsed time where available
- under-10-minute share

3. Step drop-off checks
- completion coverage by step index
- largest abandonment step change versus trailing 7-day baseline

4. First-session briefing checks
- guided state exposure counts
- guided versus full distribution for eligible users

5. Retention proxy checks
- day-1 to day-7 return trend for new cohorts

## Detection Rules

Initial guardrails:
- critical if onboarding_started to onboarding_completed drops by >= 20 percent relative versus trailing 14-day baseline
- warning if p50 TTFV rises above 5 minutes for 2 consecutive daily runs
- warning if step-level drop-off worsens by >= 15 percent at any single step

## Output Contract

Emit findings with fields:
- finding_id
- generated_at
- severity
- metric_name
- current_value
- baseline_value
- delta_pct
- affected_window
- recommended_owner
- recommendation

## Schedule

- every 15 minutes for high-sensitivity checks
- daily rollup at 06:00 local reporting timezone

## Alert Policy

- critical: immediate alert
- warning: included in daily digest unless repeated 3 runs consecutively

## Technical Debt Controls

- no duplicated query logic across agents: use shared metric/query helpers
- all thresholds in one config object with versioned changes
- no hard-coded table/column strings outside contracts module
- tests for each check with synthetic fixtures

## Test Requirements

- unit tests for each detection rule
- integration test with sample event windows
- snapshot test for output payload stability

## Failure Modes and Recovery

- query timeout: emit agent_runtime_warning, do not page
- missing columns: emit schema_contract_violation critical
- empty windows: emit no_data info, no alert
