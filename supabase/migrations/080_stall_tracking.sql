alter table public.user_profiles
  add column if not exists search_path text check (search_path in ('campaign', 'nurture', 'watcher')),
  add column if not exists stall_nudge_dismissed_at timestamptz;
