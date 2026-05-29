-- Sprint 6: onboarding implementation speed, guided completion, and QA scorecards.

create table if not exists public.onboarding_qa_weekly_scorecards (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  generated_at timestamptz not null default now(),
  started_users integer not null default 0,
  completed_users integer not null default 0,
  transition_first_completed integer not null default 0,
  median_seconds_to_first_value integer not null default 0,
  under_ten_min_rate numeric(5,2) not null default 0,
  avg_manual_fields_reduction_rate numeric(5,2) not null default 0,
  low_energy_mode_rate numeric(5,2) not null default 0,
  nudge_coverage_rate numeric(5,2) not null default 0,
  channel_mix jsonb not null default '{}'::jsonb,
  persona_mix jsonb not null default '{}'::jsonb,
  notes text,
  unique (week_start)
);

create index if not exists idx_onboarding_qa_weekly_scorecards_week
  on public.onboarding_qa_weekly_scorecards (week_start desc);

alter table public.onboarding_qa_weekly_scorecards enable row level security;

create policy "Staff read onboarding QA scorecards"
  on public.onboarding_qa_weekly_scorecards
  for select
  using (true);
