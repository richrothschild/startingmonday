# Code Synthetic Council Audit

Generated: 2026-07-20T23:34:28.315Z
Scope: 2006 code files across src, scripts, worker, tests

## Overall

- Score: 87
- Grade: B+
- Findings: 161

## Category Scores

| Category | Score |
| --- | ---: |
| correctness | 100 |
| security | 100 |
| maintainability | 92 |
| performance | 100 |
| testability | 0 |
| observability | 100 |
| typeSafety | 100 |
| complexity | 100 |
| deliveryRisk | 100 |

## Priority Fix Queue (Where To Fix First)

| File | Risk points |
| --- | ---: |
| src/app/(dashboard)/dashboard/executive-brief/executive-brief-hub.tsx | 8 |
| src/app/(dashboard)/dashboard/admin/admin-dark-theme.ts | 4 |
| src/app/(dashboard)/dashboard/admin/diagrams/diagrams-client.tsx | 4 |
| src/app/(dashboard)/dashboard/admin/diagrams/diagrams-data.ts | 4 |
| src/app/(dashboard)/dashboard/admin/operations/wedge-economics/wedge-economics-client.tsx | 4 |
| src/app/(dashboard)/dashboard/admin/prep-efficacy/prep-efficacy-client.tsx | 4 |
| src/app/(dashboard)/dashboard/admin/sales-enablement/SalesEnablementWorkspace.tsx | 4 |
| src/app/(dashboard)/dashboard/admin/wedge-funnels/wedge-funnels-client.tsx | 4 |
| src/app/(dashboard)/dashboard/briefing/BriefingHeader.tsx | 4 |
| src/app/(dashboard)/dashboard/briefing/BriefingPulseSupport.tsx | 4 |
| src/app/(dashboard)/dashboard/companies/[id]/company-competitive-field.tsx | 4 |
| src/app/(dashboard)/dashboard/companies/[id]/company-fit-card.tsx | 4 |
| src/app/(dashboard)/dashboard/companies/[id]/company-offer-fields.tsx | 4 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-config.ts | 4 |
| src/app/(dashboard)/dashboard/contacts/linkedin-import-manager.tsx | 4 |

## Highest-Priority Findings (What To Fix)

| Severity | Area | File | Issue |
| --- | --- | --- | --- |
| medium | testability | src/app/(dashboard)/dashboard/admin/admin-dark-theme.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/diagrams/diagrams-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/diagrams/diagrams-data.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/operations/wedge-economics/wedge-economics-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/prep-efficacy/prep-efficacy-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/sales-enablement/SalesEnablementWorkspace.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/wedge-funnels/wedge-funnels-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/briefing/BriefingHeader.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/briefing/BriefingPulseSupport.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/companies/[id]/company-competitive-field.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/companies/[id]/company-fit-card.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/companies/[id]/company-offer-fields.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/companies/[id]/prep/prep-config.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/contacts/linkedin-import-manager.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/contacts/relationship-match-panel.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-activity-snooze.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-advanced-modules-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-campaign-foundation-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-decision-timeline-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-disclosure-section.tsx | No obvious colocated or mirrored test file found |

## Blind-Spot Companion Checks

- Import/parser corruption files: 0
- Placeholder baseline files: 334

| Largest Source Files | Lines |
| --- | ---: |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 1769 |
| src/app/onboarding/onboarding-form.tsx | 1695 |
| src/app/(dashboard)/dashboard/page.tsx | 1655 |
| src/lib/supabase/database.types.ts | 1487 |
| src/app/(dashboard)/dashboard/admin/page.tsx | 1279 |
| src/components/coach/client-data-view.tsx | 1193 |
| src/app/(dashboard)/dashboard/executive-brief/executive-brief-hub.tsx | 1176 |
| src/app/(dashboard)/dashboard/briefing/page.tsx | 1154 |

## Council Personas

- Principal Engineer: maintainability, architecture, coupling, complexity
- Security Engineer: unsafe evaluation, process execution, HTML injection vectors
- SRE and Observability Lead: logging and error-capture coverage on operational paths
- QA and Test Architect: source-to-test traceability and missing test surfaces
- Performance Engineer: expensive patterns and scalability-risk static signals

