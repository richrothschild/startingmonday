alter table if exists public.wedge_funnel_scorecard_cron_runs
  add column if not exists error_code text;

create index if not exists idx_wedge_funnel_scorecard_cron_runs_error_code
  on public.wedge_funnel_scorecard_cron_runs (error_code, triggered_at desc);
