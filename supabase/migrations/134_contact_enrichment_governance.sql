alter table if exists public.contacts
  add column if not exists enrichment_source text not null default 'manual' check (enrichment_source in ('manual', 'apollo', 'anthropic', 'fallback', 'unknown')),
  add column if not exists enrichment_confidence numeric(4,3),
  add column if not exists enrichment_retention_expires_at timestamptz,
  add column if not exists enrichment_deleted_at timestamptz;

create index if not exists idx_contacts_enrichment_retention
  on public.contacts (enrichment_source, enrichment_retention_expires_at)
  where enrichment_retention_expires_at is not null;
