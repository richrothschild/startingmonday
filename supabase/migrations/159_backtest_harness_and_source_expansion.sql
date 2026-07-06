-- 159: E3 backtest harness + free-source expansion.
-- Adds cohort/control storage, replay metrics, ATS openings, missed-role queue,
-- and WARN notices. Service-role only except scanner_misses (user-owned RLS).

create table if not exists public.backtest_cohorts (
  id uuid primary key default gen_random_uuid(),
  opening_id uuid not null unique references public.role_openings(id) on delete cascade,
  canonical_company_id uuid not null references public.canonical_companies(id) on delete cascade,
  role_family text not null,
  opened_on date not null,
  timeline_start date not null,
  timeline_end date not null,
  wayback_snapshot_count int not null default 0,
  gdelt_event_count int not null default 0,
  timeline jsonb not null default '[]'::jsonb,
  cohort_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists backtest_cohorts_opened_idx
  on public.backtest_cohorts (opened_on desc);
create index if not exists backtest_cohorts_company_idx
  on public.backtest_cohorts (canonical_company_id);
create index if not exists backtest_cohorts_version_idx
  on public.backtest_cohorts (cohort_version, opened_on desc);

alter table public.backtest_cohorts enable row level security;

create table if not exists public.backtest_controls (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.backtest_cohorts(id) on delete cascade,
  canonical_company_id uuid not null references public.canonical_companies(id) on delete cascade,
  control_rank smallint not null,
  sector text,
  size_band text,
  created_at timestamptz not null default now(),
  unique (cohort_id, canonical_company_id),
  unique (cohort_id, control_rank)
);

create index if not exists backtest_controls_company_idx
  on public.backtest_controls (canonical_company_id);

alter table public.backtest_controls enable row level security;

create table if not exists public.backtest_replay_runs (
  id uuid primary key default gen_random_uuid(),
  cohort_version text not null default 'v1',
  cohort_count int not null default 0,
  control_count int not null default 0,
  status text not null default 'running',
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists backtest_replay_runs_started_idx
  on public.backtest_replay_runs (started_at desc);

alter table public.backtest_replay_runs enable row level security;

create table if not exists public.pattern_backtests (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.backtest_replay_runs(id) on delete set null,
  cohort_version text not null default 'v1',
  pattern_name text not null,
  role_family text,
  support_n int not null default 0,
  true_positives int not null default 0,
  false_positives int not null default 0,
  false_negatives int not null default 0,
  precision numeric not null default 0,
  recall numeric not null default 0,
  fp_rate numeric not null default 0,
  median_lead_time_days numeric,
  computed_at timestamptz not null default now(),
  unique (cohort_version, pattern_name, role_family)
);

create index if not exists pattern_backtests_computed_idx
  on public.pattern_backtests (computed_at desc);
create index if not exists pattern_backtests_precision_idx
  on public.pattern_backtests (precision desc);

alter table public.pattern_backtests enable row level security;

create table if not exists public.ats_role_openings (
  id uuid primary key default gen_random_uuid(),
  canonical_company_id uuid not null references public.canonical_companies(id) on delete cascade,
  source_platform text not null,
  role_title text not null,
  role_family text,
  role_url text not null,
  opened_on date,
  closed_on date,
  is_open boolean not null default true,
  raw_payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  unique (canonical_company_id, source_platform, role_url)
);

create index if not exists ats_role_openings_company_idx
  on public.ats_role_openings (canonical_company_id, fetched_at desc);
create index if not exists ats_role_openings_open_idx
  on public.ats_role_openings (is_open, fetched_at desc);

alter table public.ats_role_openings enable row level security;

create table if not exists public.scanner_misses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role_url text not null,
  role_title text,
  status text not null default 'new',
  verification_notes text,
  verified_opened_on date,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, company_id, role_url)
);

create index if not exists scanner_misses_status_idx
  on public.scanner_misses (status, created_at desc);
create index if not exists scanner_misses_user_idx
  on public.scanner_misses (user_id, created_at desc);

alter table public.scanner_misses enable row level security;

drop policy if exists scanner_misses_select_own on public.scanner_misses;
create policy scanner_misses_select_own on public.scanner_misses
  for select using (auth.uid() = user_id);

drop policy if exists scanner_misses_insert_own on public.scanner_misses;
create policy scanner_misses_insert_own on public.scanner_misses
  for insert with check (auth.uid() = user_id);

drop policy if exists scanner_misses_update_own on public.scanner_misses;
create policy scanner_misses_update_own on public.scanner_misses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.warn_notices (
  id uuid primary key default gen_random_uuid(),
  state_code text not null,
  notice_id text not null,
  employer_name text not null,
  event_date date,
  job_losses int,
  source_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (state_code, notice_id)
);

create index if not exists warn_notices_event_idx
  on public.warn_notices (event_date desc);
create index if not exists warn_notices_employer_idx
  on public.warn_notices (employer_name);

alter table public.warn_notices enable row level security;

-- Service-role only for all tables except scanner_misses (explicit user RLS).