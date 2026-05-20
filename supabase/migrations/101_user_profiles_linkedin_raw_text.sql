alter table if exists public.user_profiles
  add column if not exists linkedin_raw_text text;
