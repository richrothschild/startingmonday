# 143_partner_weekly_loop rollback

Goal:
- Revert the partner_weekly_loops table, unique constraint, indexes, trigger, and RLS policy if weekly loop tracking causes write regressions or unique constraint violations in the partner operating cadence workflow.

Risk triggers:
- Unique constraint (partner_id, user_id, week_start) causing loop creation failures when re-opening a week for a participant.
- Updated_at trigger causing update regressions on loop completion or item edit.
- week_start date always-Monday requirement not enforced at the database level; application bugs could insert non-Monday values that are hard to reconcile after rollback.
- RLS admin-only policy blocking legitimate service-role reads in weekly digest or counselor review flows.

Pre-rollback safety checks:
- Export all existing weekly loop rows (especially completed_at and loop_items) before dropping; loop completion state cannot be recovered from application logs.
- Confirm no partner outcome events reference weekly_loop_complete events that would become orphaned.
- Verify the weekly loop API and counselor review routes can handle a missing table before proceeding.

Rollback SQL:
```sql
drop trigger if exists trg_touch_partner_weekly_loops_updated_at on public.partner_weekly_loops;
drop function if exists public.touch_partner_weekly_loops_updated_at();
drop index if exists public.partner_weekly_loops_partner_week_idx;
drop index if exists public.partner_weekly_loops_cohort_idx;
drop index if exists public.partner_weekly_loops_user_idx;
drop policy if exists partner_weekly_loops_admin_only on public.partner_weekly_loops;
drop table if exists public.partner_weekly_loops;
```

Validation queries:
```sql
select to_regclass('public.partner_weekly_loops');
select to_regclass('public.partner_weekly_loops_partner_week_idx');
select proname from pg_proc where proname = 'touch_partner_weekly_loops_updated_at';
```

Forward-fix plan:
- Re-apply migration 143 after verifying week_start normalization logic in the API layer, confirming loop_items JSONB schema matches the counselor review UI, and aligning completed_at with weekly outcome event emission.
