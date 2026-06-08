# 131_discovery_recommendation_runs rollback

Goal:
- Revert discovery recommendation run persistence if rollout causes write failures, query regressions, or storage/permission issues.

Risk triggers:
- Insert/select failures against public.company_recommendation_runs or public.company_recommendations.
- RLS policy misconfiguration blocks authenticated users from reading their own recommendations.
- Excessive row growth or index impact degrades discover API latency.

Pre-rollback safety checks:
- Export recent recommendation rows needed for incident analysis.
- Confirm discover API can return model output without persistence enabled.
- Notify team that narrative-link detail pages will stop resolving persisted recommendation IDs.

Rollback SQL:
```sql
-- Drop recommendation item table and indexes
DROP TABLE IF EXISTS public.company_recommendations;

-- Drop run table and indexes
DROP TABLE IF EXISTS public.company_recommendation_runs;
```

Validation queries:
```sql
SELECT to_regclass('public.company_recommendation_runs');
SELECT to_regclass('public.company_recommendations');
SELECT to_regclass('public.company_reco_runs_user_created_idx');
SELECT to_regclass('public.company_recos_run_rank_idx');
```

Forward-fix plan:
- Re-apply migration 131 after policy/query fixes are validated in staging.
- Re-enable discover persistence path and monitor insert/read latency and error rate.
