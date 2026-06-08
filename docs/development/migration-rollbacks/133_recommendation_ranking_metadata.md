# 133_recommendation_ranking_metadata rollback

Goal:
- Revert ranking metadata persistence on recommendation rows if schema rollout causes insert/query regressions.

Risk triggers:
- discover API insert failures due to metadata column behavior.
- unexpected index overhead from company_recos_created_idx.

Pre-rollback safety checks:
- confirm discover API can run without metadata writes.
- snapshot recent recommendation rows if ranking diagnostics need incident review.

Rollback SQL:
```sql
DROP INDEX IF EXISTS public.company_recos_created_idx;
ALTER TABLE IF EXISTS public.company_recommendations
  DROP COLUMN IF EXISTS metadata;
```

Validation queries:
```sql
SELECT to_regclass('public.company_recos_created_idx');
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'company_recommendations' AND column_name = 'metadata';
```

Forward-fix plan:
- re-apply migration 133 after validating insert payload shape and downstream read expectations.
