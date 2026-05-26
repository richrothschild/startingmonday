# Technical Debt Deep-Dive Audit

Generated: 2026-05-24T17:43:01.196Z

## Build Health

- Typecheck status: pass
- Lint status: pass
- Parser-corruption files: 0

## Test Debt

- Placeholder baseline count: 292
- Placeholder files currently present: 290

## Structural Hotspots

| File | Lines | TODO/FIXME |
| --- | ---: | ---: |
| src/lib/supabase/database.types.ts | 1420 | 0 |
| src/app/(dashboard)/dashboard/page.tsx | 1314 | 0 |
| src/app/onboarding/onboarding-form.tsx | 1281 | 0 |
| src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx | 1148 | 0 |
| src/app/(dashboard)/dashboard/admin/page.tsx | 1085 | 0 |
| src/app/(dashboard)/dashboard/admin/social/social-client.tsx | 1060 | 0 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 1039 | 0 |
| src/components/LandingPage.tsx | 910 | 0 |
| src/components/coach/client-data-view.tsx | 838 | 0 |
| src/components/ResumeTailor.tsx | 824 | 0 |
| src/app/demo/cio/CioPresentationClient.tsx | 789 | 0 |
| src/app/demo/cio/CioDemoClient.tsx | 787 | 0 |
| src/app/(dashboard)/dashboard/companies/[id]/page.tsx | 778 | 0 |
| worker/jobs/signal-job.js | 669 | 0 |
| scripts/refine-outreach-templates-by-council.mjs | 631 | 0 |
| src/app/api/prep/[id]/route.ts | 599 | 0 |
| src/app/for-outplacement/page.tsx | 598 | 0 |
| scripts/backfill-edgar-exec-history.mjs | 588 | 0 |
| src/app/(dashboard)/dashboard/outreach/outreach-hub-client.tsx | 587 | 0 |
| src/app/sales-marketing-plan/page.tsx | 581 | 0 |

## Dependency Drift

- Outdated package count: 6

| Package | Current | Wanted | Latest |
| --- | --- | --- | --- |
| @anthropic-ai/sdk | 0.91.1 | 0.91.1 | 0.98.0 |
| @types/node | 20.19.41 | 20.19.41 | 25.9.1 |
| eslint | 9.39.4 | 9.39.4 | 10.4.0 |
| react | 19.2.4 | 19.2.4 | 19.2.6 |
| react-dom | 19.2.4 | 19.2.4 | 19.2.6 |
| typescript | 5.9.3 | 5.9.3 | 6.0.3 |

