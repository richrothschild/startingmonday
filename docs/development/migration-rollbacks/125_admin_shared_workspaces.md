# 125_admin_shared_workspaces rollback

Goal:
- Revert admin shared workspace persistence if rollout introduces data access, trigger, or policy regressions.

Risk triggers:
- Admin shared workspace reads/writes fail for service-role paths.
- Update operations stop refreshing updated_at.
- RLS policy behavior diverges from expected service-role-only access.

Pre-rollback safety checks:
- Export rows from public.admin_shared_workspaces.
- Pause jobs or routes that write shared workspace state.
- Confirm consumers can tolerate temporary fallback to non-persistent state.

Rollback SQL:
```sql
-- Remove policies
DROP POLICY IF EXISTS "admin_shared_workspaces_select_service_role" ON public.admin_shared_workspaces;
DROP POLICY IF EXISTS "admin_shared_workspaces_write_service_role" ON public.admin_shared_workspaces;

-- Remove trigger and function
DROP TRIGGER IF EXISTS trg_touch_admin_shared_workspaces_updated_at ON public.admin_shared_workspaces;
DROP FUNCTION IF EXISTS public.touch_admin_shared_workspaces_updated_at();

-- Remove index and table
DROP INDEX IF EXISTS public.admin_shared_workspaces_updated_at_idx;
DROP TABLE IF EXISTS public.admin_shared_workspaces;
```

Validation queries:
```sql
SELECT to_regclass('public.admin_shared_workspaces');
SELECT to_regclass('public.admin_shared_workspaces_updated_at_idx');
```

Forward-fix plan:
- Re-apply migration 125 once service-role access and update trigger behavior are validated in staging.
- Restore exported rows after re-apply if rollback occurred after production writes.
