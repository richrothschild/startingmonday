-- Stores LinkedIn post drafts and posting history for the admin social page.
-- Admin-only: accessed via service role, no RLS required.

create table public.social_posts (
  id            uuid        primary key default gen_random_uuid(),
  post_date     date        not null unique,
  pillar        text        not null check (pillar in (
                               'search_craft', 'market_intel', 'behind_build', 'user_story', 'engagement'
                             )),
  draft_text    text        not null,
  is_posted     boolean     not null default false,
  posted_at     timestamptz,
  platform      text        default 'linkedin',
  generated_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_social_posts_date on public.social_posts(post_date desc);
