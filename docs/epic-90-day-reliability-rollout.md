# Epic: 90-Day Reliability Rollout (SRE + UX Quality)

Status: Proposed
Owner: Engineering Lead
Start date: 2026-05-20
Target end date: 2026-08-20

## Epic Goal

Implement the full 90-day reliability program so Starting Monday operates with enterprise-grade SRE, observability, and UX reliability controls.

## Success Criteria

1. P0 SLOs measured and reported weekly with >= 99.95% availability
2. Alert matrix implemented with < 5% noisy pager alerts per month
3. Production synthetic suite running every 5 minutes for P0 journeys
4. Deploy gate policy enforced in CI/CD with automatic rollback triggers
5. On-call rotation and runbook coverage for all P0 systems
6. Sev-1 MTTD <= 5 minutes and MTTR <= 30 minutes

## Scope

This epic implements all items defined in:

1. docs/sre/slo-catalog.md
2. docs/sre/alert-matrix.md
3. docs/sre/synthetic-tests-and-deploy-gates.md
4. docs/sre/runbook-templates.md
5. docs/sre/incident-severity-policy.md
6. docs/sre/sprint-ready-tickets-90-day-reliability.md

## Phase 1 (Days 0-30): Foundations

### Story R1.1: Instrument route-level telemetry for all P0 routes

Acceptance criteria:

1. Structured logs include route, status, latency, correlation id, deploy SHA
2. Metrics emitted per P0 route for request_count, error_count, p95 latency
3. Dashboards exist for auth, optimize, feedback, contacts/calendar, outreach, billing

### Story R1.2: Implement SLO computation and error-budget dashboards

Acceptance criteria:

1. SLOs calculated by route tier (P0/P1/P2)
2. Burn-rate panels exist for fast and slow windows
3. Weekly reliability review report template is live

### Story R1.3: Add foundational alerts from alert matrix

Acceptance criteria:

1. P0 fast-burn and slow-burn alerts configured
2. Auth, feedback, optimize, billing, and webhook alerts configured
3. All pager alerts include runbook link and owner tag

### Story R1.4: Create runbooks for top P0 incidents

Acceptance criteria:

1. Login failure runbook complete and tested
2. Feedback submission failure runbook complete and tested
3. Billing/Stripe incident runbook complete and tested
4. Follow-up lifecycle/data integrity runbook complete and tested

## Phase 2 (Days 31-60): Guardrails and Quality

### Story R2.1: Implement production synthetic suite v1

Acceptance criteria:

1. Synthetics 01-08 from spec are implemented
2. Two-region execution every 5 minutes
3. Synthetic failures create alerts with severity mapping

### Story R2.2: Enforce deploy gates in CI/CD

Acceptance criteria:

1. Pre-merge and pre-prod gates are blocking
2. Post-deploy synthetic checks run automatically
3. Automatic rollback triggers wired to gate failure conditions

### Story R2.3: Expand UX reliability test matrix for critical forms

Acceptance criteria:

1. Password-manager autofill tests for login/signup in Playwright
2. Session-expiry-mid-flow tests for feedback and contacts
3. Double-submit/idempotency tests for feedback and outreach send

### Story R2.4: Data integrity anomaly detection

Acceptance criteria:

1. Closed-contact pending follow-up drift alert in production
2. Duplicate pending follow-up detector in production
3. Reconciliation procedure documented and rehearsed

## Phase 3 (Days 61-90): Mature Operations

### Story R3.1: Formalize on-call and escalation operations

Acceptance criteria:

1. Primary/secondary rotation schedule published
2. Escalation and comms policy active
3. Pager drill completed with documented outcomes

### Story R3.2: Conduct reliability game days and failure drills

Acceptance criteria:

1. At least 2 game days executed
2. One dependency outage simulation and one data-integrity simulation
3. Runbook improvements from drills merged

### Story R3.3: Postmortem and corrective action governance

Acceptance criteria:

1. Blameless postmortem template in active use
2. Action items tracked to completion SLA
3. Monthly recurrence review of top failure classes

### Story R3.4: Final audit against operating package

Acceptance criteria:

1. 100% route/page inventory mapped to SLO tier rules
2. Alert matrix implemented and tested
3. Synthetic and deploy-gate compliance report produced
4. Policy sign-off by engineering lead

## Dependencies

1. Telemetry backend and alerting platform access
2. Synthetic execution environment with secure secrets
3. Dedicated synthetic test account set
4. CI/CD permission to block and rollback deploys

## Risks and Mitigations

1. Risk: alert noise overwhelms on-call
Mitigation: weekly alert tuning and severity audits

2. Risk: synthetic tests are flaky
Mitigation: deterministic test data + retry strategy + flaky test quarantine policy

3. Risk: limited team bandwidth for 24x7 response
Mitigation: strict Sev policy, escalation clarity, and staged on-call rollout

4. Risk: hidden data-model constraints break workflows
Mitigation: integrity checks and migration verification in deploy gates

## Milestones

1. M1 (Day 30): SLOs, dashboards, core alerts, runbooks complete
2. M2 (Day 60): synthetics and deploy gates enforced
3. M3 (Day 90): on-call operations, game days, final audit complete

## Definition of Done

1. All stories in phases 1-3 are accepted
2. Reliability scorecard is live and reviewed weekly
3. MTTR and MTTD targets are met for one full month
4. No open Sev-1 corrective actions older than 14 days
