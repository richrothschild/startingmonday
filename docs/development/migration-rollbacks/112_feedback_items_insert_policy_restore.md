# 112_feedback_items_insert_policy_restore rollback

Goal:
- Revert restored authenticated insert policy if it causes unauthorized insert scope.

Risk triggers:
- Unexpected feedback inserts bypassing expected ownership semantics.
- Security review flags policy too broad.

Pre-rollback safety checks:
- Review latest feedback_items rows for mismatched user_id.
- Confirm app path can tolerate temporary insert lock if needed.

Rollback SQL:
```sql
DROP POLICY IF EXISTS "feedback_items_insert_authenticated" ON public.feedback_items;

CREATE POLICY "feedback_items_insert_own"
ON public.feedback_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND type = 'feedback');
```

Validation queries:
```sql
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename='feedback_items';
```

Forward-fix plan:
- Replace with narrower role/user policy and add route-level guard tests before re-enable.
