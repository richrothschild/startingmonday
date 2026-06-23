# 149_dashboard_weekly_plan_regeneration_logs rollback

Goal:
- Revert the weekly plan regeneration audit log table if storage growth, RLS misconfigurations, or data integrity issues are detected after rollout.

Risk triggers:
- Regeneration log rows accumulate faster than expected and cause storage pressure.
- Users can read other users' regeneration log rows due to RLS policy gaps.
- The `plan_id` nullable FK (set null on delete) causes unexpected orphaned log rows.

Pre-rollback safety checks:
- Export regeneration log rows if audit history needs to be preserved.
- Confirm no application code path will throw on the absence of this table.

Rollback SQL:
```sql
DROP TABLE IF EXISTS public.dashboard_weekly_plan_regeneration_logs;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'dashboard_weekly_plan_regeneration_logs';

-- Should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 149 after fixing the relevant policy or schema issue in staging.
- Regeneration log history prior to the rollback is not recoverable unless a pre-rollback export was taken.
