# Code Synthetic Council Audit

Generated: 2026-05-31T03:58:15.443Z
Scope: 1431 code files across src, scripts, worker, tests

## Overall

- Score: 98
- Grade: A+
- Findings: 3

## Category Scores

| Category | Score |
| --- | ---: |
| correctness | 100 |
| security | 100 |
| maintainability | 96 |
| performance | 100 |
| testability | 100 |
| observability | 100 |
| typeSafety | 86 |
| complexity | 100 |
| deliveryRisk | 100 |

## Priority Fix Queue (Where To Fix First)

| File | Risk points |
| --- | ---: |
| src/lib/onboarding-video-queue.ts | 7 |
| src/lib/outreach/send-queue.ts | 7 |
| tests/e2e/synthetics.spec.ts | 4 |

## Highest-Priority Findings (What To Fix)

| Severity | Area | File | Issue |
| --- | --- | --- | --- |
| high | type-safety | src/lib/onboarding-video-queue.ts | High any usage (7) |
| high | type-safety | src/lib/outreach/send-queue.ts | High any usage (12) |
| medium | maintainability | tests/e2e/synthetics.spec.ts | Large file (605 lines) |

## Blind-Spot Companion Checks

- Import/parser corruption files: 0
- Placeholder baseline files: 292

| Largest Source Files | Lines |
| --- | ---: |
| src/app/onboarding/onboarding-form.tsx | 1500 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 1431 |
| src/lib/supabase/database.types.ts | 1429 |
| src/app/(dashboard)/dashboard/page.tsx | 1371 |
| src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx | 1148 |
| src/app/(dashboard)/dashboard/outreach/outreach-hub-client.tsx | 1105 |
| src/app/(dashboard)/dashboard/admin/social/social-client.tsx | 1060 |
| src/app/(dashboard)/dashboard/admin/page.tsx | 1039 |

## Council Personas

- Principal Engineer: maintainability, architecture, coupling, complexity
- Security Engineer: unsafe evaluation, process execution, HTML injection vectors
- SRE and Observability Lead: logging and error-capture coverage on operational paths
- QA and Test Architect: source-to-test traceability and missing test surfaces
- Performance Engineer: expensive patterns and scalability-risk static signals

