alter table if exists public.company_recommendations
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists company_recos_created_idx
  on public.company_recommendations(created_at desc);
