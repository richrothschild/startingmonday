# Starting Monday Automation Guide

This guide documents the full automation system built across Tickets 1-56, including architecture, APIs, operations, monitoring, alerting, and runbooks.

Use this file as the source of truth for automation workflows, ownership, and operational response.

## How to use this guide

- Search by keyword in this file or on the Guide UI at /guide.
- Start with the section for your function area.
- Follow endpoint references and runbooks for day-to-day operations.

## Detailed feature guide

Core platform feature areas automated in this sprint:

- Lead scoring and CRM routing with execution logs.
- Outreach orchestration, sequencing, and suppression controls.
- Onboarding context capture, brief generation, and activation tracking.
- Customer operations: usage checks, health, triage, FAQ, and status reporting.
- Billing and revenue operations: plan lifecycle, reconciliation, and finance prep.
- Engineering operations: CI, lint/type checks, tests, deployment validation.
- Reporting layer: daily snapshots, KPI summaries, MBR packs, trends, council prep.

## Style guide

Implementation style patterns used across all automation APIs:

- App Router route handlers in src/app/api/admin/automation/**/route.ts.
- Explicit requireAuth call first in every non-webhook API route.
- Staff-only guard via requireStaffAutomationAccess.
- Return structured JSON with ok flags, ids, and explanatory fields.
- Persist every run into dedicated log/run tables for auditability.

## Marketing guide

Marketing automation relies on:

- Signal-aware pipeline reporting from status and trend runs.
- Weekly KPI summaries for campaign-level visibility.
- MBR and council prep documents for narrative-ready synthesis.

Recommended flow:

1. Pull weekly_kpi_summary_runs for campaign metrics.
2. Compare trend_report_runs period-over-period.
3. Export highlights into monthly_business_review_runs.

## Sales and outreach guide

Sales-facing automation endpoints include:

- /api/admin/automation/outreach/initial-sequences
- /api/admin/automation/outreach/follow-up-timing
- /api/admin/automation/outreach/classify-replies
- /api/admin/automation/outreach/book-from-replies
- /api/admin/automation/outreach/stalled-nudges
- /api/admin/automation/outreach/enforce-suppression
- /api/admin/automation/outreach/post-meeting-follow-up

How-to:

1. Run sequencing and timing endpoints as dry-runs when iterating message rules.
2. Confirm suppression and classification quality from stored run logs.
3. Track downstream booking and follow-up completion via reporting endpoints.

## Customer tracking guide

Customer tracking is powered by:

- usage_monitor_runs
- customer_health_checks
- customer_status_reports
- support_issue_triage
- help_center_routing_logs

How-to:

1. Run usage monitor and health checks first.
2. Generate status report payloads.
3. Route issues and help intents for response prioritization.

## Detailed code guide

Primary code locations:

- Automation APIs: src/app/api/admin/automation/
- Auth guard helper: src/lib/admin-automation-auth.ts
- CRM scoring and runner: src/lib/lead-scoring.ts and src/lib/lead-scoring-runner.ts
- Admin views: src/app/(dashboard)/dashboard/admin/

Routing conventions:

- One automation area per folder (billing, revenue-ops, engineering, reporting).
- One route.ts per operational function.
- Table-backed outputs for reproducibility.

## Operations guide

Operational functions and how-to list:

- Billing operations:
  - invoices-receipts
  - renewal-reminders
  - failed-payment-retries
  - revenue-recognition-inputs
  - refund-workflow-triggers
  - subscription-status-updates
  - payment-reconciliation-checks
- Revenue and bookkeeping operations:
  - stripe-supabase-accounting-sync
  - mismatch-flagging
  - revenue-classification
  - payout-matching
  - exception-reporting
  - bookkeeping-entry-preparation
- Engineering operations:
  - ci-checks
  - lint-typecheck
  - test-execution
  - release-notes
  - deployment-validation
  - error-monitoring
  - runtime-health-checks
  - scheduled-job-observability
- Reporting operations:
  - daily-operating-snapshots
  - weekly-kpi-summaries
  - monthly-business-review-packs
  - exception-lists
  - trend-reports
  - council-review-prep

## Observability and monitoring

Monitoring coverage now includes:

- Run-log tables for every automation endpoint.
- Automation alert table: automation_alerts.
- Trigger-based alerting on high-risk/failure states.
- Alert management API: /api/admin/automation/monitoring/alerts.

