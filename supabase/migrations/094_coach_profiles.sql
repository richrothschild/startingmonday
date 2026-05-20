-- Coach profile info exposed to connected clients via RLS.

create table if not exists public.coach_profiles (
  coach_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coach_profiles enable row level security;

create policy "coach_profiles_own_manage"
  on public.coach_profiles
  for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

create policy "clients_read_connected_coach_profiles"
  on public.coach_profiles
  for select
  using (
    exists (
      select 1
      from public.team_seats ts
      where ts.owner_id = coach_profiles.coach_id
        and ts.member_user_id = auth.uid()
        and ts.status = 'accepted'
    )
  );
