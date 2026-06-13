# Code Synthetic Council Audit

Generated: 2026-06-13T14:08:03.922Z
Scope: 1570 code files across src, scripts, worker, tests

## Overall

- Score: 81
- Grade: B-
- Findings: 76

## Category Scores

| Category | Score |
| --- | ---: |
| correctness | 100 |
| security | 100 |
| maintainability | 82 |
| performance | 100 |
| testability | 0 |
| observability | 70 |
| typeSafety | 86 |
| complexity | 100 |
| deliveryRisk | 100 |

## Priority Fix Queue (Where To Fix First)

| File | Risk points |
| --- | ---: |
| src/app/(dashboard)/dashboard/admin/sales-enablement/SalesEnablementWorkspace.tsx | 8 |
| src/app/(dashboard)/dashboard/executive-brief/executive-brief-hub.tsx | 8 |
| src/app/api/admin/sales-enablement/workspace/route.ts | 7 |
| src/app/api/admin/social/mock-publish/route.ts | 7 |
| src/app/api/executive-brief/grill-me/route.ts | 7 |
| src/app/api/executive-brief/grill-me/sessions/route.ts | 7 |
| src/app/api/executive-brief/grill-me/sessions/[id]/respond/route.ts | 7 |
| src/app/api/executive-brief/transcription/route.ts | 7 |
| src/lib/onboarding-video-queue.ts | 7 |
| src/lib/outreach/send-queue.ts | 7 |
| src/app/(dashboard)/dashboard/admin/diagrams/diagrams-client.tsx | 4 |
| src/app/(dashboard)/dashboard/admin/diagrams/diagrams-data.ts | 4 |
| src/app/(dashboard)/dashboard/companies/[id]/company-competitive-field.tsx | 4 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-config.ts | 4 |
| src/app/(dashboard)/dashboard/dashboard-advanced-modules-section.tsx | 4 |

## Highest-Priority Findings (What To Fix)

| Severity | Area | File | Issue |
| --- | --- | --- | --- |
| high | type-safety | src/lib/onboarding-video-queue.ts | High any usage (7) |
| high | type-safety | src/lib/outreach/send-queue.ts | High any usage (12) |
| medium | testability | src/app/(dashboard)/dashboard/admin/diagrams/diagrams-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/diagrams/diagrams-data.ts | No obvious colocated or mirrored test file found |
| medium | maintainability | src/app/(dashboard)/dashboard/admin/sales-enablement/SalesEnablementWorkspace.tsx | Large file (565 lines) |
| medium | testability | src/app/(dashboard)/dashboard/admin/sales-enablement/SalesEnablementWorkspace.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/companies/[id]/company-competitive-field.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/companies/[id]/prep/prep-config.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-advanced-modules-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-decision-timeline-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-disclosure-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-path-welcome-card.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-pipeline-pulse.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-post-placement-view.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-primary-nav-sections.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-profile-intelligence-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-status-banners.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-top-shell-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-weekly-performance-section.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-welcome-nudge-section.tsx | No obvious colocated or mirrored test file found |

## Blind-Spot Companion Checks

- Import/parser corruption files: 0
- Placeholder baseline files: 334

| Largest Source Files | Lines |
| --- | ---: |
| src/lib/supabase/database.types.ts | 1429 |
| src/app/onboarding/onboarding-form.tsx | 1413 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 1407 |
| src/app/(dashboard)/dashboard/executive-brief/executive-brief-hub.tsx | 1176 |
| src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx | 1148 |
| src/app/(dashboard)/dashboard/admin/page.tsx | 1132 |
| src/app/(dashboard)/dashboard/outreach/outreach-hub-client.tsx | 1105 |
| src/app/(dashboard)/dashboard/admin/social/social-client.tsx | 1060 |

## Council Personas

- Principal Engineer: maintainability, architecture, coupling, complexity
- Security Engineer: unsafe evaluation, process execution, HTML injection vectors
- SRE and Observability Lead: logging and error-capture coverage on operational paths
- QA and Test Architect: source-to-test traceability and missing test surfaces
- Performance Engineer: expensive patterns and scalability-risk static signals

