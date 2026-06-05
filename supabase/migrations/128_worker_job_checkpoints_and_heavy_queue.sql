create table if not exists public.job_checkpoints (
  job_name text primary key,
  cursor jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.heavy_job_queue (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'retry', 'completed', 'dead_letter')),
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  last_error text,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_heavy_job_queue_lookup
  on public.heavy_job_queue (job_type, status, updated_at asc);

alter table public.job_checkpoints enable row level security;
alter table public.heavy_job_queue enable row level security;

create policy "job_checkpoints_admin_only"
  on public.job_checkpoints
  for all
  using (false)
  with check (false);

create policy "heavy_job_queue_admin_only"
  on public.heavy_job_queue
  for all
  using (false)
  with check (false);
