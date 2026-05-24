# Code Synthetic Council Audit

Generated: 2026-05-24T16:35:04.939Z
Scope: 808 code files across src, scripts, worker, tests

## Overall

- Score: 64
- Grade: C-
- Findings: 524

## Category Scores

| Category | Score |
| --- | ---: |
| correctness | 100 |
| security | 100 |
| maintainability | 40 |
| performance | 100 |
| testability | 0 |
| observability | 0 |
| typeSafety | 64 |
| complexity | 73 |
| deliveryRisk | 100 |

## Priority Fix Queue (Where To Fix First)

| File | Risk points |
| --- | ---: |
| src/app/api/admin/b2b/material/route.ts | 9 |
| worker/jobs/signal-job.js | 9 |
| src/app/demo/cio/CioDemoClient.tsx | 8 |
| src/components/LandingPage.tsx | 8 |
| src/lib/supabase/database.types.ts | 8 |
| src/app/(dashboard)/dashboard/admin/intelligence/client.tsx | 7 |
| src/app/(dashboard)/dashboard/admin/speakers/speakers-client.tsx | 7 |
| src/app/(dashboard)/dashboard/partner/ExportCsvButton.tsx | 7 |
| src/app/api/admin/automation/billing/failed-payment-retries/route.ts | 7 |
| src/app/api/admin/automation/billing/invoices-receipts/route.ts | 7 |
| src/app/api/admin/automation/billing/payment-reconciliation-checks/route.ts | 7 |
| src/app/api/admin/automation/billing/plan-changes/route.ts | 7 |
| src/app/api/admin/automation/billing/refund-workflow-triggers/route.ts | 7 |
| src/app/api/admin/automation/billing/renewal-reminders/route.ts | 7 |
| src/app/api/admin/automation/billing/revenue-recognition-inputs/route.ts | 7 |

## Highest-Priority Findings (What To Fix)

| Severity | Area | File | Issue |
| --- | --- | --- | --- |
| medium | testability | src/app/(dashboard)/dashboard/admin/admin-charts.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/admin-page-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/admin-page-config.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/b2b/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/b2b/stage-select.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/b2b/[id]/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/b2b/[id]/material-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/crm/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/customers/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/intelligence/client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/metrics/metrics-charts.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/speakers/speakers-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/team/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/team/team-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/traces/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/traces/copy-command-button.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/traces/trace-shared.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/briefing/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/calendar/calendar-item.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/companies/new/actions.ts | No obvious colocated or mirrored test file found |

## Council Personas

- Principal Engineer: maintainability, architecture, coupling, complexity
- Security Engineer: unsafe evaluation, process execution, HTML injection vectors
- SRE and Observability Lead: logging and error-capture coverage on operational paths
- QA and Test Architect: source-to-test traceability and missing test surfaces
- Performance Engineer: expensive patterns and scalability-risk static signals

