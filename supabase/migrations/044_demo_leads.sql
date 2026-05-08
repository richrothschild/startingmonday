create table if not exists public.demo_leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  company    text,
  role       text,
  created_at timestamptz not null default now()
);

alter table public.demo_leads enable row level security;

create index idx_demo_leads_created_at on public.demo_leads(created_at desc);
