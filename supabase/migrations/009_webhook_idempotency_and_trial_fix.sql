-- Idempotency table for Stripe webhook events (prevents double-processing on retries)
create table if not exists public.processed_stripe_events (
  event_id  text        primary key,
  processed_at timestamptz not null default now()
);

-- Service role only — no user access
alter table public.processed_stripe_events enable row level security;

-- Fix trial backfill: some existing users had trial_ends_at set in the past
-- (migration 008 ran weeks after account creation). Reset them to 7 days from now.
update public.users
set trial_ends_at = now() + interval '7 days'
where subscription_status = 'trialing'
  and trial_ends_at < now();
