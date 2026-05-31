# 118_emi_kpi_snapshots_write_policies rollback

Goal:
- Revert broad authenticated write policies on emi_kpi_snapshots if write scope is too permissive.

Risk triggers:
- Non-automation authenticated users can mutate KPI snapshots.
- Unexpected updates on canonical KPI rows.

Pre-rollback safety checks:
- Snapshot current policies from pg_policies.
- Export recent writes from emi_kpi_snapshots for audit.

Rollback SQL:
```sql
DROP POLICY IF EXISTS "Authenticated insert EMI KPI snapshots"
  ON public.emi_kpi_snapshots;

DROP POLICY IF EXISTS "Authenticated update EMI KPI snapshots"
  ON public.emi_kpi_snapshots;
```

Validation queries:
```sql
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename='emi_kpi_snapshots'
ORDER BY policyname;
```

Forward-fix plan:
- Replace with service-route-specific write policy tied to staff/automation claims and re-run staging validation.
