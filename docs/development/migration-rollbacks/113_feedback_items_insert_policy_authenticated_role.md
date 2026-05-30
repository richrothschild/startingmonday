# 113_feedback_items_insert_policy_authenticated_role rollback

Goal:
- Roll back authenticated-role insert policy to previous stricter policy model.

Risk triggers:
- Feedback insert abuse pattern detected.
- Policy-level audit requires user_id ownership check.

Pre-rollback safety checks:
- Verify existing client routes always submit user_id.
- Capture recent insert errors to compare post-rollback behavior.

Rollback SQL:
```sql
DROP POLICY IF EXISTS "feedback_items_insert_authenticated_role" ON public.feedback_items;

CREATE POLICY "feedback_items_insert_authenticated"
ON public.feedback_items
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND type = 'feedback'
);
```

Validation queries:
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename='feedback_items'
ORDER BY policyname;
```

Forward-fix plan:
- Revisit route payload normalization and policy claims if broader insert rule is still needed.
