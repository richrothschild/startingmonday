# 122_onboarding_video_automation_hardening rollback

Goal:
- Revert hardening constraints and trigger logic added for onboarding video run tenant integrity if they cause runtime write failures.

Risk triggers:
- Inserts/updates into onboarding_video_runs fail due retry bounds or composite FK enforcement.
- onboarding_video_run_events writes fail due trigger sync function behavior.
- RLS policy behavior changes block expected event reads/writes.

Pre-rollback safety checks:
- Capture recent failures from onboarding video run creation and event writes.
- Export newly inserted onboarding video run events since migration deployment.
- Pause event writers before applying rollback.

Rollback SQL:
```sql
-- Remove trigger first
DROP TRIGGER IF EXISTS trg_sync_onboarding_video_run_event_user ON public.onboarding_video_run_events;

-- Remove helper function
DROP FUNCTION IF EXISTS public.sync_onboarding_video_run_event_user();

-- Restore event policy from migration 121
DROP POLICY IF EXISTS "Users manage their own onboarding video run events" ON public.onboarding_video_run_events;
CREATE POLICY "Users manage their own onboarding video run events"
  ON public.onboarding_video_run_events
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Drop constraints and index added by hardening
ALTER TABLE public.onboarding_video_runs
  DROP CONSTRAINT IF EXISTS onboarding_video_runs_workflow_user_fk;

ALTER TABLE public.onboarding_video_runs
  DROP CONSTRAINT IF EXISTS onboarding_video_runs_retry_bounds_ck;

DROP INDEX IF EXISTS public.onboarding_video_workflows_id_user_idx;
```

Validation queries:
```sql
SELECT conname
FROM pg_constraint
WHERE conname IN (
  'onboarding_video_runs_workflow_user_fk',
  'onboarding_video_runs_retry_bounds_ck'
);

SELECT proname
FROM pg_proc
WHERE proname = 'sync_onboarding_video_run_event_user';
```

Forward-fix plan:
- Re-introduce constraints in staging with fixture data that covers all workflow/run/event edge cases.
- Re-enable hardening incrementally, starting with retry bounds then composite FK.
