# Internal Onboarding README (Engineer)

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: yes


Audience: New engineer with admin or owner access.

Goal: Get productive quickly using the internal guide artifacts and understand how major systems integrate.

## 0-30 Minutes: Fast Orientation

1. Open the internal summary first:
- docs/internal-system-summary.md
- Understand system shape: feature pages, APIs, libraries, scripts, workflows, migrations.

2. Open the internal guide artifact:
- docs/internal-guide.md
- Scan sections in this order: Architecture, API Surface, Infrastructure, Data and Migrations.

3. Open the internal guide app page:
- /dashboard/admin/internal-guide
- Run 2-3 chat questions to map key flows (example: onboarding events, billing flow, guide retrieval).

## 30-60 Minutes: Trace Core Product Paths

1. User-facing guide path:
- /guide
- src/app/guide/page.tsx
- src/app/guide/guide-client.tsx
- src/app/api/guide/chat/route.ts
- src/lib/guide-retrieval.ts

2. Internal guide path:
- /dashboard/admin/internal-guide
- src/app/(dashboard)/dashboard/admin/internal-guide/page.tsx
- src/app/(dashboard)/dashboard/admin/internal-guide/internal-guide-client.tsx
- src/app/api/admin/internal-guide/chat/route.ts
- scripts/internal-guide-sync.ts

3. Data and analytics path:
- supabase/migrations/124_guide_chat_analytics.sql
- guide_chat_queries / guide_chat_feedback tables
- docs/guide-retrieval-eval.latest.md

## 60-120 Minutes: Operate and Verify

1. Run guide generation and quality checks:
- npm run guide:user:sync
- npm run guide:user:check
- npm run guide:internal:sync
- npm run guide:internal:check
- npm run guide:retrieval:eval:strict

2. Review automation and CI wiring:
- .github/workflows/ci.yml
- .github/workflows/guide-sync.yml
- .github/workflows/guide-analytics-weekly.yml

3. Validate access boundaries:
- Internal guide page and chat should be admin/owner only.
- Customer guide should remain authenticated-user facing.

## Bigger Picture Integration Map

- App Routes: UI surfaces and workflows.
- API Routes: business orchestration and persistence.
- Lib Modules: retrieval/auth/analytics/domain logic.
- Scripts: artifact generation, evals, audits, exports.
- Workflows: CI gates + scheduled maintenance/reporting.
- Migrations: schema/RLS contracts for new capabilities.

## What This Is Not

- Not a substitute for reading route handlers before changing production logic.
- Not a security mechanism by itself (access control is in auth + staff role checks + RLS).
- Not an exhaustive runbook for every incident (use docs/sre/runbooks for operational incidents).

## First Ticket Recommendation

- Pick one contained flow (guide retrieval or onboarding events).
- Trace UI -> API -> lib -> data tables -> workflows.
- Add one small improvement and one test in the same area.
