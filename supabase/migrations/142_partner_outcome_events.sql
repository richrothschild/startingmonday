-- Canonical outcome event schema for white-label partner KPI tracking.
-- Events: activation_complete, session_prep_viewed, weekly_loop_complete,
--         interview_stage_advance, offer_recorded.
-- Enables the KPI dictionary: 7-day activation rate, weekly-loop completion rate,
-- pipeline-advance rate, offer-conversion rate.

create table if not exists public.partner_outcome_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  cohort_id uuid references public.partner_cohorts(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null,
  program_track text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint partner_outcome_events_type_check check (event_type in (
    'activation_complete',
    'session_prep_viewed',
    'weekly_loop_complete',
    'interview_stage_advance',
    'offer_recorded'
  )),
  constraint partner_outcome_events_track_check check (
    program_track is null or program_track in (
      'executive_transition',
      'professional_transition'
    )
  )
);

create index if not exists partner_outcome_events_partner_type_idx
  on public.partner_outcome_events (partner_id, event_type, created_at desc);

create index if not exists partner_outcome_events_cohort_idx
  on public.partner_outcome_events (cohort_id, event_type, created_at desc);

create index if not exists partner_outcome_events_user_idx
  on public.partner_outcome_events (user_id, event_type, created_at desc);

alter table public.partner_outcome_events enable row level security;

drop policy if exists partner_outcome_events_admin_only on public.partner_outcome_events;
create policy partner_outcome_events_admin_only on public.partner_outcome_events
  for all using (false);
