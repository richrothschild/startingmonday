-- Weekly loop tracking for partner participants.
-- Each row represents one participant's weekly loop for a given week.
-- Loop is "complete" when completed_at is set.
-- loop_items is a JSONB array of action/task objects with completion state.

create table if not exists public.partner_weekly_loops (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  cohort_id uuid references public.partner_cohorts(id) on delete set null,
  week_start date not null, -- always Monday of the ISO week
  completed_at timestamptz,
  loop_items jsonb not null default '[]'::jsonb,
  counselor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_weekly_loops_unique unique (partner_id, user_id, week_start)
);

create index if not exists partner_weekly_loops_partner_week_idx
  on public.partner_weekly_loops (partner_id, week_start desc);

create index if not exists partner_weekly_loops_cohort_idx
  on public.partner_weekly_loops (cohort_id, week_start desc);

create index if not exists partner_weekly_loops_user_idx
  on public.partner_weekly_loops (user_id, week_start desc);

create or replace function public.touch_partner_weekly_loops_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_touch_partner_weekly_loops_updated_at on public.partner_weekly_loops;
create trigger trg_touch_partner_weekly_loops_updated_at
  before update on public.partner_weekly_loops
  for each row execute function public.touch_partner_weekly_loops_updated_at();

alter table public.partner_weekly_loops enable row level security;

drop policy if exists partner_weekly_loops_admin_only on public.partner_weekly_loops;
create policy partner_weekly_loops_admin_only on public.partner_weekly_loops
  for all using (false);
