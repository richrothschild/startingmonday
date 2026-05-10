-- E1.1: Persist SEC CIK resolution on the companies table.
-- Avoids re-querying EDGAR full-text search on every scan run for the same company.
-- is_public_company = false means we searched and found nothing; skip future attempts.

alter table public.companies
  add column if not exists sec_cik             text,
  add column if not exists sec_cik_padded      text,
  add column if not exists sec_cik_resolved_at timestamptz,
  add column if not exists is_public_company   boolean;

create index if not exists idx_companies_sec_cik
  on public.companies (sec_cik) where sec_cik is not null;
