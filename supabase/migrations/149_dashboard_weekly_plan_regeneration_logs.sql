create table if not exists public.dashboard_weekly_plan_regeneration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.dashboard_weekly_plans(id) on delete set null,
  week_start date not null,
  overwrite_applied boolean not null default false,
  previous_actions jsonb,
  generated_actions jsonb not null,
  generator text not null default 'heuristic_v1',
  created_at timestamptz not null default now()
);

create index if not exists dashboard_weekly_plan_regen_logs_user_week_idx
  on public.dashboard_weekly_plan_regeneration_logs(user_id, week_start desc, created_at desc);

alter table public.dashboard_weekly_plan_regeneration_logs enable row level security;

drop policy if exists "Users manage own weekly plan regeneration logs" on public.dashboard_weekly_plan_regeneration_logs;
create policy "Users manage own weekly plan regeneration logs"
  on public.dashboard_weekly_plan_regeneration_logs
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
