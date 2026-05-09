-- OS Sprint 3: Executive Narrative Engine
-- Snapshot positioning_summary each time it meaningfully changes
create table if not exists public.narrative_versions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  positioning text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_narrative_versions_user_id on public.narrative_versions(user_id, created_at desc);

alter table public.narrative_versions enable row level security;
create policy "users manage own narrative versions"
  on public.narrative_versions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Store generated LinkedIn fields (columns already exist from migration 001,
-- but add linkedin_about if it was ever dropped or renamed)
alter table public.user_profiles
  add column if not exists linkedin_headline text,
  add column if not exists linkedin_about    text;
