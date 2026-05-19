# Sprint-Ready Tickets: 90-Day Reliability Rollout

Format follows the existing ticket tracking pattern used in docs/sprint-backlog.md.

Estimate legend:

- XS: 1-2 hours
- S: 3-5 hours
- M: 6-10 hours
- L: 11-16 hours
- XL: 17-30 hours

---

## Sprint R1 (Days 0-30): Foundations

### Ticket R1.1: Instrument Route-Level Telemetry for All P0 Routes
- **Owner**: Backend engineer
- **Estimate**: L
- **Description**: Add structured logging and metric emission for all P0 page and API routes, including route, status, latency, correlation_id, deploy_sha, and user scope tags where appropriate.
- **Outcome**: Every P0 route emits consistent observability signals, enabling SLO computation and fast incident diagnosis.
- **Dependencies**: docs/sre/slo-catalog.md, logging middleware/hooks, telemetry backend write access.

### Ticket R1.2: Build P0 Reliability Dashboards
- **Owner**: SRE owner
- **Estimate**: M
- **Description**: Create dashboards for auth, optimize, feedback, contacts/calendar, outreach, and billing with request volume, error rate, latency, and saturation views.
- **Outcome**: On-call has one-click visibility into all P0 journeys and service health.
- **Dependencies**: Ticket R1.1 telemetry output, dashboard tooling access.

### Ticket R1.3: Implement SLO and Error-Budget Calculations
- **Owner**: SRE owner
- **Estimate**: M
- **Description**: Implement route-tier SLO rollups (P0/P1/P2), burn-rate views, and weekly reliability reporting aligned to the SLO catalog.
- **Outcome**: Reliability is managed with objective SLO and error-budget signals, not anecdotal reports.
- **Dependencies**: Ticket R1.1, Ticket R1.2, docs/sre/slo-catalog.md.

### Ticket R1.4: Configure Foundational Alerts from Alert Matrix
- **Owner**: SRE owner
- **Estimate**: L
- **Description**: Configure fast-burn, slow-burn, transaction, latency, and dependency alerts with severity routing and runbook links.
- **Outcome**: High-impact failures page quickly with actionable context and lower-noise routing.
- **Dependencies**: Ticket R1.1, docs/sre/alert-matrix.md, paging and Slack integrations.

### Ticket R1.5: Publish and Validate P0 Incident Runbooks
- **Owner**: Engineering lead
- **Estimate**: M
- **Description**: Instantiate runbook templates for auth failure, feedback submission failure, billing/webhook degradation, and follow-up lifecycle data drift; execute one dry run for each.
- **Outcome**: On-call can execute first-response steps consistently within target timelines.
- **Dependencies**: docs/sre/runbook-templates.md, docs/sre/incident-severity-policy.md.

### Ticket R1.6: Establish Weekly Reliability Review Cadence
- **Owner**: Engineering lead
- **Estimate**: S
- **Description**: Set weekly review agenda, scorecard template, and owner rotation for SLO attainment, burn, incidents, and alert quality.
- **Outcome**: Reliability work remains active and prioritized instead of reactive.
- **Dependencies**: Ticket R1.2, Ticket R1.3, Ticket R1.4.

---

## Sprint R2 (Days 31-60): Guardrails and Quality

### Ticket R2.1: Implement Synthetic-01 to Synthetic-04 (Core Auth and Feedback)
- **Owner**: QA/automation engineer
- **Estimate**: L
- **Description**: Build production synthetic checks for login page load, auth API signin, dashboard load, and feedback submission using synthetic account management.
- **Outcome**: Core sign-in and feedback regressions are detected within minutes.
- **Dependencies**: docs/sre/synthetic-tests-and-deploy-gates.md, synthetic test account and secret management.

### Ticket R2.2: Implement Synthetic-05 to Synthetic-08 (Optimize, Lifecycle, Billing, Webhooks)
- **Owner**: QA/automation engineer
- **Estimate**: XL
- **Description**: Build optimize, contact follow-up lifecycle, billing portal, and webhook readiness synthetic checks with cleanup and idempotency handling.
- **Outcome**: Business-critical non-auth flows are continuously validated in production.
- **Dependencies**: Ticket R2.1, docs/sre/synthetic-tests-and-deploy-gates.md, Stripe test event tooling.

### Ticket R2.3: Wire Synthetic Failures to Alerting and Incident Routing
- **Owner**: SRE owner
- **Estimate**: M
- **Description**: Route synthetic failures to the alert matrix severity tiers and include runbook links and deploy SHA context.
- **Outcome**: Synthetic failures become actionable incidents with clear ownership.
- **Dependencies**: Ticket R2.1, Ticket R2.2, Ticket R1.4.

