# Development Tickets: EMI Artifact Implementation

Status: Active
Source artifacts: docs/strategy/emi-sprints/artifacts
Created: 2026-05-25

Board view:

1. docs/development/emi-engineering-board-now-next-later.md

Estimate legend:

- XS: 1-2 hours
- S: 3-5 hours
- M: 6-10 hours
- L: 11-16 hours
- XL: 17-30 hours

## Sprint 1 Artifact Conversion Tickets

### Ticket DEV-EMI-001: Implement EMI Positioning Runtime Surfaces
- Owner: Product Marketing + Frontend
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-1-emi-positioning-brief.md
- Description: Apply category claim, ICP, alternative framing, and message hierarchy to homepage, pricing, onboarding, and sales templates.
- Outcome: Production surfaces consistently use approved EMI positioning language.

### Ticket DEV-EMI-002: Implement Objection Handling Library in GTM Workflows
- Owner: Sales Ops
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-1-objection-library-v1.md
- Description: Convert objection responses into CRM snippets, call scripts, and email macros by segment.
- Outcome: Objection responses are operational in day-to-day GTM execution.

### Ticket DEV-EMI-003: Implement Trust Center Starter Pack as External-Facing Section
- Owner: Legal + Web
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-1-trust-center-starter-pack.md
- Description: Publish data boundaries, claims policy, and KPI definition summary in trust center pages and procurement packet.
- Outcome: Procurement and partner review can run from published trust controls.

### Ticket DEV-EMI-004: Implement Founder Narrative Kit Distribution Workflow
- Owner: Founder Office + Content Ops
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-1-founder-narrative-kit.md
- Description: Integrate five story blocks into publishing templates and speaker notes.
- Outcome: Founder content uses standardized narrative blocks.

### Ticket DEV-EMI-005: Automate Template Audit Checks
- Owner: Revenue Ops
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-1-template-audit-checklist.md
- Description: Build checklist workflow in content and sales QA process with signoff recording.
- Outcome: Category compliance is auditable before publication.

## Sprint 2 Artifact Conversion Tickets

### Ticket DEV-EMI-101: Build EMI Assessment Flow in Product
- Owner: Product + Engineering
- Estimate: L
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-2-emi-assessment-flow.md
- Description: Implement assessment step flow, persona capture, required-field handling, and scoring submission.
- Outcome: Assessment v1 is usable in production.

### Ticket DEV-EMI-102: Build Segmented Results Experience
- Owner: Product Design + Frontend
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-2-segmented-results-page.md
- Description: Implement score-band output with persona-specific actions and onboarding CTA.
- Outcome: Users receive actionable post-assessment guidance.

### Ticket DEV-EMI-103: Implement Assessment Funnel Telemetry
- Owner: Engineering + Data
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-2-funnel-analytics-dashboard.md
- Description: Instrument all funnel events, persona segmentation, and dropoff analytics.
- Outcome: Completion and conversion bottlenecks are measurable.

### Ticket DEV-EMI-104: Ship Assessment Launch Campaign Runtime Assets
- Owner: Marketing
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-2-launch-campaign-pack.md
- Description: Implement launch page, outbound variants, and partner launch templates.
- Outcome: Campaign assets are deployable and trackable.

### Ticket DEV-EMI-105: Automate Sprint 2 Gate Metric Snapshot
- Owner: Data
- Estimate: XS
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-2-exit-metrics-snapshot.md
- Description: Create query-backed weekly export for completion, clickthrough, and handoff latency metrics.
- Outcome: Gate metrics are generated from production data on schedule.

## Sprint 3 Artifact Conversion Tickets

### Ticket DEV-EMI-201: Build One-Screen Daily Loop UI
- Owner: Product + Frontend
- Estimate: L
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-3-daily-loop-screen-spec.md
- Description: Implement daily plan surface with three actions, completion toggles, and reflection prompt.
- Outcome: Daily momentum actions are executable in one view.

### Ticket DEV-EMI-202: Build 72-Hour Recovery Protocol Flow
- Owner: Product + Backend
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-3-recovery-protocol-72-hour.md
- Description: Implement day-based protocol, completion tracking, and handoff to weekly plan.
- Outcome: Displaced users receive immediate structured recovery.

