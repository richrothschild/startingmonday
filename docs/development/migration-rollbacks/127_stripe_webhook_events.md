# 127_stripe_webhook_events rollback

Goal:
- Revert Stripe webhook event persistence if rollout causes write-path regressions, trigger failures, or unexpected storage growth.

Risk triggers:
- Webhook handler starts failing writes to public.stripe_webhook_events.
- Trigger function errors on update paths for processed_at or processing_error.
- RLS behavior unexpectedly blocks required service-role access.
- Table/index growth exceeds expected envelope and affects database performance.

Pre-rollback safety checks:
- Export recent rows from public.stripe_webhook_events so event-delivery forensic history is preserved.
- Confirm webhook processing remains functional without persistence (non-blocking logging fallback only).
- Notify ops that backlog visibility based on this table will be unavailable until forward-fix is applied.

Rollback SQL:
```sql
-- Remove trigger and trigger function
DROP TRIGGER IF EXISTS trg_stripe_webhook_events_updated_at ON public.stripe_webhook_events;
DROP FUNCTION IF EXISTS public.touch_stripe_webhook_events_updated_at();

-- Remove indexes
DROP INDEX IF EXISTS public.stripe_webhook_events_event_type_idx;
DROP INDEX IF EXISTS public.stripe_webhook_events_unprocessed_received_idx;

-- Remove table
DROP TABLE IF EXISTS public.stripe_webhook_events;
```

Validation queries:
```sql
SELECT to_regclass('public.stripe_webhook_events');
SELECT to_regclass('public.stripe_webhook_events_unprocessed_received_idx');
SELECT to_regclass('public.stripe_webhook_events_event_type_idx');
SELECT to_regprocedure('public.touch_stripe_webhook_events_updated_at()');
```

Forward-fix plan:
- Re-apply migration 127 after validating webhook write-path behavior and trigger updates in staging.
- Backfill missed event observability from Stripe event replay or archived payload exports if needed.
