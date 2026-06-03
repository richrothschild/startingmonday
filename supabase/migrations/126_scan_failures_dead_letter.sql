create table if not exists public.scan_failures (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  job_name text not null,
  company_name text,
  error_message text not null,
  metadata jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now()
);

create index if not exists scan_failures_attempted_at_idx
  on public.scan_failures (attempted_at desc);

create index if not exists scan_failures_user_attempted_at_idx
  on public.scan_failures (user_id, attempted_at desc);

create index if not exists scan_failures_company_attempted_at_idx
  on public.scan_failures (company_id, attempted_at desc);

alter table public.scan_failures enable row level security;

drop policy if exists "scan_failures_select_service_role" on public.scan_failures;
create policy "scan_failures_select_service_role"
  on public.scan_failures
  for select
  to service_role
  using (true);

drop policy if exists "scan_failures_write_service_role" on public.scan_failures;
create policy "scan_failures_write_service_role"
  on public.scan_failures
  for all
  to service_role
  using (true)
  with check (true);