### Ticket DEV-EMI-203: Build Optionality Mode Controls
- Owner: Product + Backend
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-3-optionality-mode-spec.md
- Description: Implement low-noise mode, weekly checkpoints, and strategic signal filtering.
- Outcome: In-role users can run low-noise cadence mode.

### Ticket DEV-EMI-204: Implement Momentum Observability Dashboards
- Owner: Engineering + SRE
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-3-observability-dashboard-spec.md
- Description: Build dashboard panels and alert routing for loop reliability and recovery funnel visibility.
- Outcome: Failed journeys are diagnosable within operational targets.

### Ticket DEV-EMI-205: Automate Sprint 3 KPI Export
- Owner: Data
- Estimate: XS
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-3-exit-metrics-snapshot.md
- Description: Build export for day-7 return and loop completion metrics with timestamp metadata.
- Outcome: Sprint gate metrics are query-derived and reproducible.

## Sprint 4 Artifact Conversion Tickets

### Ticket DEV-EMI-301: Build Coach Shared-View Digest Experience
- Owner: Product + Frontend
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-4-coach-shared-view-digest.md
- Description: Implement weekly coach digest with intervention prompts and momentum summary.
- Outcome: Coaches can prepare sessions without manual context rebuild.

### Ticket DEV-EMI-302: Implement Outplacement Pilot Runbook Workflow
- Owner: Partnerships Ops
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-4-outplacement-pilot-runbook.md
- Description: Convert runbook into checklist workflow with owner assignments and escalation paths.
- Outcome: Pilot launches can run consistently without founder dependency.

### Ticket DEV-EMI-303: Build ROI Calculator Tooling
- Owner: Revenue Ops + Data
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-4-roi-calculator-model.md
- Description: Implement cohort and margin model calculator with conservative scenario defaults.
- Outcome: Proposal economics are standardized and comparable.

### Ticket DEV-EMI-304: Build Counselor Command View
- Owner: Product Design + Frontend
- Estimate: L
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-4-counselor-command-view-spec.md
- Description: Implement counselor queue, intervention prompts, and weekly export panel.
- Outcome: Counselor workflow is low-admin and high-visibility.

### Ticket DEV-EMI-305: Implement Pilot-Ready Opportunity Board
- Owner: Partnerships
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-4-pilot-ready-opportunities.md
- Description: Build board view for pilot package completion and readiness status.
- Outcome: Pilot pipeline progression is visible and auditable.

### Ticket DEV-EMI-306: Automate Sprint 4 KPI Export
- Owner: Data
- Estimate: XS
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-4-exit-metrics-snapshot.md
- Description: Create recurring export for pilot-ready count and partner channel KPIs.
- Outcome: Sprint gate data is timestamped and reproducible.

## Sprint 5 Artifact Conversion Tickets

### Ticket DEV-EMI-401: Enforce Benchmark Methodology Validation in Pipeline
- Owner: Data Engineering
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-benchmark-methodology.md
- Description: Implement guardrails that block publication outputs missing denominator, timeframe, or confidence fields.
- Outcome: Tier-1 claims cannot publish without required evidence fields.

### Ticket DEV-EMI-402: Implement Benchmark Pipeline Run-Log Automation
- Owner: Engineering
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-benchmark-pipeline-run-log.md
- Description: Auto-generate freshness and quality check logs per run.
- Outcome: Pipeline reliability and freshness are operationally traceable.

### Ticket DEV-EMI-403: Build Proof Asset Publishing Workflow
- Owner: Content Ops
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-proof-artifacts-index.md
- Description: Implement structured publishing workflow for benchmark proof assets.
- Outcome: Proof artifacts can be produced and tracked consistently.

### Ticket DEV-EMI-404: Implement Recovery Velocity Proof Data Feed
- Owner: Data
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-proof-asset-01-recovery-velocity.md
- Description: Build query and export for recovery velocity benchmark.
- Outcome: Recovery velocity claim is backed by automated data feed.

