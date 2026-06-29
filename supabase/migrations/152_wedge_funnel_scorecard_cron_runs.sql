-- Cron run logs for wedge weekly scorecard automation.

create table if not exists public.wedge_funnel_scorecard_cron_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  lookback_days integer not null default 30,
  schedule_utc text not null default '0 14 * * 1',
  success boolean not null default false,
  decision_summary text,
  snapshot_history_count integer,
  http_status integer,
  error_message text,
  run_payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_wedge_funnel_scorecard_cron_runs_triggered
  on public.wedge_funnel_scorecard_cron_runs (triggered_at desc);

create index if not exists idx_wedge_funnel_scorecard_cron_runs_success
  on public.wedge_funnel_scorecard_cron_runs (success, triggered_at desc);

alter table public.wedge_funnel_scorecard_cron_runs enable row level security;

create policy "Staff read wedge funnel cron runs"
  on public.wedge_funnel_scorecard_cron_runs
  for select
  using (true);
