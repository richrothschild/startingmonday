# 139_partner_audit_events rollback

Goal:
- Revert the partner_audit_events table, index, constraint, and RLS policy if partner audit event writes cause regressions or constraint violations in the partner management workflow.

Risk triggers:
- Insert failures due to action constraint (settings_accessed, white_label_updated, program_settings_updated, report_export_generated, role_linked).
- Index creation overhead causing write latency on high-volume partner operations.
- RLS policy blocking legitimate service-role reads in reporting flows.

Pre-rollback safety checks:
- Confirm whether any existing audit event rows need to be preserved for compliance purposes before dropping the table.
- Verify the partner management API can operate without audit event recording temporarily.
- Check that no dependent views or functions query partner_audit_events before dropping.

Rollback SQL:
```sql
drop index if exists public.partner_audit_events_partner_created_idx;
drop policy if exists partner_audit_events_admin_only on public.partner_audit_events;
drop table if exists public.partner_audit_events;
```

Validation queries:
```sql
select to_regclass('public.partner_audit_events');
select to_regclass('public.partner_audit_events_partner_created_idx');
```

Forward-fix plan:
- Re-apply migration 139 after verifying the action constraint values cover all actual event types used in partner operations.
