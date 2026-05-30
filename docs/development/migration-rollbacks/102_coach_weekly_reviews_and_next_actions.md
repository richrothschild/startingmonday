# 102_coach_weekly_reviews_and_next_actions rollback

Goal:
- Revert follow_up next-action fields and coach review table/policies if release causes query or policy regressions.

Risk triggers:
- Follow-up writes fail due to policy changes.
- coach_weekly_reviews read/write path errors after deploy.

Pre-rollback safety checks:
- Export data from public.coach_weekly_reviews.
- Confirm no in-flight release depends on next_action_* fields.

Rollback SQL:
```sql
-- restore prior follow_ups policy
DROP POLICY IF EXISTS "follow_ups_own_or_coach_access" ON public.follow_ups;
CREATE POLICY "follow_ups_own" ON public.follow_ups
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- remove review table
DROP TABLE IF EXISTS public.coach_weekly_reviews;

-- remove next-action constraints and fields
ALTER TABLE public.follow_ups
  DROP CONSTRAINT IF EXISTS follow_ups_next_action_status_check;

ALTER TABLE public.follow_ups
  DROP COLUMN IF EXISTS next_action_owner,
  DROP COLUMN IF EXISTS next_action_due_date,
  DROP COLUMN IF EXISTS next_action_status;
```

Validation queries:
```sql
SELECT to_regclass('public.coach_weekly_reviews');
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='follow_ups'
  AND column_name LIKE 'next_action_%';
```

Forward-fix plan:
- If rollback is needed due to policy scope, patch policy first and re-run migration in staging before re-applying in production.
