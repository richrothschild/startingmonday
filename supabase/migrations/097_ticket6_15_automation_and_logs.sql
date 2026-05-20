-- Ticket 5 enhancement: persistent lead scoring execution log
create table if not exists public.lead_scoring_runs (
  id uuid primary key default gen_random_uuid(),
  initiated_by_user_id uuid references auth.users(id) on delete set null,
  trigger text not null default 'admin' check (trigger in ('admin', 'cron')),
  status text not null default 'success' check (status in ('success', 'failed')),
  processed integer not null default 0,
  updated integer not null default 0,
  dry_run boolean not null default false,
  routed jsonb not null default '{}'::jsonb,
  by_channel jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists lead_scoring_runs_created_idx
  on public.lead_scoring_runs(created_at desc);

-- Ticket 6 and Ticket 10 and Ticket 13: meeting automation state
create table if not exists public.meeting_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  email text,
  full_name text,
  company text,
  scheduled_for timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'canceled')),
  source text not null default 'manual',
  reminder_sent_at timestamptz,
  follow_up_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meeting_bookings_user_schedule_idx
  on public.meeting_bookings(user_id, scheduled_for desc);

alter table public.meeting_bookings enable row level security;

drop policy if exists "Users manage their own meeting bookings" on public.meeting_bookings;

create policy "Users manage their own meeting bookings"
  on public.meeting_bookings
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.touch_meeting_bookings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_meeting_bookings_updated_at on public.meeting_bookings;
create trigger trg_meeting_bookings_updated_at
before update on public.meeting_bookings
for each row execute function public.touch_meeting_bookings_updated_at();

-- Ticket 9 and Ticket 10: reply ingestion and classification storage
create table if not exists public.outreach_reply_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  email text not null,
  subject text,
  body text not null,
  received_at timestamptz not null default now(),
  classified_label text,
  classification_confidence integer,
  meeting_signal boolean not null default false,
  classified_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists outreach_reply_inbox_user_received_idx
  on public.outreach_reply_inbox(user_id, received_at desc);

alter table public.outreach_reply_inbox enable row level security;

drop policy if exists "Users manage their own outreach reply inbox" on public.outreach_reply_inbox;

create policy "Users manage their own outreach reply inbox"
  on public.outreach_reply_inbox
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 14: intake automation
create table if not exists public.onboarding_intake_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'web_form',
  status text not null default 'received' check (status in ('received', 'verified', 'needs_review')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists onboarding_intake_submissions_user_created_idx
  on public.onboarding_intake_submissions(user_id, created_at desc);

alter table public.onboarding_intake_submissions enable row level security;

drop policy if exists "Users manage their own intake submissions" on public.onboarding_intake_submissions;

create policy "Users manage their own intake submissions"
  on public.onboarding_intake_submissions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 15: identity and trust verification audit log
create table if not exists public.identity_verification_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_submission_id uuid references public.onboarding_intake_submissions(id) on delete set null,
  provider text not null default 'internal_rules',
  status text not null default 'pending' check (status in ('pending', 'verified', 'failed')),
  confidence integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists identity_verification_checks_user_created_idx
  on public.identity_verification_checks(user_id, created_at desc);

alter table public.identity_verification_checks enable row level security;

drop policy if exists "Users manage their own identity checks" on public.identity_verification_checks;

create policy "Users manage their own identity checks"
  on public.identity_verification_checks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