### Ticket R2.4: Enforce Pre-Merge and Pre-Prod Deploy Gates
- **Owner**: Engineering lead
- **Estimate**: L
- **Description**: Make typecheck, unit/integration tests, preview E2E smoke, and pre-prod synthetic status blocking for production promotion.
- **Outcome**: Regressions are blocked before reaching production.
- **Dependencies**: CI workflow permissions, Ticket R2.1, Ticket R2.2.

### Ticket R2.5: Implement Post-Deploy Gates and Auto-Rollback Hooks
- **Owner**: SRE owner
- **Estimate**: L
- **Description**: Add post-deploy synthetic run, 15-minute watch window, and automatic rollback for failing P0 post-deploy checks.
- **Outcome**: Bad deploys self-mitigate quickly and consistently.
- **Dependencies**: Ticket R2.3, Ticket R2.4, deployment platform rollback support.

### Ticket R2.6: Expand UX Reliability E2E Matrix for Critical Forms
- **Owner**: QA/automation engineer
- **Estimate**: M
- **Description**: Add Playwright tests for password-manager autofill, session-expiry mid-flow, and double-submit/idempotency for feedback and outreach.
- **Outcome**: High-frequency UX failures are caught before users report them.
- **Dependencies**: Existing Playwright setup, synthetic account fixtures.

### Ticket R2.7: Add Data Integrity Anomaly Detectors and Reconciliation Scripts
- **Owner**: Backend engineer
- **Estimate**: L
- **Description**: Implement checks and scripts for closed-contact pending follow-up drift, duplicate pending follow-ups, and webhook lag reconciliation.
- **Outcome**: Data correctness incidents are proactively detected and repairable.
- **Dependencies**: Ticket R1.1, docs/sre/alert-matrix.md, DB admin access.

---

## Sprint R3 (Days 61-90): Mature Operations

### Ticket R3.1: Formalize On-Call Rotation and Escalation Runbook
- **Owner**: Engineering lead
- **Estimate**: S
- **Description**: Establish primary/secondary rotation schedule, handoff process, and escalation timings aligned to severity policy.
- **Outcome**: 24x7 incident ownership is unambiguous and consistent.
- **Dependencies**: docs/sre/incident-severity-policy.md.

### Ticket R3.2: Run Incident Simulation Game Day (Dependency Outage)
- **Owner**: SRE owner
- **Estimate**: M
- **Description**: Simulate third-party dependency failure and execute full incident flow, from alert to resolution and comms.
- **Outcome**: Team validates readiness under realistic outage conditions.
- **Dependencies**: Ticket R3.1, relevant runbooks from Ticket R1.5.

### Ticket R3.3: Run Incident Simulation Game Day (Data Integrity Incident)
- **Owner**: SRE owner
- **Estimate**: M
- **Description**: Simulate follow-up lifecycle drift or duplicate write incident and execute detection, containment, repair, and verification workflows.
- **Outcome**: Team validates data integrity response and repair speed.
- **Dependencies**: Ticket R2.7, runbooks from Ticket R1.5.

### Ticket R3.4: Operationalize Blameless Postmortem Governance
- **Owner**: Engineering lead
- **Estimate**: S
- **Description**: Standardize postmortem template, action-item SLA, and monthly recurrence review of top failure classes.
- **Outcome**: Incidents reliably produce measurable preventive improvements.
- **Dependencies**: docs/sre/incident-severity-policy.md, incident tracking board.

### Ticket R3.5: Complete Final Reliability Audit and Sign-Off
- **Owner**: Engineering lead
- **Estimate**: M
- **Description**: Audit route/page coverage, alert implementation, synthetic gate enforcement, and runbook completeness; publish compliance report.
- **Outcome**: 90-day program closes with formal reliability readiness sign-off.
- **Dependencies**: Tickets R1.1 through R3.4, docs/sre/operating-package.md.

---

## Suggested Owner Mapping (Initial)

1. Engineering lead: governance, gate policy, escalation policy, final sign-off
2. SRE owner: dashboards, SLOs, alerts, incident drills
3. Backend engineer: telemetry emitters, integrity checks, repair scripts
4. QA/automation engineer: synthetics and UX reliability automation

## Suggested Sequencing Constraints

1. Do not start Ticket R2.4 before Tickets R2.1 and R2.2 are stable.
2. Do not start Ticket R3 game days before Ticket R1.5 runbooks are validated.
3. Do not close the epic until Ticket R3.5 compliance report is published.