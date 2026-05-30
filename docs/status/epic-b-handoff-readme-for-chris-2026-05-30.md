# Epic B Handoff README for Chris

Date: 2026-05-30
Scope: Epic B closeout package with Epic A included for operational continuity

## 1. Purpose

This README provides a practical handoff for reviewing, operating, and extending the delivered work.

- Epic B: Partner Scale and Flywheel (Phase 1 and Phase 2 complete)
- Included context: Epic A onboarding video automation stack

## 2. Current State

### Epic B

- Phase 1 closeout status: PASS
- Phase 2 closeout status: PASS
- Last known verification in closeout docs:
  - Branch sync: PASS
  - Typecheck: PASS

### Epic A (included because Epic B handoff requested with Epic A context)

- A1-A6 delivered and validated
- Follow-on request items 1-3 delivered
- Latest Epic A extension commit: `2f2a2da`

## 3. Delivered Scope

### 3.1 Epic B delivered scope

Phase 1 and Phase 2 include:

- Partner KPI schema and reporting automation
- Sponsor export pipeline and dispatch logging
- Coach command center and weekly-review/action closure workflows
- Cohort roster model and outplacement cohort admin
- Partner provisioning import and seat lifecycle automation
- Provisioning SLA checks and retry QA automation
- Program template governance, packs, and adoption scorecards
- Value-lane pricing/entitlements, migration comms, and ARPU/conversion dashboards

Primary evidence docs:

- docs/status/epic-b-phase1-closeout.latest.md
- docs/status/epic-b-phase2-closeout.latest.md

### 3.2 Epic A delivered scope

Core chain (A1-A6) plus extensions:

- Data foundation and hardening migrations:
  - supabase/migrations/121_onboarding_video_automation_foundation.sql
  - supabase/migrations/122_onboarding_video_automation_hardening.sql
  - supabase/migrations/123_onboarding_video_webhook_events.sql
- Queue and processing:
  - src/lib/onboarding-video-queue.ts
  - src/app/api/cron/onboarding-video-worker/route.ts
  - worker/jobs/onboarding-video-job.js
  - worker/index.js
- Admin and API surfaces:
  - src/app/api/admin/automation/onboarding/video-queue/route.ts
  - src/app/api/admin/automation/onboarding/video-queue/[runId]/route.ts
- Webhooks:
  - src/app/api/webhooks/onboarding-video/route.ts
- Follow-on (provider + auto-enqueue + timeline UI):
  - src/lib/onboarding-video-provider.ts
  - src/app/api/onboarding/events/route.ts
  - src/app/(dashboard)/dashboard/admin/onboarding/video/page.tsx
  - src/app/(dashboard)/dashboard/admin/page.tsx

## 4. Commit Map

### Epic B

- Phase 1 closeout publication: `05b2bdc`
- Q2 Sprint 1 delivery: `13e6701`
- Q2 Sprint 2-4 delivery: `c887bf1`
- Phase 2 closeout publication: `ac3f0e3`

### Epic A

- A1 foundation/hardening: `fa7874a`
- A2 worker and queue route: `516799c`
- A3 webhook state sync: `53f22ca`
- A4 dedupe and normalized persistence: `138f527`
- A5 metrics persistence and timeout tuning: `7574514`
- A6 run-details endpoint: `58ed2f7`
- Requested 1-3 extensions: `2f2a2da`

## 5. How To Validate Quickly

Run from repo root:

1. `npm run typecheck`
2. `git rev-list --left-right --count origin/main...main`

Expected:

- Typecheck passes
- Branch sync output is `0 0`

## 6. Operational Entry Points

### Epic B operational surfaces

- Admin outplacement cohorts page:
  - /dashboard/admin/outplacement-cohorts
- Automation/reporting routes under:
  - /api/admin/automation/reporting/*

### Epic A operational surfaces

- Admin onboarding video timeline:
  - /dashboard/admin/onboarding/video
- Queue APIs:
  - /api/admin/automation/onboarding/video-queue
  - /api/admin/automation/onboarding/video-queue/[runId]
- Worker cron route:
  - /api/cron/onboarding-video-worker
- Provider webhook:
  - /api/webhooks/onboarding-video

## 7. Configuration Notes

### Epic A provider mode

- `ONBOARDING_VIDEO_PROVIDER_MODE`:
  - `mock` (safe default)
  - `live` (real provider dispatch)
- For live mode:
  - `HEYGEN_API_KEY` required
  - `HEYGEN_API_ENDPOINT` optional

## 8. Known Risks and Follow-Up

- Epic B closeout explicitly avoids asserting external load-test evidence where not attached.
- Epic A live provider mode requires environment readiness and webhook secret correctness.
- Recommend one post-handoff live fire drill for Epic A webhook completion path in production-like env.

## 9. Canonical Source List

- docs/status/epic-b-phase1-closeout.latest.md
- docs/status/epic-b-phase2-closeout.latest.md
- docs/status/epic-b-phase1-closeout.latest.json
- docs/status/epic-b-phase2-closeout.latest.json
- docs/sprint-ready-tickets-q2-2027-epic-b.md