Alert triggers currently cover:

- lead_scoring_runs
- usage_monitor_runs
- customer_health_checks
- support_issue_triage
- plan_change_requests
- failed_payment_retry_runs
- payment_reconciliation_checks
- revenue_sync_runs
- revenue_mismatch_flags
- ci_check_runs
- lint_typecheck_runs
- test_execution_runs
- deployment_validation_runs
- error_monitoring_runs
- runtime_health_check_runs
- scheduled_job_observability_runs

## SRE guide

SRE practices used:

- Every automation endpoint is auditable via persisted runs.
- Alerting is centralized and queryable.
- Critical states are codified (failed, risk, critical, mismatch, degraded, late).
- Admin monitoring supports acknowledgment and resolution lifecycle.

Incident response checklist:

1. Query open automation alerts.
2. Group by source_table and severity.
3. Resolve root-cause in originating route or upstream dependency.
4. Mark resolved alerts after fix verification.

## Testing guide

Recommended checks after automation changes:

- Type and lint checks for modified route handlers.
- Endpoint-level smoke calls with dry-run options where available.
- Data-layer checks for expected table insertions.
- Alert validation for injected failure/risk scenarios.

## Repository guide

Repository structure relevant to automation:

- src/app/api/admin/automation/: operational APIs
- src/app/(dashboard)/dashboard/admin/: admin UI
- supabase/migrations/: schema and RLS evolution
- docs/: operational and business documentation

## Database structure and schema guide

Major migration milestones:

- 096: lead scoring CRM foundations.
- 097: Tickets 6-15 automation and execution logs.
- 098: Tickets 16-29 onboarding/customer-ops/billing tables.
- 099: Tickets 30-56 billing/revenue/engineering/reporting tables.
- 100: centralized monitoring and alerting for automation runs.

RLS model:

- Tables are user-scoped with user_id = auth.uid() policies.
- Admin/staff routes execute with authenticated cookie client and staff gate.

## Pricing and billing guide

Billing automation supports:

- Invoice and receipt run generation records.
- Renewal reminder scheduling and send logging.
- Failed payment detection and optional retry orchestration.
- Plan and subscription status transitions.
- Reconciliation checks and mismatch flagging.

## Revenue and finance guide

Revenue operations support:

- Revenue recognition input preparation.
- Stripe/Supabase/accounting sync run snapshots.
- Revenue classification by tier/segment payloads.
- Payout matching summaries and exception report generation.
- Bookkeeping entry preparation payloads for close workflows.

## Endpoint index for Tickets 30-56

- Billing:
  - /api/admin/automation/billing/invoices-receipts
  - /api/admin/automation/billing/renewal-reminders
  - /api/admin/automation/billing/failed-payment-retries
  - /api/admin/automation/billing/revenue-recognition-inputs
  - /api/admin/automation/billing/refund-workflow-triggers
  - /api/admin/automation/billing/subscription-status-updates
  - /api/admin/automation/billing/payment-reconciliation-checks
- Revenue ops:
  - /api/admin/automation/revenue-ops/stripe-supabase-accounting-sync
  - /api/admin/automation/revenue-ops/mismatch-flagging
  - /api/admin/automation/revenue-ops/revenue-classification
  - /api/admin/automation/revenue-ops/payout-matching
  - /api/admin/automation/revenue-ops/exception-reporting
  - /api/admin/automation/revenue-ops/bookkeeping-entry-preparation
- Engineering:
  - /api/admin/automation/engineering/ci-checks
  - /api/admin/automation/engineering/lint-typecheck
  - /api/admin/automation/engineering/test-execution
  - /api/admin/automation/engineering/release-notes
  - /api/admin/automation/engineering/deployment-validation
  - /api/admin/automation/engineering/error-monitoring
  - /api/admin/automation/engineering/runtime-health-checks
  - /api/admin/automation/engineering/scheduled-job-observability
- Reporting:
  - /api/admin/automation/reporting/daily-operating-snapshots
  - /api/admin/automation/reporting/weekly-kpi-summaries
  - /api/admin/automation/reporting/monthly-business-review-packs
  - /api/admin/automation/reporting/exception-lists
  - /api/admin/automation/reporting/trend-reports
  - /api/admin/automation/reporting/council-review-prep
- Monitoring:
  - /api/admin/automation/monitoring/alerts
