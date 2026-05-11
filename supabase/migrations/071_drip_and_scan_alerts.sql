-- drip_sends: records which activation drip emails have been sent per user.
-- drip_day matches the schedule: 0, 3, 5, 7, 10, 14 (days since trial start).
create table public.drip_sends (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  drip_day   int  not null,
  sent_at    timestamptz not null default now(),
  unique(user_id, drip_day)
);

create index idx_drip_sends_user on public.drip_sends(user_id);

alter table public.drip_sends enable row level security;
-- Service role only; users have no direct access.

-- Opt-out flag for activation drip emails.
alter table public.users add column if not exists drip_unsubscribed_at timestamptz;

-- Track when a scan failure alert was last sent for a company.
-- Prevents repeated alerts for the same persistent failure.
alter table public.companies add column if not exists scan_alert_sent_at timestamptz;
