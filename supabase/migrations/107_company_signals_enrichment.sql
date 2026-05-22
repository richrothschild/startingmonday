-- Signal enrichment metadata for prep-context inference and auditability.
-- Apply manually in Supabase SQL editor (staging + production).

alter table if exists public.company_signals
  add column if not exists confidence integer,
  add column if not exists source_kind text,
  add column if not exists focus_tags text[] default '{}',
  add column if not exists evidence_snippets text[] default '{}',
  add column if not exists filing_form text,
  add column if not exists filing_items text[] default '{}',
  add column if not exists partner_entities text[] default '{}';

create index if not exists idx_company_signals_source_kind
  on public.company_signals (source_kind);

create index if not exists idx_company_signals_filing_form
  on public.company_signals (filing_form)
  where filing_form is not null;
