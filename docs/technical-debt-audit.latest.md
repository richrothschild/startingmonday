# Technical Debt Deep-Dive Audit

Generated: 2026-06-06T03:37:47.122Z

## Build Health

- Typecheck status: pass
- Lint status: pass
- Parser-corruption files: 0

## Test Debt

- Placeholder baseline count: 334
- Placeholder files currently present: 332

## Structural Hotspots

| File | Lines | TODO/FIXME |
| --- | ---: | ---: |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 1431 | 0 |
| src/lib/supabase/database.types.ts | 1429 | 0 |
| src/app/onboarding/onboarding-form.tsx | 1413 | 0 |
| src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx | 1148 | 0 |
| src/app/(dashboard)/dashboard/admin/page.tsx | 1132 | 0 |
| src/app/(dashboard)/dashboard/outreach/outreach-hub-client.tsx | 1105 | 0 |
| src/app/(dashboard)/dashboard/admin/social/social-client.tsx | 1060 | 0 |
| src/components/coach/client-data-view.tsx | 981 | 0 |
| worker/jobs/signal-job.js | 831 | 0 |
| src/components/ResumeTailor.tsx | 824 | 0 |
| tests/e2e/synthetics.spec.ts | 815 | 0 |
| src/app/demo/cio/CioPresentationClient.tsx | 789 | 0 |
| src/app/demo/cio/CioDemoClient.tsx | 787 | 0 |
| src/app/(dashboard)/dashboard/companies/[id]/page.tsx | 742 | 0 |
| src/app/(dashboard)/dashboard/outreach/outreach-data.ts | 710 | 0 |
| src/app/(dashboard)/dashboard/page.tsx | 700 | 0 |
| src/app/api/prep/[id]/route.ts | 644 | 0 |
| src/lib/outreach/send-queue.ts | 643 | 0 |
| scripts/refine-outreach-templates-by-council.mjs | 631 | 0 |
| src/lib/executive-job-search.ts | 595 | 0 |

## Dependency Drift

- Outdated package count: 7

| Package | Current | Wanted | Latest |
| --- | --- | --- | --- |
| @anthropic-ai/sdk | 0.91.1 | 0.91.1 | 0.101.0 |
| @types/node | 20.19.41 | 20.19.42 | 25.9.2 |
| @types/react | 19.2.16 | 19.2.17 | 19.2.17 |
| eslint | 9.39.4 | 9.39.4 | 10.4.1 |
| posthog-js | 1.379.2 | 1.381.0 | 1.381.0 |
| posthog-node | 5.35.14 | 5.36.3 | 5.36.3 |
| typescript | 5.9.3 | 5.9.3 | 6.0.3 |

