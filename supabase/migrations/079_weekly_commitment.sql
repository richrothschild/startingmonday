alter table public.user_profiles
  add column if not exists weekly_goal smallint check (weekly_goal between 1 and 10);
