-- Track when each user's last briefing was sent to prevent duplicate sends.
alter table public.user_profiles
  add column if not exists last_briefing_sent_at timestamptz;
