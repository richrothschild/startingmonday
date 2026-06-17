# 138_partner_program_settings rollback

Goal:
- Revert the partner_program_settings table, trigger, and RLS policy if partner program configuration writes fail or cause regressions in the partner settings workflow.

Risk triggers:
- Partner settings API failures tied to default_program, sponsor_template_variant, or weekly_summary_day columns.
- Trigger function touch_partner_program_settings_updated_at causing update failures.
- RLS policy preventing legitimate service-role access in partner management flows.

Pre-rollback safety checks:
- Confirm no partner program settings rows exist that would be permanently lost; export any rows present for re-entry.
- Verify the partner settings API route can tolerate a missing partner_program_settings table before rolling back.
- Confirm the touch trigger is not referenced by other tables or functions.

Rollback SQL:
```sql
drop trigger if exists trg_touch_partner_program_settings_updated_at on public.partner_program_settings;
drop function if exists public.touch_partner_program_settings_updated_at();
drop policy if exists partner_program_settings_admin_only on public.partner_program_settings;
drop table if exists public.partner_program_settings;
```

Validation queries:
```sql
select to_regclass('public.partner_program_settings');
select proname from pg_proc where proname = 'touch_partner_program_settings_updated_at';
```

Forward-fix plan:
- Re-apply migration 138 after verifying partner settings API payloads are compatible with all columns and defaults.
