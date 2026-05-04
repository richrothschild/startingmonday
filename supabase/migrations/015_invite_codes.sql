-- Invite codes for referral tracking
alter table public.user_profiles
  add column if not exists invite_code text unique,
  add column if not exists referred_by text;

create index if not exists idx_user_profiles_invite_code
  on public.user_profiles(invite_code)
  where invite_code is not null;
