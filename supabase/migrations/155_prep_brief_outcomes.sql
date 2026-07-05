-- Dedicated prep brief outcomes table for efficacy tracking and monthly rollups.

create table if not exists public.prep_brief_outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  brief_id uuid not null references public.briefs(id) on delete cascade,
  company_id uuid null references public.companies(id) on delete set null,
  outcome text not null check (outcome in ('advanced', 'rejected', 'offer')),
  outcome_recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brief_id)
);

create index if not exists prep_brief_outcomes_user_time_idx
  on public.prep_brief_outcomes (user_id, outcome_recorded_at desc);

create index if not exists prep_brief_outcomes_outcome_idx
  on public.prep_brief_outcomes (outcome);

alter table public.prep_brief_outcomes enable row level security;

drop policy if exists "prep_brief_outcomes_select_own" on public.prep_brief_outcomes;
create policy "prep_brief_outcomes_select_own"
  on public.prep_brief_outcomes
  for select
  using (auth.uid() = user_id);

drop policy if exists "prep_brief_outcomes_insert_own" on public.prep_brief_outcomes;
create policy "prep_brief_outcomes_insert_own"
  on public.prep_brief_outcomes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "prep_brief_outcomes_update_own" on public.prep_brief_outcomes;
create policy "prep_brief_outcomes_update_own"
  on public.prep_brief_outcomes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_prep_brief_outcomes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prep_brief_outcomes_set_updated_at on public.prep_brief_outcomes;
create trigger prep_brief_outcomes_set_updated_at
before update on public.prep_brief_outcomes
for each row execute function public.set_prep_brief_outcomes_updated_at();

create or replace view public.prep_outcome_monthly_rollups as
select
  user_id,
  date_trunc('month', outcome_recorded_at)::date as month_start,
  count(*)::int as total_outcomes,
  count(*) filter (where outcome = 'advanced')::int as advanced_count,
  count(*) filter (where outcome = 'offer')::int as offer_count,
  count(*) filter (where outcome = 'rejected')::int as rejected_count,
  round(
    case when count(*) = 0 then 0
    else (count(*) filter (where outcome = 'advanced')::numeric / count(*)::numeric) * 100 end,
    1
  ) as advance_rate_pct,
  round(
    case when count(*) = 0 then 0
    else (count(*) filter (where outcome = 'offer')::numeric / count(*)::numeric) * 100 end,
    1
  ) as offer_rate_pct
from public.prep_brief_outcomes
group by user_id, date_trunc('month', outcome_recorded_at)::date;
