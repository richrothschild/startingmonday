# Technical Debt Deep-Dive Audit

Generated: 2026-05-31T04:04:52.001Z

## Build Health

- Typecheck status: pass
- Lint status: fail
- Parser-corruption files: 0

## Test Debt

- Placeholder baseline count: 292
- Placeholder files currently present: 341

## Structural Hotspots

| File | Lines | TODO/FIXME |
| --- | ---: | ---: |
| src/app/onboarding/onboarding-form.tsx | 1500 | 0 |
| src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx | 1431 | 0 |
| src/lib/supabase/database.types.ts | 1429 | 0 |
| src/app/(dashboard)/dashboard/page.tsx | 1371 | 0 |
| src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx | 1148 | 0 |
| src/app/(dashboard)/dashboard/outreach/outreach-hub-client.tsx | 1105 | 0 |
| src/app/(dashboard)/dashboard/admin/social/social-client.tsx | 1060 | 0 |
| src/app/(dashboard)/dashboard/admin/page.tsx | 1039 | 0 |
| src/components/coach/client-data-view.tsx | 981 | 0 |
| src/components/ResumeTailor.tsx | 824 | 0 |
| src/app/demo/cio/CioPresentationClient.tsx | 789 | 0 |
| src/app/demo/cio/CioDemoClient.tsx | 787 | 0 |
| src/app/(dashboard)/dashboard/companies/[id]/page.tsx | 736 | 0 |
| src/app/(dashboard)/dashboard/outreach/outreach-data.ts | 710 | 0 |
| worker/jobs/signal-job.js | 669 | 0 |
| src/lib/outreach/send-queue.ts | 643 | 0 |
| scripts/refine-outreach-templates-by-council.mjs | 631 | 0 |
| src/app/api/prep/[id]/route.ts | 623 | 0 |
| tests/e2e/synthetics.spec.ts | 605 | 0 |
| src/lib/outreach/template-engine.cjs | 589 | 0 |

## Dependency Drift

- Outdated package count: 15

| Package | Current | Wanted | Latest |
| --- | --- | --- | --- |
| @anthropic-ai/sdk | 0.91.1 | 0.91.1 | 0.100.1 |
| @sentry/nextjs | 10.53.1 | 10.55.0 | 10.55.0 |
| @supabase/supabase-js | 2.106.0 | 2.106.2 | 2.106.2 |
| @types/node | 20.19.41 | 20.19.41 | 25.9.1 |
| @types/react | 19.2.14 | 19.2.15 | 19.2.15 |
| docx | 9.6.1 | 9.7.1 | 9.7.1 |
| eslint | 9.39.4 | 9.39.4 | 10.4.1 |
| posthog-js | 1.374.2 | 1.376.4 | 1.376.4 |
| posthog-node | 5.34.6 | 5.35.6 | 5.35.6 |
| react | 19.2.4 | 19.2.4 | 19.2.6 |
| react-dom | 19.2.4 | 19.2.4 | 19.2.6 |
| resend | 6.12.3 | 6.12.4 | 6.12.4 |
| stripe | 22.1.1 | 22.2.0 | 22.2.0 |
| typescript | 5.9.3 | 5.9.3 | 6.0.3 |
| vitest | 4.1.6 | 4.1.7 | 4.1.7 |

