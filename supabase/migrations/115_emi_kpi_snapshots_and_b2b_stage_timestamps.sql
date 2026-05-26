-- Canonical EMI KPI snapshots plus B2B conversion timestamps.

create table if not exists public.emi_kpi_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value numeric(10,2),
  metric_status text not null default 'ok' check (metric_status in ('ok', 'no_data', 'query_error')),
  week_start date not null,
  week_end date not null,
  source_table text,
  source_notes text,
  generated_at timestamptz not null default now(),
  unique (metric_name, week_start, week_end)
);

create index if not exists idx_emi_kpi_snapshots_metric_week
  on public.emi_kpi_snapshots (metric_name, week_end desc, generated_at desc);

alter table public.emi_kpi_snapshots enable row level security;

create policy "Staff read EMI KPI snapshots"
  on public.emi_kpi_snapshots
  for select
  using (true);

alter table if exists public.b2b_prospects
  add column if not exists qualified_at timestamptz,
  add column if not exists pilot_approved_at timestamptz;

create index if not exists idx_b2b_prospects_qualified_at
  on public.b2b_prospects (qualified_at desc)
  where qualified_at is not null;

create index if not exists idx_b2b_prospects_pilot_approved_at
  on public.b2b_prospects (pilot_approved_at desc)
  where pilot_approved_at is not null;
