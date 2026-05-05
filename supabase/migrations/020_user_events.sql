-- User behavior event log (server-side source of truth for all analytics)
create table if not exists user_events (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references users(id) on delete cascade,
  event_name  text        not null,
  properties  jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

create index idx_user_events_user_id    on user_events(user_id);
create index idx_user_events_event_name on user_events(event_name);
create index idx_user_events_created_at on user_events(created_at);

-- Users can read their own events; all writes go through service role
alter table user_events enable row level security;
create policy "users_read_own_events" on user_events
  for select using (auth.uid() = user_id);

-- Company watch events for aggregate market intelligence
-- Collected at company-add time; no PII; demographics only
create table if not exists company_watch_events (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null references users(id) on delete cascade,
  company_id            uuid        not null references companies(id) on delete cascade,
  sector                text,
  career_page_url_present boolean   not null default false,
  fit_score             integer,
  stage                 text,
  created_at            timestamptz not null default now()
);

create index idx_company_watch_events_created_at on company_watch_events(created_at);
create index idx_company_watch_events_sector     on company_watch_events(sector);

alter table company_watch_events enable row level security;
-- No user-facing read policy — admin/analytics only

-- Offer tracking: populated when a company stage moves to 'offer'
alter table users add column if not exists offer_accepted_at timestamptz;

-- Acquisition attribution: set on signup from referral_source query param
alter table users add column if not exists referral_source text;
