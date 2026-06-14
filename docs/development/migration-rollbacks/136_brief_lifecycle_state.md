# 136_brief_lifecycle_state rollback

Goal:
- Revert brief lifecycle columns and indexes if the new lifecycle state model causes brief save, review, or reporting regressions.

Risk triggers:
- brief insert or update failures tied to lifecycle_state, reviewed_at, used_at, or lifecycle_updated_at.
- scorecard, coach briefing, or lifecycle update flows depending on the new brief fields break in staging.
- index creation or constraint enforcement causes brief write or read regressions.

Pre-rollback safety checks:
- confirm no downstream job depends on the new lifecycle columns for hard-required reads.
- snapshot any brief rows that were reviewed or used after the migration if that state must be preserved for audit or re-entry work.
- verify the application can tolerate returning to generated-only brief records temporarily.

Rollback SQL:
```sql
drop index if exists public.idx_briefs_reviewed_at;
drop index if exists public.idx_briefs_used_at;

alter table public.briefs
  drop constraint if exists briefs_lifecycle_state_check,
  drop column if exists lifecycle_updated_at,
  drop column if exists used_at,
  drop column if exists reviewed_at,
  drop column if exists lifecycle_state;
```

Validation queries:
```sql
select to_regclass('public.idx_briefs_reviewed_at') as reviewed_index,
       to_regclass('public.idx_briefs_used_at') as used_index;

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'briefs'
  and column_name in ('lifecycle_state', 'reviewed_at', 'used_at', 'lifecycle_updated_at');

select conname
from pg_constraint
where conname = 'briefs_lifecycle_state_check';
```

Forward-fix plan:
- re-apply migration 136 after the brief lifecycle UI, save, rate, and backfill paths are verified end to end.