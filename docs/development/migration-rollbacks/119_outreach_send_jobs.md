# 119_outreach_send_jobs rollback

Goal:
- Remove outreach queue schema if release causes queue processing or policy regressions.

Risk triggers:
- Job enqueue/dequeue flow fails after migration.
- Trigger/function updates create write failures on outreach_send_jobs or outreach_send_batches.

Pre-rollback safety checks:
- Export queued and in-flight rows from outreach_send_jobs and outreach_send_batches.
- Pause worker/cron loop before rollback to prevent partial writes during teardown.

Rollback SQL:
```sql
-- remove triggers first
DROP TRIGGER IF EXISTS trg_outreach_send_jobs_updated_at ON public.outreach_send_jobs;
DROP TRIGGER IF EXISTS trg_outreach_send_batches_updated_at ON public.outreach_send_batches;

-- remove helper functions
DROP FUNCTION IF EXISTS public.touch_outreach_send_jobs_updated_at();
DROP FUNCTION IF EXISTS public.touch_outreach_send_batches_updated_at();

-- remove policies and tables
DROP POLICY IF EXISTS "Users manage their own outreach send jobs" ON public.outreach_send_jobs;
DROP POLICY IF EXISTS "Users manage their own outreach send batches" ON public.outreach_send_batches;

DROP TABLE IF EXISTS public.outreach_send_jobs;
DROP TABLE IF EXISTS public.outreach_send_batches;
```

Validation queries:
```sql
SELECT to_regclass('public.outreach_send_jobs');
SELECT to_regclass('public.outreach_send_batches');
SELECT proname
FROM pg_proc
WHERE proname IN ('touch_outreach_send_jobs_updated_at', 'touch_outreach_send_batches_updated_at');
```

Forward-fix plan:
- Re-apply migration in staging after fixing queue worker compatibility issues and replaying exported queue rows.
