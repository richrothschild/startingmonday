# Onboarding Agent Program Plan

Date: 2026-07-06
Owner: Product + Engineering + Data
Status: Proposed

## Purpose

Create a low-debt, observable agent layer that continuously monitors onboarding health, detects telemetry and flow failures, alerts on critical issues, and generates periodic executive-ready reports.

## Scope

In scope:
- first-session onboarding funnel and callback routing health
- event integrity for onboarding and briefing rollout telemetry
- alerting and periodic reporting from shared, canonical metrics

Out of scope:
- rewriting existing onboarding product logic
- introducing new persistence systems when existing user_events and scorecards are sufficient
- broad AI automation of remediation actions in v1

## Agent Set

1. Journey Health Agent
- Detect funnel and behavioral regressions.

2. Event Integrity Agent
- Detect telemetry quality and sequence integrity issues.

3. Alert and Reporting Agent
- Convert detections into actionable alerts and periodic summaries.

## Design Principles (Debt Prevention)

1. Single source of truth
- Read from canonical sources only: user_events, users, user_profiles, existing scorecards.

2. Contract-first event usage
- Every monitored event uses a typed contract and required property list.

3. Deterministic checks before ML checks
- Prefer threshold and sequence checks first; ML anomaly detection only after baseline stability.

4. No hidden side effects
- Agents observe and report only in v1. They do not auto-modify user state.

5. Alert hygiene
- Deduplicate, severity-tier, and enforce cooldown windows to avoid notification fatigue.

6. Reversible rollout
- All agent jobs and alerts behind feature flags and phase gates.

## Architecture

Data inputs:
- user_events
- users
- user_profiles
- existing onboarding QA scorecards

Processing:
- scheduled server routes or worker jobs every 15m and daily
- common detection library with reusable checks

Outputs:
- alert events (critical and warning)
- daily summary artifact
- weekly scorecard artifact

## Shared Detection Contracts

Required event names at launch:
- onboarding_started
- onboarding_step_completed
- onboarding_first_value_ready
- onboarding_completed
- auth_callback_completed
- auth_callback_profile_lookup_failed
- briefing_viewed
- briefing_first_session_guided_viewed

Required properties at launch:
- auth_callback_completed: redirect_path, explicit_next, first_login_needs_onboarding, auth_method
- briefing_viewed: first_session_guided_state, total_companies

## Severity Model

- critical: data corruption, missing critical events, broken funnel transitions, or >50 percent sudden drop in key conversion metric
- warning: threshold drift, partial property missingness, rising failure trend
- info: non-actionable trend notes for weekly reports

## Rollout Plan

Phase A (Week 1): shadow mode
- run checks, store outputs, no notifications
- validate false-positive rate and baseline ranges

Phase B (Week 2): warning notifications
- enable warning and critical alerts to internal channel
- enforce dedupe and cooldown policies

Phase C (Week 3): executive reporting
- weekly summary with trend deltas and owner recommendations

## Implementation Milestones

1. Build shared detection library and event contracts.
2. Implement Journey Health Agent checks.
3. Implement Event Integrity Agent checks.
4. Implement Alert and Reporting Agent routing.
5. Add runbooks and ownership matrix.

## Ownership and Operating Cadence

- Engineering: check correctness, uptime, and deployment safety
- Product/Data: threshold tuning and metric interpretation
- Weekly review: approve threshold changes and incident follow-ups

## Definition of Done

- agents run on schedule for 2 consecutive weeks without critical runtime failures
- critical alerts have owner, response playbook, and measured MTTA/MTTR
- weekly report generated automatically with no manual data stitching
- no unresolved high-noise alert loops
