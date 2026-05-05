-- signal_action_events: tracks which signals lead to downstream action within 48h
create table if not exists signal_action_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  signal_id       uuid references company_signals(id) on delete set null,
  company_id      uuid references companies(id) on delete cascade,
  action_type     text not null check (action_type in ('outreach_sent', 'brief_generated', 'contact_added')),
  hours_since_signal numeric(6, 2),
  created_at      timestamptz not null default now()
);

create index if not exists signal_action_events_user_id_idx    on signal_action_events(user_id);
create index if not exists signal_action_events_signal_id_idx  on signal_action_events(signal_id);
create index if not exists signal_action_events_created_at_idx on signal_action_events(created_at);

alter table signal_action_events enable row level security;
create policy "users read own signal action events"
  on signal_action_events for select
  using (auth.uid() = user_id);

-- brief_quality_log: records context richness score alongside every brief generation
create table if not exists brief_quality_log (
  id                  uuid primary key default gen_random_uuid(),
  brief_id            uuid references briefs(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  company_id          uuid references companies(id) on delete set null,
  context_score       integer check (context_score between 0 and 100),
  has_resume          boolean not null default false,
  has_positioning     boolean not null default false,
  has_scan_result     boolean not null default false,
  has_contacts        boolean not null default false,
  word_count          integer,
  created_at          timestamptz not null default now()
);

create index if not exists brief_quality_log_user_id_idx   on brief_quality_log(user_id);
create index if not exists brief_quality_log_brief_id_idx  on brief_quality_log(brief_id);
create index if not exists brief_quality_log_created_at_idx on brief_quality_log(created_at);

alter table brief_quality_log enable row level security;
create policy "users read own brief quality log"
  on brief_quality_log for select
  using (auth.uid() = user_id);

-- Cohort columns on users for segmentation and analysis
alter table users add column if not exists signup_source          text;
alter table users add column if not exists acquisition_channel    text;
alter table users add column if not exists persona_self_identified text;
alter table users add column if not exists plan_at_trial_end      text;
