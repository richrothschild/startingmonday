# 124_guide_chat_analytics rollback

Goal:
- Revert guide chat analytics/feedback persistence if rollout causes auth policy or insert-path regressions.

Risk triggers:
- /api/guide/chat or feedback routes fail on inserts due policy mismatches.
- Authenticated users cannot read their own query/feedback records.
- Constraint collisions occur on unique feedback writes.

Pre-rollback safety checks:
- Export rows from public.guide_chat_queries and public.guide_chat_feedback.
- Pause guide chat feedback ingestion before rollback.
- Confirm analytics consumers can tolerate temporary source removal.

Rollback SQL:
```sql
-- Remove policies
DROP POLICY IF EXISTS "Users insert own guide chat queries" ON public.guide_chat_queries;
DROP POLICY IF EXISTS "Users read own guide chat queries" ON public.guide_chat_queries;
DROP POLICY IF EXISTS "Users insert own guide chat feedback" ON public.guide_chat_feedback;
DROP POLICY IF EXISTS "Users read own guide chat feedback" ON public.guide_chat_feedback;

-- Remove grants
REVOKE INSERT, SELECT ON public.guide_chat_queries FROM authenticated;
REVOKE INSERT, SELECT ON public.guide_chat_feedback FROM authenticated;

-- Remove tables in dependency order
DROP TABLE IF EXISTS public.guide_chat_feedback;
DROP TABLE IF EXISTS public.guide_chat_queries;
```

Validation queries:
```sql
SELECT to_regclass('public.guide_chat_queries');
SELECT to_regclass('public.guide_chat_feedback');
```

Forward-fix plan:
- Re-apply migration 124 after policy tests confirm insert+read behavior for authenticated users.
- Replay exported analytics rows if rollback occurred after production traffic.
