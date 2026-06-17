# 140_partner_roles rollback

Goal:
- Revert the partner_roles table, unique index, indexes, and RLS policy if partner role assignment causes write regressions or constraint violations in multi-role scenarios.

Risk triggers:
- Unique index partner_roles_active_unique_idx (partial on revoked_at is null) causing duplicate role assignment failures for legitimate re-grants.
- Role constraint (firm_admin, counselor, participant, sponsor_viewer) not covering a required role value.
- RLS policy blocking legitimate service-role access in role management or participant assignment flows.

Pre-rollback safety checks:
- Export any active role assignments (where revoked_at is null) for re-entry after rollback.
- Confirm no downstream code hard-depends on the partner_roles table before dropping.
- Verify the team role management API can handle a missing partner_roles table temporarily.

Rollback SQL:
```sql
drop index if exists public.partner_roles_active_unique_idx;
drop index if exists public.partner_roles_partner_user_idx;
drop index if exists public.partner_roles_user_idx;
drop policy if exists partner_roles_admin_only on public.partner_roles;
drop table if exists public.partner_roles;
```

Validation queries:
```sql
select to_regclass('public.partner_roles');
select to_regclass('public.partner_roles_active_unique_idx');
```

Forward-fix plan:
- Re-apply migration 140 after verifying the role enum covers all values used in the team roles API and firm admin flows.
