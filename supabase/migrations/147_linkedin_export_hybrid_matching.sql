-- Hybrid LinkedIn export + Apollo matching foundation.
-- Goal: identify likely known contacts at target companies without scraping.

create extension if not exists pg_trgm;
create extension if not exists unaccent;

create table if not exists public.linkedin_connection_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'linkedin_export_csv' check (source in ('linkedin_export_csv', 'linkedin_export_zip', 'manual')),
  source_file_name text,
  source_file_sha256 text,
  row_count integer not null default 0,
  processed_count integer not null default 0,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'processed', 'failed')),
  failure_reason text,
  uploaded_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists linkedin_connection_uploads_user_uploaded_idx
  on public.linkedin_connection_uploads(user_id, uploaded_at desc);

create table if not exists public.linkedin_export_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  upload_id uuid not null references public.linkedin_connection_uploads(id) on delete cascade,
  first_name text,
  last_name text,
  full_name text not null,
  email text,
  company text,
  position text,
  connected_on date,
  profile_url text,
  -- Normalized fields for deterministic/fuzzy matching.
  normalized_full_name text not null,
  normalized_company text,
  company_domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists linkedin_export_connections_user_upload_idx
  on public.linkedin_export_connections(user_id, upload_id, created_at desc);

create index if not exists linkedin_export_connections_name_trgm_idx
  on public.linkedin_export_connections using gin (normalized_full_name gin_trgm_ops);

create index if not exists linkedin_export_connections_company_trgm_idx
  on public.linkedin_export_connections using gin (normalized_company gin_trgm_ops)
  where normalized_company is not null;

create unique index if not exists linkedin_export_connections_user_profile_unique_idx
  on public.linkedin_export_connections(user_id, lower(profile_url))
  where profile_url is not null;

create table if not exists public.company_people_connection_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  candidate_id uuid references public.company_people_candidates(id) on delete set null,
  people_id uuid references public.people(id) on delete set null,
  export_connection_id uuid not null references public.linkedin_export_connections(id) on delete cascade,
  match_method text not null check (match_method in ('profile_url_exact', 'name_company_fuzzy', 'name_exact_company_fuzzy', 'email_exact')),
  match_tier text not null check (match_tier in ('high', 'medium', 'low', 'rejected')),
  name_similarity numeric(5,4) not null check (name_similarity >= 0 and name_similarity <= 1),
  company_similarity numeric(5,4) not null default 0 check (company_similarity >= 0 and company_similarity <= 1),
  overall_score numeric(5,4) not null check (overall_score >= 0 and overall_score <= 1),
  rule_version text not null default 'v1',
  -- User confirmation is the final trust gate before "known" status.
  user_confirmed boolean not null default false,
  user_confirmed_at timestamptz,
  user_rejected boolean not null default false,
  user_rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, company_id, export_connection_id, candidate_id)
);

create index if not exists company_people_connection_matches_user_company_idx
  on public.company_people_connection_matches(user_id, company_id, overall_score desc, created_at desc);

create index if not exists company_people_connection_matches_confirmation_idx
  on public.company_people_connection_matches(user_id, user_confirmed, user_rejected, created_at desc);

create table if not exists public.company_people_matching_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  upload_id uuid references public.linkedin_connection_uploads(id) on delete set null,
  rule_version text not null default 'v1',
  candidates_evaluated integer not null default 0,
  connections_evaluated integer not null default 0,
  matches_created integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  failure_reason text,
  created_at timestamptz not null default now()
);

create index if not exists company_people_matching_runs_user_started_idx
  on public.company_people_matching_runs(user_id, started_at desc);

-- Shared text normalization used by match jobs.
create or replace function public.normalize_match_text(input text)
returns text
language sql
immutable
as $$
  select nullif(
    regexp_replace(
      trim(
        regexp_replace(
          lower(unaccent(coalesce(input, ''))),
          '[^a-z0-9]+',
          ' ',
          'g'
        )
      ),
      '\\s+',
      ' ',
      'g'
    ),
    ''
  );
$$;

-- Rule thresholds (v1):
-- HIGH: profile_url_exact OR (name >= 0.96 AND company >= 0.92)
-- MEDIUM: name >= 0.90 AND company >= 0.80
-- LOW: name >= 0.84 AND company >= 0.70
-- REJECTED: below low thresholds.
create or replace function public.classify_linkedin_match(
  method text,
  name_sim numeric,
  company_sim numeric
)
returns text
language plpgsql
immutable
as $$
begin
  if method = 'profile_url_exact' or method = 'email_exact' then
    return 'high';
  end if;

  if name_sim >= 0.96 and company_sim >= 0.92 then
    return 'high';
  elsif name_sim >= 0.90 and company_sim >= 0.80 then
    return 'medium';
  elsif name_sim >= 0.84 and company_sim >= 0.70 then
    return 'low';
  end if;

  return 'rejected';
end;
$$;

drop trigger if exists set_updated_at_linkedin_connection_uploads on public.linkedin_connection_uploads;
create trigger set_updated_at_linkedin_connection_uploads
  before update on public.linkedin_connection_uploads
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_linkedin_export_connections on public.linkedin_export_connections;
create trigger set_updated_at_linkedin_export_connections
  before update on public.linkedin_export_connections
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_company_people_connection_matches on public.company_people_connection_matches;
create trigger set_updated_at_company_people_connection_matches
  before update on public.company_people_connection_matches
  for each row execute procedure public.set_updated_at();

alter table public.linkedin_connection_uploads enable row level security;
alter table public.linkedin_export_connections enable row level security;
alter table public.company_people_connection_matches enable row level security;
alter table public.company_people_matching_runs enable row level security;

drop policy if exists "Users manage own linkedin uploads" on public.linkedin_connection_uploads;
create policy "Users manage own linkedin uploads"
  on public.linkedin_connection_uploads
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own linkedin export connections" on public.linkedin_export_connections;
create policy "Users manage own linkedin export connections"
  on public.linkedin_export_connections
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own company people connection matches" on public.company_people_connection_matches;
create policy "Users manage own company people connection matches"
  on public.company_people_connection_matches
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own company people matching runs" on public.company_people_matching_runs;
create policy "Users manage own company people matching runs"
  on public.company_people_matching_runs
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
