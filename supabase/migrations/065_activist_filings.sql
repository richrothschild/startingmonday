-- E1.3: Activist investor tracking via SEC Schedule 13D filings.
-- SC 13D = investor acquired >5% with intent to influence management.
-- SC 13D/A = amendment (escalation — pressure is increasing).

-- New signal type
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
    'board_change', 'transformation_budget',
    'activist_entry'
  ));

-- Throttle guard: avoid re-fetching the submissions JSON every day for every public company.
-- Updated after each activist scan regardless of whether filings were found.
alter table public.companies
  add column if not exists activist_checked_at timestamptz;

-- Historical record of SC 13D and SC 13D/A filings for companies in user watchlists.
-- This is training data: activist entry date, investor identity, ownership pct, stated intent.
create table public.activist_filings (
  id               uuid        primary key default gen_random_uuid(),
  company_id       uuid        not null references public.companies(id) on delete cascade,
  accession_number text        not null,
  form_type        text        not null,   -- 'SC 13D' or 'SC 13D/A'
  filing_date      date        not null,
  activist_name    text,
  ownership_pct    numeric,                -- e.g. 7.2 for 7.2%
  stated_intent    text,
  is_amendment     boolean     not null default false,
  detected_at      timestamptz not null default now(),
  unique (company_id, accession_number)
);

create index idx_activist_filings_company
  on public.activist_filings (company_id, filing_date desc);
