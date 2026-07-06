-- Meeting debrief persistence for culture/fit evaluation history and interviewer consistency.

create table if not exists public.meeting_debriefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meeting_name text not null,
  meeting_date date not null,
  interviewer_name text,
  interview_stage text,
  core_answers jsonb not null default '{}'::jsonb,
  stage_answers jsonb not null default '{}'::jsonb,
  stage_scores jsonb not null default '{}'::jsonb,
  overall_review text,
  vague_count integer not null default 0,
  risk_flag boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meeting_debriefs_user_created_idx
  on public.meeting_debriefs(user_id, created_at desc);

create index if not exists meeting_debriefs_user_meeting_date_idx
  on public.meeting_debriefs(user_id, meeting_date desc);

alter table public.meeting_debriefs enable row level security;

drop policy if exists "meeting_debriefs_select_own" on public.meeting_debriefs;
create policy "meeting_debriefs_select_own"
  on public.meeting_debriefs
  for select
  using (auth.uid() = user_id);

drop policy if exists "meeting_debriefs_insert_own" on public.meeting_debriefs;
create policy "meeting_debriefs_insert_own"
  on public.meeting_debriefs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "meeting_debriefs_update_own" on public.meeting_debriefs;
create policy "meeting_debriefs_update_own"
  on public.meeting_debriefs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "meeting_debriefs_delete_own" on public.meeting_debriefs;
create policy "meeting_debriefs_delete_own"
  on public.meeting_debriefs
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_meeting_debriefs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists meeting_debriefs_set_updated_at on public.meeting_debriefs;
create trigger meeting_debriefs_set_updated_at
before update on public.meeting_debriefs
for each row execute function public.set_meeting_debriefs_updated_at();
