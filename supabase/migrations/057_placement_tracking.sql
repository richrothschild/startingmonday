alter table public.user_profiles
  add column if not exists placed_at          timestamptz,
  add column if not exists placement_company  text;
