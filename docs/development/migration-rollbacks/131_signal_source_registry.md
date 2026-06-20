# 131_signal_source_registry rollback

Goal:
- Revert the signal source registry tables if write failures, RLS misconfigurations, or governance review tooling issues are detected after rollout.

Risk triggers:
- Inserts to `signal_sources` or `signal_source_monthly_reviews` fail due to constraint violations or RLS policy gaps.
- Authenticated users cannot read signal source data due to policy misconfiguration.
- The service role write path is blocked unexpectedly.

Pre-rollback safety checks:
- Export all rows from `signal_sources` and `signal_source_monthly_reviews` for incident analysis before dropping.
- Confirm no application code path hard-depends on these tables at query time (governance tooling is the primary consumer).

Rollback SQL:
```sql
-- Drop monthly reviews table first (references signal_sources)
DROP TABLE IF EXISTS public.signal_source_monthly_reviews;

-- Drop signal sources table
DROP TABLE IF EXISTS public.signal_sources;
```

Validation queries:
```sql
SELECT to_regclass('public.signal_sources');
SELECT to_regclass('public.signal_source_monthly_reviews');
SELECT to_regclass('public.signal_sources_status_idx');
SELECT to_regclass('public.signal_sources_last_reviewed_idx');
SELECT to_regclass('public.signal_source_monthly_reviews_month_idx');
```

Forward-fix plan:
- Re-apply migration 131 after fixing policy definitions or constraint values in staging.
- Re-seed any exported source registry rows once the tables are restored.
