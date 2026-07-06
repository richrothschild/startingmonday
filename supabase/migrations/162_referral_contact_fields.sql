-- Capture referrer contact and company details entered during signup
-- so partner payouts and manual commission reconciliation have human-readable evidence.

alter table public.user_profiles
  add column if not exists referred_by_name text,
  add column if not exists referred_by_company text;

create index if not exists user_profiles_referred_by_name_idx
  on public.user_profiles (referred_by_name);

create index if not exists user_profiles_referred_by_company_idx
  on public.user_profiles (referred_by_company);