### Ticket DEV-EMI-405: Implement Cadence and Day-7 Proof Data Feed
- Owner: Data
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-proof-asset-02-cadence-day7.md
- Description: Build query and export for first-week adherence vs day-7 return benchmark.
- Outcome: Cadence-retention claim is reproducible.

### Ticket DEV-EMI-406: Implement Coach Uplift Proof Data Feed
- Owner: Data + Partnerships Analytics
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-proof-asset-03-coach-uplift.md
- Description: Build coach vs control cohort comparison query and confidence labeling.
- Outcome: Coach-linked uplift claim is query-backed.

### Ticket DEV-EMI-407: Implement GTM Proof Sequence in CRM
- Owner: Sales Ops
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-gtm-proof-sequence.md
- Description: Add proof-first sequence templates and segment mapping in CRM workflows.
- Outcome: Sales process consistently uses benchmark proof assets.

### Ticket DEV-EMI-408: Implement Tier-1 Claim Compliance Audit Job
- Owner: Data + Legal Ops
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-tier1-claim-compliance-audit.md
- Description: Build scheduled audit that flags non-compliant tier-1 claims.
- Outcome: Claim compliance is continuously monitored.

### Ticket DEV-EMI-409: Automate Sprint 5 Exit Metrics Export
- Owner: Data
- Estimate: XS
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-5-exit-metrics-snapshot.md
- Description: Export and timestamp KPI summary required for sprint gate review.
- Outcome: Gate metrics are generated from production telemetry.

## Sprint 6 Artifact Conversion Tickets

### Ticket DEV-EMI-501: Build Top-10 Objection KPI Dashboard
- Owner: GTM Ops + Data
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-6-top10-objection-kpi-panel.md
- Description: Implement dashboard view and owner-level alerting for objection KPIs.
- Outcome: Objection conversion tuning is operationalized weekly.

### Ticket DEV-EMI-502: Implement EMI SLO Monitoring and Alerts
- Owner: SRE + Engineering
- Estimate: L
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-6-emi-slo-document.md
- Description: Wire SLO targets and alert thresholds into production monitoring.
- Outcome: EMI critical-flow reliability is enforced.

### Ticket DEV-EMI-503: Implement Q4 Cadence Automation
- Owner: PMO + Operations
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-6-q4-operating-cadence.md
- Description: Set recurring meetings, owner reminders, and review checklist automation.
- Outcome: Weekly, monthly, and quarterly governance runs without drift.

### Ticket DEV-EMI-504: Implement Capstone Report Generation Workflow
- Owner: PMO + Data
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-6-capstone-report.md
- Description: Build template-driven capstone generation using sprint KPI feeds.
- Outcome: End-of-cycle reporting is consistent and fast.

### Ticket DEV-EMI-505: Implement Success Criteria Audit Automation
- Owner: PMO + Data
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/sprint-6-final-success-criteria-audit.md
- Description: Build automatic pass/fail scoring for epic success criteria from KPI queries.
- Outcome: Epic closure decisions are query-driven and reproducible.

## Schema Alignment and Validation Hardening Tickets

### Ticket DEV-EMI-601: Add Canonical EMI KPI Snapshot Table
- Owner: Data Engineering
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql
- Description: Create a canonical `emi_kpi_snapshots` table (metric_name, metric_value, metric_window, source_table, generated_at) and backfill from existing weekly summary payloads.
- Outcome: Q1 through Q6 read from one stable KPI contract without JSON-key drift.

### Ticket DEV-EMI-602: Emit Assessment and Onboarding Events to Canonical Event Names
- Owner: Product Engineering
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql
- Description: Ensure server-side emission of `emi_assessment_started`, `emi_assessment_completed`, and `emi_onboarding_started` events into `user_events` for all relevant flows.
- Outcome: Q2 and Q3 compute from live telemetry without null denominators caused by missing event names.

### Ticket DEV-EMI-603: Add Proof Asset Registry Table and Publisher Workflow
- Owner: Content Ops + Data
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql
- Description: Create `proof_assets` table with `status`, `denominator`, `timeframe`, `confidence_label`, and publishing metadata; wire publishing workflow to maintain it.
- Outcome: Q4 is sourced from first-class production records instead of fallback heuristics.

