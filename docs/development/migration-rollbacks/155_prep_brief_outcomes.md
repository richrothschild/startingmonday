# 155_prep_brief_outcomes rollback

Goal:
- Revert the dedicated prep outcome tracking table and monthly efficacy rollup view if outcome writes, RLS behavior, or reporting accuracy prove unsafe after rollout.

Risk triggers:
- Outcome rows are created or modified for the wrong user because policy behavior is incorrect.
- The unique `brief_id` constraint blocks legitimate outcome updates or creates duplicate-state confusion in the brief lifecycle.
- The `prep_outcome_monthly_rollups` view reports incorrect counts or rates that would mislead internal efficacy reviews.

Pre-rollback safety checks:
- Export `public.prep_brief_outcomes` if the recorded interview outcomes need to be preserved before rollback.
- Confirm no active route, job, or admin page still depends on `public.prep_brief_outcomes` or `public.prep_outcome_monthly_rollups`.
- Verify product code can tolerate the outcome endpoint and efficacy report being unavailable during rollback.

Rollback SQL:
```sql
DROP VIEW IF EXISTS public.prep_outcome_monthly_rollups;
DROP TRIGGER IF EXISTS prep_brief_outcomes_set_updated_at ON public.prep_brief_outcomes;
DROP FUNCTION IF EXISTS public.set_prep_brief_outcomes_updated_at();
DROP TABLE IF EXISTS public.prep_brief_outcomes;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'prep_brief_outcomes';

SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'prep_outcome_monthly_rollups';

-- Both queries should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 155 in staging after correcting the policy, trigger, or reporting issue that caused the rollback.
- If historical outcome rows matter for analysis, restore them from the export taken before rollback.