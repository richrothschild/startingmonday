-- Partner programs and cohorts
-- A program is a named service offering under a partner (e.g. "Q3 Executive Cohort").
-- A cohort is a participant group within a program, tied to a track.

create table if not exists public.partner_programs (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  name text not null,
  track text not null,
  status text not null default 'active',
  started_at date,
  closed_at date,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_programs_track_check check (track in (
    'executive_transition',
    'professional_transition'
  )),
  constraint partner_programs_status_check check (status in (
    'draft',
    'active',
    'closed'
  ))
);

create index if not exists partner_programs_partner_idx
  on public.partner_programs (partner_id, created_at desc);

create table if not exists public.partner_cohorts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  program_id uuid references public.partner_programs(id) on delete set null,
  name text not null,
  track text not null,
  started_at date,
  closed_at date,
  created_at timestamptz not null default now(),
  constraint partner_cohorts_track_check check (track in (
    'executive_transition',
    'professional_transition'
  ))
);

create index if not exists partner_cohorts_partner_idx
  on public.partner_cohorts (partner_id, created_at desc);

create index if not exists partner_cohorts_program_idx
  on public.partner_cohorts (program_id);

create table if not exists public.partner_cohort_members (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.partner_cohorts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  counselor_user_id uuid references public.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  constraint partner_cohort_members_unique unique (cohort_id, user_id)
);

create index if not exists partner_cohort_members_cohort_idx
  on public.partner_cohort_members (cohort_id);

create index if not exists partner_cohort_members_user_idx
  on public.partner_cohort_members (user_id);

create index if not exists partner_cohort_members_partner_idx
  on public.partner_cohort_members (partner_id);

-- Updated_at trigger for programs
create or replace function public.touch_partner_programs_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_touch_partner_programs_updated_at on public.partner_programs;
create trigger trg_touch_partner_programs_updated_at
  before update on public.partner_programs
  for each row execute function public.touch_partner_programs_updated_at();

alter table public.partner_programs enable row level security;
alter table public.partner_cohorts enable row level security;
alter table public.partner_cohort_members enable row level security;

drop policy if exists partner_programs_admin_only on public.partner_programs;
create policy partner_programs_admin_only on public.partner_programs for all using (false);

drop policy if exists partner_cohorts_admin_only on public.partner_cohorts;
create policy partner_cohorts_admin_only on public.partner_cohorts for all using (false);

drop policy if exists partner_cohort_members_admin_only on public.partner_cohort_members;
create policy partner_cohort_members_admin_only on public.partner_cohort_members for all using (false);
