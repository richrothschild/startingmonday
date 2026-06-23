# 148_dashboard_weekly_plans rollback

Goal:
- Revert the dashboard weekly plans table if data integrity issues, RLS misconfigurations, or constraint violations are detected after rollout.

Risk triggers:
- Inserts to `dashboard_weekly_plans` fail due to the unique constraint on `(user_id, week_start)`.
- Users can read other users' weekly plan rows due to RLS policy gaps.
- The `set_updated_at` trigger fires unexpectedly and causes write errors.

Pre-rollback safety checks:
- Export user-authored weekly plan rows from `dashboard_weekly_plans` if data preservation is required.
- Confirm the regeneration log table (migration 149) is also rolled back first — it has a FK reference to this table.
- Confirm no application code path will throw on the absence of this table.

Rollback SQL:
```sql
-- Drop regeneration logs first (FK reference to dashboard_weekly_plans)
DROP TABLE IF EXISTS public.dashboard_weekly_plan_regeneration_logs;

-- Drop the weekly plans table
DROP TABLE IF EXISTS public.dashboard_weekly_plans;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'dashboard_weekly_plans',
    'dashboard_weekly_plan_regeneration_logs'
  );

-- Should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migrations 148 and 149 after fixing the relevant policy, trigger, or constraint issue in staging.
- Restore user weekly plan data from the pre-rollback export.
