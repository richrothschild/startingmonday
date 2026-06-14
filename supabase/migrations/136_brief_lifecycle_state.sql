alter table public.briefs
  add column if not exists lifecycle_state text not null default 'generated',
  add column if not exists reviewed_at timestamptz,
  add column if not exists used_at timestamptz,
  add column if not exists lifecycle_updated_at timestamptz not null default timezone('utc', now());

alter table public.briefs
  drop constraint if exists briefs_lifecycle_state_check;

alter table public.briefs
  add constraint briefs_lifecycle_state_check
  check (lifecycle_state in ('generated', 'reviewed', 'used'));

create index if not exists idx_briefs_reviewed_at
  on public.briefs (reviewed_at)
  where reviewed_at is not null;

create index if not exists idx_briefs_used_at
  on public.briefs (used_at)
  where used_at is not null;