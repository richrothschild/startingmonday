# 141_partner_programs_and_cohorts rollback

Goal:
- Revert partner_programs, partner_cohorts, and partner_cohort_members tables, their indexes, triggers, and RLS policies if cohort management or participant assignment causes regressions.

Risk triggers:
- partner_programs or partner_cohorts insert/update failures from track or status constraint violations.
- partner_cohort_members unique constraint (cohort_id, user_id) causing re-enrollment failures.
- Updated_at trigger on partner_programs causing update regressions.
- RLS admin-only policies blocking legitimate service-role access in cohort reporting flows.

Pre-rollback safety checks:
- Export any existing program, cohort, and member rows before dropping; cohort membership data cannot be recovered from application state.
- Confirm partner outcome events and weekly loops that reference cohort_id via foreign key; those tables reference partner_cohorts(id) on delete set null — dropping cohort rows would null those references.
- Verify the cohort admin API can handle missing tables before proceeding.

Rollback SQL:
```sql
-- Members first (references cohorts and partners)
drop index if exists public.partner_cohort_members_cohort_idx;
drop index if exists public.partner_cohort_members_user_idx;
drop index if exists public.partner_cohort_members_partner_idx;
drop policy if exists partner_cohort_members_admin_only on public.partner_cohort_members;
drop table if exists public.partner_cohort_members;

-- Cohorts second (references programs and partners)
drop index if exists public.partner_cohorts_partner_idx;
drop index if exists public.partner_cohorts_program_idx;
drop policy if exists partner_cohorts_admin_only on public.partner_cohorts;
drop table if exists public.partner_cohorts;

-- Programs last
drop trigger if exists trg_touch_partner_programs_updated_at on public.partner_programs;
drop function if exists public.touch_partner_programs_updated_at();
drop index if exists public.partner_programs_partner_idx;
drop policy if exists partner_programs_admin_only on public.partner_programs;
drop table if exists public.partner_programs;
```

Validation queries:
```sql
select to_regclass('public.partner_programs');
select to_regclass('public.partner_cohorts');
select to_regclass('public.partner_cohort_members');
select proname from pg_proc where proname = 'touch_partner_programs_updated_at';
```

Forward-fix plan:
- Re-apply migration 141 after verifying cohort membership unique constraint covers all enrollment patterns and that track values align with the program track used in outcome events.
