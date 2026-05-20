-- Adds LinkedIn engagement tracking columns to social_posts.
-- like_count/comment_count/impression_count are populated by the sync-engagement cron job
-- via the LinkedIn REST API. linkedin_post_urn is captured from the Make.com webhook response
-- after each post is published.

alter table public.social_posts
  add column if not exists linkedin_post_urn    text,
  add column if not exists like_count           integer not null default 0,
  add column if not exists comment_count        integer not null default 0,
  add column if not exists impression_count     integer not null default 0,
  add column if not exists engagement_synced_at timestamptz;

create index if not exists idx_social_posts_urn
  on public.social_posts(linkedin_post_urn)
  where linkedin_post_urn is not null;
