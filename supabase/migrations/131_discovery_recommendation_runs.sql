-- Persist discovery recommendation runs and item narratives for linked detail views.

create table if not exists public.company_recommendation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'anthropic' check (source in ('anthropic', 'fallback', 'apollo', 'mixed')),
  seed_companies text[] not null default '{}',
  prompt_version text not null default 'discover-v2',
  requested_count int not null default 20,
  returned_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists company_reco_runs_user_created_idx
  on public.company_recommendation_runs(user_id, created_at desc);

create table if not exists public.company_recommendations (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.company_recommendation_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rank int not null,
  name text not null,
  sector text not null,
  fit int not null check (fit between 1 and 10),
  why text not null,
  key_signals text[] not null default '{}',
  key_attributes text[] not null default '{}',
  suggested_people jsonb not null default '[]'::jsonb,
  source text not null default 'anthropic' check (source in ('anthropic', 'fallback', 'apollo', 'mixed')),
  confidence numeric(4,3) not null default 0.500,
  created_at timestamptz not null default now(),
  unique (run_id, rank)
);

create index if not exists company_recos_user_created_idx
  on public.company_recommendations(user_id, created_at desc);

create index if not exists company_recos_run_rank_idx
  on public.company_recommendations(run_id, rank asc);

create index if not exists company_recos_name_idx
  on public.company_recommendations(lower(name));

alter table public.company_recommendation_runs enable row level security;
alter table public.company_recommendations enable row level security;

grant select, insert on public.company_recommendation_runs to authenticated;
grant select, insert on public.company_recommendations to authenticated;

drop policy if exists "Users insert own recommendation runs" on public.company_recommendation_runs;
create policy "Users insert own recommendation runs"
  on public.company_recommendation_runs
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users read own recommendation runs" on public.company_recommendation_runs;
create policy "Users read own recommendation runs"
  on public.company_recommendation_runs
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users insert own recommendations" on public.company_recommendations;
create policy "Users insert own recommendations"
  on public.company_recommendations
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users read own recommendations" on public.company_recommendations;
create policy "Users read own recommendations"
  on public.company_recommendations
  for select
  to authenticated
  using (user_id = auth.uid());
