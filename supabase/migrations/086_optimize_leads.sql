-- Email leads captured at the free profile grader before analysis is returned
create table if not exists public.optimize_leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  ip         text,
  created_at timestamptz not null default now()
);

alter table public.optimize_leads enable row level security;

-- Service role only; anon cannot read or modify
create index idx_optimize_leads_email on public.optimize_leads(email);
create index idx_optimize_leads_created_at on public.optimize_leads(created_at desc);
