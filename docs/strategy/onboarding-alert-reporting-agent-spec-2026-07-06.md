# Onboarding Alert and Reporting Agent Spec

Date: 2026-07-06
Owner: Product Ops + Engineering
Status: Proposed

## Mission

Route detections from onboarding agents to the right audience at the right urgency and produce periodic reports with clear ownership and decisions.

## Inputs

- Journey Health Agent findings
- Event Integrity Agent findings
- Existing scorecard artifacts (onboarding QA, Phase 4 consolidated scorecard)

## Responsibilities

1. Real-time alert routing
- critical alerts to on-call/internal channel
- warning alerts to daily digest

2. Alert deduplication and suppression
- dedupe key: check_name + event_name + severity + window
- cooldown windows to avoid repeat spam

3. Periodic reporting
- daily operational summary
- weekly executive summary with trend deltas and recommendations

4. Owner assignment
- map finding categories to owning team

## Alert Payload Contract

Required fields:
- alert_id
- generated_at
- severity
- source_agent
- title
- description
- owner_team
- runbook_link
- suggested_action
- affected_metric
- current_value
- baseline_value

## Report Outputs

1. Daily report
- critical and warning findings in last 24 hours
- open versus resolved counts
- top regressions and top recoveries

2. Weekly report
- trend lines for activation, TTFV, event integrity, and guided briefing rollout impact
- false-positive rate and alert-noise score
- decision recommendations and owner commitments

## SLOs

- critical alert delivery latency: <5 minutes
- daily report generation success: >=99 percent
- weekly report generation success: >=99 percent

## Technical Debt Controls

- one shared reporter for all agents
- one alert transport abstraction (no channel-specific logic in detection code)
- enforce payload schema validation before send
- maintain runbook links for all critical checks

## Test Requirements

- dedupe behavior tests
- cooldown enforcement tests
- payload validation tests
- report completeness tests

## Failure Modes and Recovery

- notification provider outage: queue and retry, then write fallback report artifact
- invalid finding payload: reject and emit reporter_contract_violation
- report generation partial failure: include degraded-status footer and missing sections list
