-- Relationship intelligence foundation: shared public people layer + user-private relationship layer.

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text,
  current_title text,
  current_company text,
  current_company_domain text,
  linkedin_url text,
  work_email text,
  source_primary text not null default 'apollo' check (source_primary in ('apollo', 'manual', 'public_web', 'other')),
  confidence numeric(4,3),
  last_enriched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists people_linkedin_url_unique_idx
  on public.people(lower(linkedin_url))
  where linkedin_url is not null;

create index if not exists people_company_title_idx
  on public.people(lower(current_company), lower(current_title));

create table if not exists public.person_sources (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  source_type text not null check (source_type in ('apollo', 'public_web', 'manual', 'other')),
  source_name text not null,
  source_url text,
  captured_at timestamptz not null default now(),
  confidence numeric(4,3),
  created_at timestamptz not null default now()
);

create index if not exists person_sources_person_captured_idx
  on public.person_sources(person_id, captured_at desc);

create table if not exists public.person_affiliations (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  organization_name text not null,
  affiliation_type text not null check (affiliation_type in ('association', 'network', 'board', 'advisory', 'community', 'other')),
  status text not null default 'confirmed' check (status in ('confirmed', 'likely', 'unconfirmed')),
  source_url text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists person_affiliations_person_idx
  on public.person_affiliations(person_id);

create table if not exists public.person_signals (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  signal_type text not null check (signal_type in ('role_change', 'promotion', 'publication', 'speaking_event', 'award', 'board_appointment', 'company_news', 'other')),
  title text not null,
  summary text,
  source_url text,
  signal_date timestamptz,
  confidence numeric(4,3),
  created_at timestamptz not null default now(),
  unique (person_id, signal_type, title, source_url)
);

create index if not exists person_signals_person_date_idx
  on public.person_signals(person_id, signal_date desc nulls last, created_at desc);

create table if not exists public.contact_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  source text not null default 'manual' check (source in ('manual', 'apollo', 'public_web', 'other')),
  confidence numeric(4,3),
  created_at timestamptz not null default now(),
  unique (contact_id, person_id)
);

create index if not exists contact_people_user_idx
  on public.contact_people(user_id, created_at desc);

create table if not exists public.company_people_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  source text not null default 'apollo' check (source in ('apollo', 'public_web', 'manual', 'other')),
  role_cluster text not null check (role_cluster in ('hiring_authority', 'recruiter', 'champion', 'sponsor', 'search_partner', 'interviewer', 'other')),
  score numeric(6,3),
  rationale text,
  status text not null default 'suggested' check (status in ('suggested', 'saved', 'dismissed', 'expired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_people_candidates_user_company_idx
  on public.company_people_candidates(user_id, company_id, created_at desc);

create table if not exists public.contact_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  note_type text not null default 'research' check (note_type in ('research', 'conversation', 'intro_path', 'interview', 'personal_context', 'ai_summary', 'general')),
  body text not null,
  source text not null default 'user' check (source in ('user', 'system')),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_notes_contact_created_idx
  on public.contact_notes(contact_id, created_at desc);

create table if not exists public.relationship_touchpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  touch_type text not null check (touch_type in ('linkedin_follow', 'linkedin_connect', 'email_sent', 'email_reply', 'intro_requested', 'intro_made', 'call', 'meeting', 'interview', 'note_added', 'content_engaged', 'other')),
  channel text,
  direction text not null default 'outbound' check (direction in ('outbound', 'inbound', 'internal')),
  summary text,
  outcome text,
  occurred_at timestamptz not null default now(),
  next_recommended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists relationship_touchpoints_contact_idx
  on public.relationship_touchpoints(contact_id, occurred_at desc);

create table if not exists public.relationship_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  insight_type text not null check (insight_type in ('why_this_person', 'outreach_angle', 'interviewer_brief', 'bridge_path', 'timing_update', 'summary')),
  content text not null,
  input_context jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  stale_after timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists relationship_insights_contact_generated_idx
  on public.relationship_insights(contact_id, generated_at desc);

-- Updated_at triggers for mutable tables.
drop trigger if exists set_updated_at_people on public.people;
create trigger set_updated_at_people
  before update on public.people
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_company_people_candidates on public.company_people_candidates;
create trigger set_updated_at_company_people_candidates
  before update on public.company_people_candidates
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_contact_notes on public.contact_notes;
create trigger set_updated_at_contact_notes
  before update on public.contact_notes
  for each row execute procedure public.set_updated_at();

-- RLS policies.
alter table public.people enable row level security;
alter table public.person_sources enable row level security;
alter table public.person_affiliations enable row level security;
alter table public.person_signals enable row level security;
alter table public.contact_people enable row level security;
alter table public.company_people_candidates enable row level security;
alter table public.contact_notes enable row level security;
alter table public.relationship_touchpoints enable row level security;
alter table public.relationship_insights enable row level security;

drop policy if exists "Authenticated can read people" on public.people;
create policy "Authenticated can read people"
  on public.people
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can read person sources" on public.person_sources;
create policy "Authenticated can read person sources"
  on public.person_sources
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can read person affiliations" on public.person_affiliations;
create policy "Authenticated can read person affiliations"
  on public.person_affiliations
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can read person signals" on public.person_signals;
create policy "Authenticated can read person signals"
  on public.person_signals
  for select
  to authenticated
  using (true);

drop policy if exists "Users manage own contact people" on public.contact_people;
create policy "Users manage own contact people"
  on public.contact_people
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own company people candidates" on public.company_people_candidates;
create policy "Users manage own company people candidates"
  on public.company_people_candidates
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own contact notes" on public.contact_notes;
create policy "Users manage own contact notes"
  on public.contact_notes
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own relationship touchpoints" on public.relationship_touchpoints;
create policy "Users manage own relationship touchpoints"
  on public.relationship_touchpoints
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own relationship insights" on public.relationship_insights;
create policy "Users manage own relationship insights"
  on public.relationship_insights
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());