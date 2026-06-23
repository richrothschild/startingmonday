alter table public.dashboard_weekly_plans
  add column if not exists completed_1 boolean not null default false,
  add column if not exists completed_2 boolean not null default false,
  add column if not exists completed_3 boolean not null default false,
  add column if not exists reflection_notes text;
