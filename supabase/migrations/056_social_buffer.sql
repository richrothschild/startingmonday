alter table public.social_posts
  add column if not exists buffer_update_id    text,
  add column if not exists buffer_scheduled_at timestamptz,
  add column if not exists notes               text;
