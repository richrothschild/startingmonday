-- Reconciliation migration:
-- Some environments report migration history complete through 103
-- but are missing public.activist_filings. Create it idempotently.

create table if not exists public.activist_filings (
  id               uuid        primary key default gen_random_uuid(),
  company_id       uuid        not null references public.companies(id) on delete cascade,
  accession_number text        not null,
  form_type        text        not null,
  filing_date      date        not null,
  activist_name    text,
  ownership_pct    numeric,
  stated_intent    text,
  is_amendment     boolean     not null default false,
  detected_at      timestamptz not null default now(),
  unique (company_id, accession_number)
);

create index if not exists idx_activist_filings_company
  on public.activist_filings (company_id, filing_date desc);
