-- 156: Ingestion dead-letter queue.
-- Captures classification/ingestion failures that were previously dropped
-- silently, so signal loss is measurable and recoverable.

create table if not exists public.ingest_dlq (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  company_name text,
  payload jsonb not null default '{}'::jsonb,
  error text not null,
  attempts int not null default 1,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists ingest_dlq_unresolved_idx
  on public.ingest_dlq (created_at)
  where resolved_at is null;

-- Service-role only: RLS enabled with no user policies. The worker writes and
-- reads with the service key; end users never touch this table.
alter table public.ingest_dlq enable row level security;
