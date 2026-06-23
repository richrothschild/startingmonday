create table if not exists public.dashboard_weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  action_1 text not null default '',
  action_2 text not null default '',
  action_3 text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists dashboard_weekly_plans_user_week_idx
  on public.dashboard_weekly_plans(user_id, week_start desc);

drop trigger if exists set_updated_at_dashboard_weekly_plans on public.dashboard_weekly_plans;
create trigger set_updated_at_dashboard_weekly_plans
  before update on public.dashboard_weekly_plans
  for each row execute procedure public.set_updated_at();

alter table public.dashboard_weekly_plans enable row level security;

drop policy if exists "Users manage own dashboard weekly plans" on public.dashboard_weekly_plans;
create policy "Users manage own dashboard weekly plans"
  on public.dashboard_weekly_plans
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
