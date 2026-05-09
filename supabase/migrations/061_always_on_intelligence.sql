-- OS Sprint 4: Always-On Intelligence
-- Expands signal types; adds industry_pulse and opportunity_radar tables.

-- Two new signal types: board-level governance changes and transformation budget announcements
alter table public.company_signals
  drop constraint if exists company_signals_signal_type_check;

alter table public.company_signals
  add constraint company_signals_signal_type_check
  check (signal_type in (
    'funding', 'exec_departure', 'exec_hire', 'acquisition',
    'expansion', 'layoffs', 'ipo', 'new_product', 'award',
    'pattern_alert', 'filing_trend',
    'breach_disclosure', 'regulatory_change',
    'data_platform', 'ai_investment',
    'board_change', 'transformation_budget'
  ));

-- Weekly sector intelligence digest per user.
-- Populated by the industry-pulse-job; included in briefings when fresh (< 8 days).
create table if not exists public.industry_pulse (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  role_type      text        not null,
  bullets        jsonb       not null default '[]',
  generated_at   timestamptz not null default now()
);
create index if not exists idx_industry_pulse_user
  on public.industry_pulse(user_id, generated_at desc);
alter table public.industry_pulse enable row level security;
create policy "Users read own pulse"
  on public.industry_pulse for select using (auth.uid() = user_id);

-- Proactive company suggestions per user.
-- Populated by the opportunity-radar-job; surfaced in the dashboard.
create table if not exists public.opportunity_radar (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  company_name   text        not null,
  reason         text        not null,
  signal_type    text,
  confidence     int,
  generated_at   timestamptz not null default now()
);
create index if not exists idx_opportunity_radar_user
  on public.opportunity_radar(user_id, generated_at desc);
alter table public.opportunity_radar enable row level security;
create policy "Users read own radar"
  on public.opportunity_radar for select using (auth.uid() = user_id);
