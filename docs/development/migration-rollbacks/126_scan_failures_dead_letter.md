# 126_scan_failures_dead_letter rollback

Goal:
- Revert scan dead-letter persistence if rollout introduces write failures, policy regressions, or unexpected storage growth.

Risk triggers:
- Worker scan jobs fail when inserting into public.scan_failures.
- Service-role read/write paths lose expected access.
- Retention expectations are exceeded by sustained high-volume inserts.

Pre-rollback safety checks:
- Export rows from public.scan_failures for post-rollback analysis.
- Confirm scan jobs can continue with structured log fallback only.
- Notify ops that dead-letter visibility will temporarily rely on logs.

Rollback SQL:
```sql
-- Remove policies
DROP POLICY IF EXISTS "scan_failures_select_service_role" ON public.scan_failures;
DROP POLICY IF EXISTS "scan_failures_write_service_role" ON public.scan_failures;

-- Remove indexes
DROP INDEX IF EXISTS public.scan_failures_company_attempted_at_idx;
DROP INDEX IF EXISTS public.scan_failures_user_attempted_at_idx;
DROP INDEX IF EXISTS public.scan_failures_attempted_at_idx;

-- Remove table
DROP TABLE IF EXISTS public.scan_failures;
```

Validation queries:
```sql
SELECT to_regclass('public.scan_failures');
SELECT to_regclass('public.scan_failures_attempted_at_idx');
SELECT to_regclass('public.scan_failures_user_attempted_at_idx');
SELECT to_regclass('public.scan_failures_company_attempted_at_idx');
```

Forward-fix plan:
- Re-apply migration 126 after confirming worker inserts and service-role policy behavior in staging.
- Replay exported dead-letter rows if historical visibility is required after re-apply.
