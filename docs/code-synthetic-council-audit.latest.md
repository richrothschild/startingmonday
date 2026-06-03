# Code Synthetic Council Audit

Generated: 2026-06-03T02:31:41.838Z
Scope: 1466 code files across src, scripts, worker, tests

## Overall

- Score: 93
- Grade: A
- Findings: 15

## Category Scores

| Category | Score |
| --- | ---: |
| correctness | 100 |
| security | 100 |
| maintainability | 92 |
| performance | 100 |
| testability | 72 |
| observability | 88 |
| typeSafety | 86 |
| complexity | 100 |
| deliveryRisk | 100 |

## Priority Fix Queue (Where To Fix First)

| File | Risk points |
| --- | ---: |
| src/app/(dashboard)/dashboard/admin/sales-enablement/SalesEnablementWorkspace.tsx | 8 |
| src/app/api/admin/sales-enablement/workspace/route.ts | 7 |
| src/app/api/admin/social/mock-publish/route.ts | 7 |
| src/lib/onboarding-video-queue.ts | 7 |
| src/lib/outreach/send-queue.ts | 7 |
| src/app/api/admin/executive-research/health/route.ts | 4 |
| src/app/api/cron/executive-research-refresh/route.ts | 4 |
| src/app/mark-review/content.ts | 4 |
| src/lib/executive-research-library.ts | 4 |
| tests/e2e/synthetics.spec.ts | 4 |
| src/app/api/auth/verify-and-magic-link/route.ts | 3 |
| src/app/api/executive-transition/emotion-state/score/route.ts | 3 |

## Highest-Priority Findings (What To Fix)

| Severity | Area | File | Issue |
| --- | --- | --- | --- |
| high | type-safety | src/lib/onboarding-video-queue.ts | High any usage (7) |
| high | type-safety | src/lib/outreach/send-queue.ts | High any usage (12) |
| medium | maintainability | src/app/(dashboard)/dashboard/admin/sales-enablement/SalesEnablementWorkspace.tsx | Large file (565 lines) |
| medium | testability | src/app/(dashboard)/dashboard/admin/sales-enablement/SalesEnablementWorkspace.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/admin/executive-research/health/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/admin/sales-enablement/workspace/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/admin/social/mock-publish/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/cron/executive-research-refresh/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/mark-review/content.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/lib/executive-research-library.ts | No obvious colocated or mirrored test file found |
| medium | maintainability | tests/e2e/synthetics.spec.ts | Large file (815 lines) |
| medium | observability | src/app/api/admin/sales-enablement/workspace/route.ts | API route lacks explicit logging/exception capture signal |
| medium | observability | src/app/api/admin/social/mock-publish/route.ts | API route lacks explicit logging/exception capture signal |
| medium | observability | src/app/api/auth/verify-and-magic-link/route.ts | API route lacks explicit logging/exception capture signal |
| medium | observability | src/app/api/executive-transition/emotion-state/score/route.ts | API route lacks explicit logging/exception capture signal |

## Blind-Spot Companion Checks

- Import/parser corruption files: 0
- Placeholder baseline files: 338

| Largest Source Files | Lines |
| --- | ---: |
| src/app/onboarding/onboarding-form.tsx | 1598 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 1431 |
| src/lib/supabase/database.types.ts | 1429 |
| src/app/(dashboard)/dashboard/page.tsx | 1377 |
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

