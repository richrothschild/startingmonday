-- Performance indexes for users table queries that will degrade as the table grows.
-- subscription_status is filtered in billing checks and webhook handlers.
-- trial_ends_at is scanned by the trial-expiry path and backfill queries.

create index if not exists idx_users_subscription_status
  on public.users (subscription_status);

create index if not exists idx_users_trial_ends_at
  on public.users (trial_ends_at)
  where trial_ends_at is not null;
