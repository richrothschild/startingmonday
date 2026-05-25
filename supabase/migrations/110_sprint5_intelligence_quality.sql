-- Sprint 5: intelligence quality scoring, persona relevance, and QA scorecards.

alter table if exists public.company_signals
  add column if not exists profile_channel text,
  add column if not exists profile_persona text,
  add column if not exists relevance_score integer,
  add column if not exists suppressed_at timestamptz,
  add column if not exists suppression_reason text;

create index if not exists idx_company_signals_profile_channel
  on public.company_signals (profile_channel, signal_date desc)
  where profile_channel is not null;

create index if not exists idx_company_signals_profile_persona
  on public.company_signals (profile_persona, signal_date desc)
  where profile_persona is not null;

create index if not exists idx_company_signals_relevance
  on public.company_signals (relevance_score desc)
  where relevance_score is not null;

create index if not exists idx_company_signals_suppression
  on public.company_signals (suppressed_at desc)
  where suppressed_at is not null;

create table if not exists public.intelligence_qa_weekly_scorecards (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  generated_at timestamptz not null default now(),
  sample_size integer not null default 0,
  source_coverage_rate numeric(5,2) not null default 0,
  confidence_coverage_rate numeric(5,2) not null default 0,
  avg_confidence numeric(5,2) not null default 0,
  relevance_avg numeric(5,2) not null default 0,
  suppression_rate numeric(5,2) not null default 0,
  stale_rate numeric(5,2) not null default 0,
  false_positive_proxy_rate numeric(5,2) not null default 0,
  by_channel jsonb not null default '{}'::jsonb,
  by_source_kind jsonb not null default '{}'::jsonb,
  notes text,
  unique (week_start)
);

create index if not exists idx_intel_qa_weekly_scorecards_week
  on public.intelligence_qa_weekly_scorecards (week_start desc);

alter table public.intelligence_qa_weekly_scorecards enable row level security;

create policy "Staff read intelligence QA scorecards"
  on public.intelligence_qa_weekly_scorecards
  for select
  using (true);
