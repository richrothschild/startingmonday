-- E1.4: Form 4 insider transaction tracking.
-- Surfaces material open-market share sales by named officers as departure-precursor signals.

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
    'activist_entry', 'insider_sale'
  ));

-- Throttle guard: limit Atom feed fetches to once per week per company.
alter table public.companies
  add column if not exists insider_checked_at timestamptz;

-- Historical record of material insider sales.
-- Training data: who sold, how much, as what % of holdings, before what happened next.
create table public.insider_sales (
  id                uuid        primary key default gen_random_uuid(),
  company_id        uuid        not null references public.companies(id) on delete cascade,
  accession_number  text        not null,
  filing_date       date        not null,
  transaction_date  date,
  exec_name         text,
  exec_title        text,
  shares_sold       numeric,
  price_per_share   numeric,
  sale_value        numeric,                 -- total USD value of the sale
  shares_remaining  numeric,
  pct_holdings_sold numeric,                 -- fraction sold, e.g. 0.45 for 45%
  detected_at       timestamptz not null default now(),
  unique (company_id, accession_number)
);

create index idx_insider_sales_company
  on public.insider_sales (company_id, filing_date desc);
