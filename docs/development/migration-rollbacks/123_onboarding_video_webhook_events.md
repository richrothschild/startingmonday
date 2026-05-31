# 123_onboarding_video_webhook_events rollback

Goal:
- Remove webhook event persistence objects if dedupe or processing state persistence introduces regressions.

Risk triggers:
- Webhook writes fail due dedupe constraint pressure.
- Event processing latency increases due index or trigger overhead.
- RLS reads fail for expected authenticated users.

Pre-rollback safety checks:
- Export rows from public.onboarding_video_webhook_events for replay/audit.
- Pause webhook ingestion before rollback.
- Confirm no downstream reports depend on this table in the rollback window.

Rollback SQL:
```sql
-- Remove trigger and function
DROP TRIGGER IF EXISTS trg_onboarding_video_webhook_events_updated_at ON public.onboarding_video_webhook_events;
DROP FUNCTION IF EXISTS public.touch_onboarding_video_webhook_events_updated_at();

-- Remove policy
DROP POLICY IF EXISTS "Users read their onboarding video webhook events" ON public.onboarding_video_webhook_events;

-- Remove table (drops related indexes/constraints)
DROP TABLE IF EXISTS public.onboarding_video_webhook_events;
```

Validation queries:
```sql
SELECT to_regclass('public.onboarding_video_webhook_events');
SELECT proname
FROM pg_proc
WHERE proname = 'touch_onboarding_video_webhook_events_updated_at';
```

Forward-fix plan:
- Re-deploy with a staged replay set and validate dedupe_key behavior before reopening webhook ingest.
- Re-run webhook backfill from exported events after reapply.
