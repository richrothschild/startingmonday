# Onboarding Event Integrity Agent Spec

Date: 2026-07-06
Owner: Engineering + Data
Status: Proposed

## Mission

Protect onboarding decision quality by validating telemetry completeness, sequence integrity, and schema consistency.

## Inputs

Primary table:
- user_events

Contracted events:
- auth_callback_completed
- auth_callback_profile_lookup_failed
- briefing_viewed
- briefing_first_session_guided_viewed
- onboarding_started
- onboarding_completed

## Checks (v1)

1. Required property completeness
- per event required-field missingness rates

2. Property type checks
- booleans and numeric fields validated against expected types

3. Sequence integrity checks
- onboarding_completed without onboarding_started
- guided view without briefing_viewed in same session window

4. Volume sanity checks
- sudden zero-volume on critical events
- duplicate spikes beyond normal variance

5. Redirect integrity checks
- auth_callback_completed redirect_path distribution
- suspicious onboarding redirects when explicit_next is true

## Detection Rules

- critical if required critical event volume drops to zero for 2 consecutive runs
- critical if missing required property rate exceeds 20 percent for auth_callback_completed or briefing_viewed
- warning if sequence anomaly rate exceeds 5 percent
- warning if suspicious onboarding redirect with explicit_next true is non-zero

## Output Contract

Emit findings with fields:
- finding_id
- generated_at
- severity
- event_name
- check_name
- anomaly_rate
- sample_size
- expected_contract_version
- recommendation

## Schedule

- every 15 minutes for schema and volume checks
- daily contract summary at 06:15

## Alert Policy

- critical: immediate alert with sample payload hints
- warning: daily digest plus trend chart in weekly report

## Technical Debt Controls

- central event contract registry in one module
- versioned contract schema with changelog
- strict parser utilities reused across checks
- no business-logic coupling to product UI code

## Test Requirements

- contract tests per event schema
- regression tests for known anomalies
- deterministic fixtures for sequence violations

## Failure Modes and Recovery

- schema drift due to deployment mismatch: emit critical, attach first failing payload key
- partial data lag: suppress criticals until lag window expires
- malformed payload bursts: cap sampled payload size in alerts
