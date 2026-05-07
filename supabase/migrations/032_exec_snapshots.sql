-- Exec snapshots for Proxycurl diffing (departure/hire detection across signal-job runs)
create table public.exec_snapshots (
  id             uuid        primary key default gen_random_uuid(),
  company_id     uuid        not null references public.companies on delete cascade,
  snapshot_date  date        not null,
  executives     jsonb       not null default '[]',
  created_at     timestamptz not null default now(),
  unique (company_id, snapshot_date)
);

create index idx_exec_snapshots_company_date
  on public.exec_snapshots (company_id, snapshot_date desc);

-- LinkedIn company URL for Proxycurl employee lookups
alter table public.companies add column if not exists linkedin_url text;

-- Add pattern_alert to the signal type enum
alter table public.company_signals
  drop constraint if exists company_signals_signal_type_check;

alter table public.company_signals
  add constraint company_signals_signal_type_check
  check (signal_type in (
    'funding', 'exec_departure', 'exec_hire', 'acquisition',
    'expansion', 'layoffs', 'ipo', 'new_product', 'award', 'pattern_alert'
  ));
