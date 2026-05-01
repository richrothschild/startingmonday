-- New profile fields captured during onboarding.
-- onboarding_completed_at: null = new user who hasn't been through onboarding.

alter table public.user_profiles
  add column if not exists current_title           text,
  add column if not exists current_company         text,
  add column if not exists employment_status       text,
  add column if not exists search_timeline         text,
  add column if not exists linkedin_url            text,
  add column if not exists resume_text             text,
  add column if not exists beyond_resume           text,
  add column if not exists dream_job               text,
  add column if not exists dream_companies         text,
  add column if not exists onboarding_completed_at timestamptz;

-- Existing users are already set up — don't redirect them to onboarding.
update public.user_profiles
  set onboarding_completed_at = now()
  where onboarding_completed_at is null;
