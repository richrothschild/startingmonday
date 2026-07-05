-- 157: Canonical event layer.
-- Entity-resolved companies and cross-source deduplicated events sit above
-- the per-user company_signals rows, which become projections of events.

-- Canonical companies: one row per real-world company, shared across users.
create table if not exists public.canonical_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_normalized text not null,
  domain text,
  sec_cik_padded text,
  sector text,
  is_public_company boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists canonical_companies_name_norm_idx
  on public.canonical_companies (name_normalized);
create index if not exists canonical_companies_domain_idx
  on public.canonical_companies (domain) where domain is not null;
create index if not exists canonical_companies_cik_idx
  on public.canonical_companies (sec_cik_padded) where sec_cik_padded is not null;

alter table public.canonical_companies enable row level security;

-- Canonical events: one row per real-world event, deduplicated across
-- sources. Provenance columns are non-negotiable (trade-secret dataset).
create table if not exists public.company_events (
  id uuid primary key default gen_random_uuid(),
  canonical_company_id uuid not null references public.canonical_companies(id) on delete cascade,
  event_type text not null,
  event_date date not null,
  summary text not null,
  summary_normalized text not null,
  corroboration_count int not null default 1,
  sources jsonb not null default '[]'::jsonb,
  confidence int,
  focus_tags text[] not null default '{}',
  evidence_snippets text[] not null default '{}',
  partner_entities text[] not null default '{}',
  filing_form text,
  filing_items text[] not null default '{}',
  raw_fetch_ref text,
  content_hash text,
  model_version text,
  first_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_events_dedup_idx
  on public.company_events (canonical_company_id, event_type, event_date);

alter table public.company_events enable row level security;

-- Link columns on existing tables (nullable, backward compatible).
alter table public.companies
  add column if not exists canonical_company_id uuid references public.canonical_companies(id);

alter table public.company_signals
  add column if not exists event_id uuid references public.company_events(id);

create index if not exists company_signals_event_idx
  on public.company_signals (event_id) where event_id is not null;

-- Per-run per-source pipeline metrics (observability lane O1).
create table if not exists public.source_run_metrics (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  source_key text not null,
  run_started_at timestamptz not null,
  classify_calls int not null default 0,
  classify_failures int not null default 0,
  signals_written int not null default 0,
  signals_skipped int not null default 0,
  events_created int not null default 0,
  events_merged int not null default 0,
  duration_ms int,
  created_at timestamptz not null default now()
);

create index if not exists source_run_metrics_job_time_idx
  on public.source_run_metrics (job, run_started_at desc);

alter table public.source_run_metrics enable row level security;

-- Service-role only for all three tables: RLS enabled with no user policies.
