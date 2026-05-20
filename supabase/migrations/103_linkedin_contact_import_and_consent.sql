-- LinkedIn contact import: consent log, imported contacts staging, and audit events.
-- All tables are user-scoped with RLS. No contact data is stored without a valid consent record.

-- 1. Consent log — one row per import session the user initiates.
create table if not exists public.linkedin_import_consents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  purpose        text not null default 'company_contact_match',
  method         text not null, -- 'data_export' | 'portability_api'
  consented_at   timestamptz not null default now(),
  revoked_at     timestamptz,
  data_deleted_at timestamptz,
  raw_file_name  text,  -- original filename the user uploaded, for audit display only
  connection_count integer,
  ip_hash        text,  -- sha256 of IP, never raw IP
  user_agent_hash text, -- sha256 of user agent
  created_at     timestamptz not null default now()
);

create index if not exists linkedin_import_consents_user_idx
  on public.linkedin_import_consents (user_id, consented_at desc);

alter table public.linkedin_import_consents enable row level security;

create policy "linkedin_import_consents_own"
  on public.linkedin_import_consents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Imported connections staging — temporary store of parsed LinkedIn export rows.
--    Rows are deleted when user revokes consent or requests data deletion.
--    These are NOT the same as the contacts table; they are raw import data.
create table if not exists public.linkedin_imported_connections (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  consent_id     uuid not null references public.linkedin_import_consents(id) on delete cascade,
  full_name      text not null,
  headline       text,
  company_name   text,       -- raw company string from export
  company_name_normalized text, -- lowercased, trimmed, punctuation-stripped
  email          text,
  connected_on   date,
  linkedin_url   text,
  source_row     jsonb not null default '{}'::jsonb, -- original CSV row
  created_at     timestamptz not null default now()
);

create index if not exists linkedin_imported_connections_user_idx
  on public.linkedin_imported_connections (user_id, consent_id);

create index if not exists linkedin_imported_connections_company_norm_idx
  on public.linkedin_imported_connections (user_id, company_name_normalized);

alter table public.linkedin_imported_connections enable row level security;

create policy "linkedin_imported_connections_own"
  on public.linkedin_imported_connections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Contact match results — records of which imported connections were matched to which companies.
--    Linking an imported connection to the contacts table is a user action, not automatic.
create table if not exists public.linkedin_contact_matches (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  consent_id        uuid not null references public.linkedin_import_consents(id) on delete cascade,
  imported_conn_id  uuid not null references public.linkedin_imported_connections(id) on delete cascade,
  company_id        uuid references public.companies(id) on delete set null,
  contact_id        uuid references public.contacts(id) on delete set null, -- set when user promotes to contact
  match_reason      text not null, -- 'exact_name' | 'normalized_name' | 'domain'
  confidence        text not null check (confidence in ('high', 'medium', 'low')),
  promoted_at       timestamptz, -- when user clicked "Add to contacts"
  dismissed_at      timestamptz, -- when user clicked "Dismiss"
  created_at        timestamptz not null default now()
);

create index if not exists linkedin_contact_matches_user_company_idx
  on public.linkedin_contact_matches (user_id, company_id);

alter table public.linkedin_contact_matches enable row level security;

create policy "linkedin_contact_matches_own"
  on public.linkedin_contact_matches
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Audit events — append-only log of all import, match, promote, dismiss, revoke, and delete events.
create table if not exists public.linkedin_import_audit_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  consent_id  uuid references public.linkedin_import_consents(id) on delete set null,
  event_type  text not null, -- see constraint below
  event_data  jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

do $$
begin
  alter table public.linkedin_import_audit_events
    add constraint linkedin_import_audit_events_type_check
    check (event_type in (
      'consent_given',
      'import_started',
      'import_completed',
      'import_failed',
      'match_results_viewed',
      'contact_promoted',
      'match_dismissed',
      'consent_revoked',
      'data_deleted'
    ));
exception
  when duplicate_object then null;
end $$;

create index if not exists linkedin_import_audit_events_user_idx
  on public.linkedin_import_audit_events (user_id, occurred_at desc);

alter table public.linkedin_import_audit_events enable row level security;

-- Audit events are insert-only from the user's own session; reads allowed.
create policy "linkedin_import_audit_events_insert_own"
  on public.linkedin_import_audit_events
  for insert
  with check (auth.uid() = user_id);

create policy "linkedin_import_audit_events_select_own"
  on public.linkedin_import_audit_events
  for select
  using (auth.uid() = user_id);
