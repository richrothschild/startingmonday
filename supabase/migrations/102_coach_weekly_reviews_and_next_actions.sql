-- Coach workflow: explicit next actions and weekly review tracking.

alter table public.follow_ups
  add column if not exists next_action_owner text,
  add column if not exists next_action_due_date date,
  add column if not exists next_action_status text not null default 'pending';

do $$
begin
  alter table public.follow_ups
    add constraint follow_ups_next_action_status_check
    check (next_action_status in ('pending', 'done', 'blocked'));
exception
  when duplicate_object then null;
end $$;

drop policy if exists "follow_ups_own" on public.follow_ups;

create policy "follow_ups_own_or_coach_access" on public.follow_ups
  for all
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.team_seats ts
      where ts.owner_id = follow_ups.user_id
        and ts.member_user_id = auth.uid()
        and ts.coach_access_enabled = true
        and ts.status = 'accepted'
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1
      from public.team_seats ts
      where ts.owner_id = follow_ups.user_id
        and ts.member_user_id = auth.uid()
        and ts.coach_access_enabled = true
        and ts.status = 'accepted'
    )
  );

create table if not exists public.coach_weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  review_answers jsonb not null default '{}'::jsonb,
  next_follow_up_id uuid references public.follow_ups(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (coach_id, client_id, week_start)
);

create index if not exists coach_weekly_reviews_coach_client_week_idx
  on public.coach_weekly_reviews (coach_id, client_id, week_start desc);

alter table public.coach_weekly_reviews enable row level security;

create policy "coaches_manage_weekly_reviews" on public.coach_weekly_reviews
  for all
  using (auth.uid() = coach_id or auth.uid() = client_id)
  with check (auth.uid() = coach_id or auth.uid() = client_id);