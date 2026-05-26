# Code Synthetic Council Audit

Generated: 2026-05-25T14:37:16.648Z
Scope: 1223 code files across src, scripts, worker, tests

## Overall

- Score: 90
- Grade: A-
- Findings: 22

## Category Scores

| Category | Score |
| --- | ---: |
| correctness | 100 |
| security | 100 |
| maintainability | 100 |
| performance | 100 |
| testability | 32 |
| observability | 85 |
| typeSafety | 100 |
| complexity | 100 |
| deliveryRisk | 100 |

## Priority Fix Queue (Where To Fix First)

| File | Risk points |
| --- | ---: |
| src/app/api/admin/automation/reporting/intelligence-qa-scorecard/route.ts | 7 |
| src/app/api/admin/automation/reporting/onboarding-qa-scorecard/route.ts | 7 |
| src/app/api/billing/checkout/micro-product/route.ts | 7 |
| src/app/(dashboard)/dashboard/admin/product/catalog/actions.ts | 4 |
| src/app/(dashboard)/dashboard/dashboard-week-utils.ts | 4 |
| src/app/api/events/channel-funnel/route.ts | 4 |
| src/app/api/onboarding/events/route.ts | 4 |
| src/app/onboarding/onboarding-helpers.ts | 4 |
| src/app/proof/roi-calculator/roi-calculator-client.tsx | 4 |
| src/components/home/ChannelEntryStrip.tsx | 4 |
| src/components/micro-products/ChannelMicroProductRail.tsx | 4 |
| src/lib/channel-ia.ts | 4 |
| src/lib/channel-metrics-events.ts | 4 |
| src/lib/intelligence-quality.ts | 4 |
| src/lib/micro-products.ts | 4 |

## Highest-Priority Findings (What To Fix)

| Severity | Area | File | Issue |
| --- | --- | --- | --- |
| medium | testability | src/app/(dashboard)/dashboard/admin/product/catalog/actions.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/(dashboard)/dashboard/dashboard-week-utils.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/admin/automation/reporting/intelligence-qa-scorecard/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/admin/automation/reporting/onboarding-qa-scorecard/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/billing/checkout/micro-product/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/events/channel-funnel/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/api/onboarding/events/route.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/onboarding/onboarding-helpers.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/app/proof/roi-calculator/roi-calculator-client.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/components/home/ChannelEntryStrip.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/components/micro-products/ChannelMicroProductRail.tsx | No obvious colocated or mirrored test file found |
| medium | testability | src/lib/channel-ia.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/lib/channel-metrics-events.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/lib/intelligence-quality.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/lib/micro-products.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/lib/onboarding-speed.ts | No obvious colocated or mirrored test file found |
| medium | testability | src/lib/persona-routes.ts | No obvious colocated or mirrored test file found |
| medium | observability | src/app/api/admin/automation/reporting/intelligence-qa-scorecard/route.ts | API route lacks explicit logging/exception capture signal |
| medium | observability | src/app/api/admin/automation/reporting/onboarding-qa-scorecard/route.ts | API route lacks explicit logging/exception capture signal |
| medium | observability | src/app/api/admin/social/[id]/council-check/route.ts | API route lacks explicit logging/exception capture signal |

## Blind-Spot Companion Checks

- Import/parser corruption files: 0
- Placeholder baseline files: 292

| Largest Source Files | Lines |
| --- | ---: |
| src/app/onboarding/onboarding-form.tsx | 1488 |
| src/lib/supabase/database.types.ts | 1420 |
| src/app/(dashboard)/dashboard/page.tsx | 1314 |
| src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx | 1148 |
| src/app/(dashboard)/dashboard/admin/page.tsx | 1085 |
| src/app/(dashboard)/dashboard/admin/social/social-client.tsx | 1060 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 1039 |
| src/components/coach/client-data-view.tsx | 838 |

## Council Personas

- Principal Engineer: maintainability, architecture, coupling, complexity
- Security Engineer: unsafe evaluation, process execution, HTML injection vectors
- SRE and Observability Lead: logging and error-capture coverage on operational paths
- QA and Test Architect: source-to-test traceability and missing test surfaces
- Performance Engineer: expensive patterns and scalability-risk static signals

