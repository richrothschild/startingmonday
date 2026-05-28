-- Public idea submissions table for the /ideas page
-- Email is collected for gift card purposes but never returned via API

create table public.idea_submissions (
  id          uuid primary key default uuid_generate_v4(),
  name        text,                 -- optional display name (shown as initials)
  email       text not null,        -- required, private, never exposed via API
  category    text not null check (category in ('feature_request', 'ui_ux', 'bug', 'performance', 'other')),
  body        text not null,
  ai_rating   jsonb,                -- { score: number, rationale: string } — populated by monthly cron
  ai_rated_at timestamp with time zone,
  created_at  timestamp with time zone not null default now(),

  constraint idea_submissions_body_length check (char_length(body) >= 10 and char_length(body) <= 2000)
);

-- All access goes through service-role API routes; no direct client access
alter table public.idea_submissions enable row level security;

create index idx_idea_submissions_created_at on public.idea_submissions (created_at desc);
create index idx_idea_submissions_ai_rating  on public.idea_submissions ((ai_rating->>'score') desc nulls last);
