# 142_partner_outcome_events rollback

Goal:
- Revert the partner_outcome_events table, indexes, and RLS policy if outcome event recording causes constraint violations or write regressions in KPI tracking or partner reporting flows.

Risk triggers:
- event_type constraint violations (activation_complete, session_prep_viewed, weekly_loop_complete, interview_stage_advance, offer_recorded) if new event types are needed.
- program_track constraint violations if a track value outside (executive_transition, professional_transition) is used.
- Index write overhead on high-frequency event inserts causing latency in partner outcome recording.

Pre-rollback safety checks:
- Confirm whether any KPI calculations or partner reporting queries depend on partner_outcome_events; rolling back will lose all event history.
- Check whether the weekly loop completion trigger in migration 143 also emits outcome events that would be orphaned.
- Verify the outcome events API route can tolerate a missing table before proceeding.

Rollback SQL:
```sql
drop index if exists public.partner_outcome_events_partner_type_idx;
drop index if exists public.partner_outcome_events_cohort_idx;
drop index if exists public.partner_outcome_events_user_idx;
drop policy if exists partner_outcome_events_admin_only on public.partner_outcome_events;
drop table if exists public.partner_outcome_events;
```

Validation queries:
```sql
select to_regclass('public.partner_outcome_events');
select to_regclass('public.partner_outcome_events_partner_type_idx');
```

Forward-fix plan:
- Re-apply migration 142 after verifying event_type values align with all API callers and that program_track values are consistent with migration 141 cohort tracks.
