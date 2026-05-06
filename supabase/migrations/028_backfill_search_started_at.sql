-- Backfill search_started_at from onboarding_completed_at for users who
-- completed onboarding before this column was wired up.
update user_profiles
set search_started_at = onboarding_completed_at
where search_started_at is null
  and onboarding_completed_at is not null;
