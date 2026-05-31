# 121_onboarding_video_automation_foundation rollback

Goal:
- Safely remove onboarding video automation foundation tables, policies, triggers, and helper functions if rollout causes tenant data integrity or write regressions.

Risk triggers:
- Onboarding video workflow/runs endpoints fail with policy or constraint errors.
- Event ingestion writes to onboarding video run events fail after release.
- Trigger-based updated_at writes cause unexpected update loops.

Pre-rollback safety checks:
- Export rows from public.onboarding_video_workflows, public.onboarding_video_runs, and public.onboarding_video_run_events.
- Pause any cron/worker paths that write onboarding video runs before rollback.
- Confirm no active backfill or replay process is writing to onboarding video tables.

Rollback SQL:
```sql
-- Remove triggers first
DROP TRIGGER IF EXISTS trg_onboarding_video_workflows_updated_at ON public.onboarding_video_workflows;
DROP TRIGGER IF EXISTS trg_onboarding_video_runs_updated_at ON public.onboarding_video_runs;

-- Remove trigger functions
DROP FUNCTION IF EXISTS public.touch_onboarding_video_workflows_updated_at();
DROP FUNCTION IF EXISTS public.touch_onboarding_video_runs_updated_at();

-- Remove policies
DROP POLICY IF EXISTS "Users manage their own onboarding video workflows" ON public.onboarding_video_workflows;
DROP POLICY IF EXISTS "Users manage their own onboarding video runs" ON public.onboarding_video_runs;
DROP POLICY IF EXISTS "Users manage their own onboarding video run events" ON public.onboarding_video_run_events;

-- Remove tables in dependency order
DROP TABLE IF EXISTS public.onboarding_video_run_events;
DROP TABLE IF EXISTS public.onboarding_video_runs;
DROP TABLE IF EXISTS public.onboarding_video_workflows;
```

Validation queries:
```sql
SELECT to_regclass('public.onboarding_video_workflows');
SELECT to_regclass('public.onboarding_video_runs');
SELECT to_regclass('public.onboarding_video_run_events');
```

Forward-fix plan:
- Re-apply migration 121 in staging after policy and trigger validation.
- Replay exported rows if rollback happened after partial production writes.
