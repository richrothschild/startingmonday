-- Tracking pixel open events.
-- Populated by GET /api/track/open when an email client loads the 1x1 pixel.
-- Useful for detecting email forwards and measuring briefing open rates.
-- Service-role only — users cannot read or write their own rows.

create table public.watermark_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  email_type   text not null,
  sent_date    date,
  open_ip      text,
  user_agent   text,
  opened_at    timestamptz not null default now(),
  raw_token    text
);

alter table public.watermark_events enable row level security;
-- No policies — service role bypasses RLS; anon/authenticated have no access
