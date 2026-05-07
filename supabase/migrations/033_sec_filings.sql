-- Persist 8-K filing metadata for trend detection across time
create table public.sec_filings (
  id               uuid        primary key default gen_random_uuid(),
  company_id       uuid        not null references public.companies on delete cascade,
  cik              text        not null,
  accession_number text        not null,
  filing_date      date        not null,
  items            text[]      not null default '{}',
  created_at       timestamptz not null default now(),
  unique (company_id, accession_number)
);

create index idx_sec_filings_company_date
  on public.sec_filings (company_id, filing_date desc);

-- filing_trend distinguishes cross-filing trend signals from single-event signals
alter table public.company_signals
  drop constraint if exists company_signals_signal_type_check;

alter table public.company_signals
  add constraint company_signals_signal_type_check
  check (signal_type in (
    'funding', 'exec_departure', 'exec_hire', 'acquisition',
    'expansion', 'layoffs', 'ipo', 'new_product', 'award',
    'pattern_alert', 'filing_trend'
  ));