### Ticket DEV-EMI-604: Normalize B2B Pilot Stage Model
- Owner: Partnerships Engineering
- Estimate: S
- Artifact: docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql
- Description: Add explicit `qualified_at`, `pilot_approved_at`, and standardized stage transitions on `b2b_prospects`.
- Outcome: Q5 reflects true pilot conversion semantics instead of approximate stage mapping.

### Ticket DEV-EMI-605: Add Tier-1 Claim Compliance Table and Audit Job
- Owner: Data + Legal Ops
- Estimate: M
- Artifact: docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql
- Description: Create `tier1_claims` with required evidence fields and schedule compliance audit writes.
- Outcome: Q6 is computed from auditable claim-level evidence records.

### Ticket DEV-EMI-606: Add Weekly Validation Rerun Job and Alerting
- Owner: Data Platform
- Estimate: XS
- Artifact: docs/strategy/emi-sprints/artifacts/emi-production-validation-rerun-procedure.md
- Description: Automate Friday query-pack execution, export generation, and manifest drift alerts when KPIs diverge from published scorecards.
- Outcome: Weekly validation is repeatable and exception-driven.

## Execution Notes

1. Prioritize tickets DEV-EMI-401, DEV-EMI-402, DEV-EMI-408, DEV-EMI-502 for production trust and reliability.
2. Pair DEV-EMI-103, DEV-EMI-204, DEV-EMI-409, and DEV-EMI-505 under one analytics owner for consistency.
3. Treat all XS/S automation tickets as immediate follow-ups in the next two development cycles.

## Execution Progress Update (2026-06-19)

1. DEV-EMI-410: Completed.
	- Live smoke pass captured in production with `validationStatus=ok`, `mismatchCount=0`, `nullStreakCount=0`.
2. DEV-EMI-601: Completed in repo.
	- Canonical `emi_kpi_snapshots` table and write policy migrations are present and active in reporting routes.
3. DEV-EMI-602: Completed in repo.
	- Canonical event fan-out now guarantees `emi_assessment_started`, `emi_onboarding_started`, and `emi_assessment_completed` population from onboarding flows.
4. DEV-EMI-603: Completed in repo.
	- `proof_assets` is canonical source for proof KPI in weekly snapshots, with publisher workflow route `src/app/api/admin/automation/reporting/proof-asset-publisher/route.ts` and tests in `src/app/api/admin/automation/reporting/proof-asset-publisher/route.test.ts`.
5. DEV-EMI-604: Completed in repo.
	- `qualified_at` / `pilot_approved_at` fields are present on `b2b_prospects` for normalized pilot conversion modeling.
6. DEV-EMI-605: Completed in repo.
	- `tier1_claims` is canonical source for compliance KPI, with audit workflow route `src/app/api/admin/automation/reporting/tier1-claim-compliance-audit/route.ts` and tests in `src/app/api/admin/automation/reporting/tier1-claim-compliance-audit/route.test.ts`.
7. DEV-EMI-606: Completed in repo.
	- Weekly validation rerun route and observability-run logging are implemented for automated drift tracking.
8. DEV-EMI-407: Completed in repo.
	- GTM proof sequence integration is implemented via `src/app/api/admin/automation/reporting/gtm-proof-sequence/route.ts` with coverage in `src/app/api/admin/automation/reporting/gtm-proof-sequence/route.test.ts`.
9. DEV-EMI-409: Completed in repo.
	- Sprint 5 exit metrics export includes observability logging and automated run IDs through `src/app/api/admin/automation/reporting/sprint-5-exit-metrics/route.ts`.
10. DEV-EMI-503: Completed in repo.
	- Q4 cadence automation is implemented via `src/app/api/admin/automation/reporting/q4-cadence-automation/route.ts` with route tests.
11. DEV-EMI-504: Completed in repo.
	- Capstone report generation automation is implemented via `src/app/api/admin/automation/reporting/capstone-report-generation/route.ts` with route tests.
12. DEV-EMI-505: Completed in repo.
	- Success criteria audit automation is implemented via `src/app/api/admin/automation/reporting/success-criteria-audit-automation/route.ts` with route tests and threshold scoring.
