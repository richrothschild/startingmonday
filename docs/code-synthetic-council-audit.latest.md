# Code Synthetic Council Audit

Generated: 2026-05-24T16:16:42.885Z
Scope: 790 code files across src, scripts, worker, tests

## Overall

- Score: 54
- Grade: C-
- Findings: 691

## Category Scores

| Category | Score |
| --- | ---: |
| correctness | 100 |
| security | 100 |
| maintainability | 0 |
| performance | 100 |
| testability | 0 |
| observability | 0 |
| typeSafety | 64 |
| complexity | 0 |
| deliveryRisk | 100 |

## Priority Fix Queue (Where To Fix First)

| File | Risk points |
| --- | ---: |
| src/app/(dashboard)/dashboard/admin/social/social-client.tsx | 17 |
| src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx | 17 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 17 |
| src/app/demo/cio/CioPresentationClient.tsx | 17 |
| src/app/onboarding/onboarding-form.tsx | 17 |
| src/components/coach/client-data-view.tsx | 17 |
| src/components/ResumeTailor.tsx | 17 |
| src/app/demo/cio/CioDemoClient.tsx | 14 |
| src/components/LandingPage.tsx | 14 |
| src/app/(dashboard)/dashboard/admin/page.tsx | 13 |
| src/app/(dashboard)/dashboard/companies/[id]/page.tsx | 13 |
| src/app/(dashboard)/dashboard/contacts/[id]/outreach/outreach-client.tsx | 13 |
| src/app/(dashboard)/dashboard/page.tsx | 13 |
| src/app/api/prep/[id]/route.ts | 13 |
| src/lib/supabase/database.types.ts | 12 |

## Highest-Priority Findings (What To Fix)

| Severity | Area | File | Issue |
| --- | --- | --- | --- |
| high | maintainability | src/app/(dashboard)/dashboard/admin/page.tsx | Very large file (1085 lines) |
| high | maintainability | src/app/(dashboard)/dashboard/admin/social/social-client.tsx | Very large file (1060 lines) |
| high | maintainability | src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx | Very large file (1227 lines) |
| high | maintainability | src/app/(dashboard)/dashboard/companies/[id]/page.tsx | Very large file (778 lines) |
| high | maintainability | src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | Very large file (1039 lines) |
| high | maintainability | src/app/(dashboard)/dashboard/page.tsx | Very large file (1327 lines) |
| high | maintainability | src/app/demo/cio/CioDemoClient.tsx | Very large file (787 lines) |
| high | maintainability | src/app/demo/cio/CioPresentationClient.tsx | Very large file (789 lines) |
| high | maintainability | src/app/onboarding/onboarding-form.tsx | Very large file (1294 lines) |
| high | maintainability | src/components/coach/client-data-view.tsx | Very large file (838 lines) |
| high | maintainability | src/components/LandingPage.tsx | Very large file (910 lines) |
| high | maintainability | src/components/ResumeTailor.tsx | Very large file (824 lines) |
| high | maintainability | src/lib/supabase/database.types.ts | Very large file (1420 lines) |
| medium | testability | src/app/(dashboard)/dashboard/admin/admin-charts.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/admin-page-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/admin-page-config.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/b2b/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/b2b/stage-select.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/b2b/[id]/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/admin/b2b/[id]/material-client.tsx | No obvious colocated or mirrored test file found |

## Council Personas

- Principal Engineer: maintainability, architecture, coupling, complexity
- Security Engineer: unsafe evaluation, process execution, HTML injection vectors
- SRE and Observability Lead: logging and error-capture coverage on operational paths
- QA and Test Architect: source-to-test traceability and missing test surfaces
- Performance Engineer: expensive patterns and scalability-risk static signals

