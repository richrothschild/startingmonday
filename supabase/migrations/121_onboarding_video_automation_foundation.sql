-- Epic A Sprint 1 / Task A1:
-- Foundation schema and RLS for onboarding video automation.

create table if not exists public.onboarding_video_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workflow_key text not null check (workflow_key in ('onboarding_first_day', 'pipeline_weekly_rhythm', 'outreach_first_message')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  locale text not null default 'en-US',
  script_payload jsonb not null default '{}'::jsonb,
  variables_payload jsonb not null default '{}'::jsonb,
  last_published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workflow_key)
);

create table if not exists public.onboarding_video_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workflow_id uuid references public.onboarding_video_workflows(id) on delete set null,
  trigger_source text not null default 'manual' check (trigger_source in ('manual', 'event', 'cron', 'retry')),
  provider text not null default 'heygen',
  provider_run_id text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed', 'canceled')),
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  next_retry_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  error_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_video_run_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.onboarding_video_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_video_workflows_user_status_idx
  on public.onboarding_video_workflows(user_id, status, updated_at desc);

create index if not exists onboarding_video_runs_user_status_created_idx
  on public.onboarding_video_runs(user_id, status, created_at desc);

create index if not exists onboarding_video_runs_next_retry_idx
  on public.onboarding_video_runs(status, next_retry_at asc)
  where status = 'failed' and next_retry_at is not null;

create index if not exists onboarding_video_run_events_run_created_idx
  on public.onboarding_video_run_events(run_id, created_at asc);

alter table public.onboarding_video_workflows enable row level security;
alter table public.onboarding_video_runs enable row level security;
alter table public.onboarding_video_run_events enable row level security;

drop policy if exists "Users manage their own onboarding video workflows" on public.onboarding_video_workflows;
create policy "Users manage their own onboarding video workflows"
  on public.onboarding_video_workflows
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage their own onboarding video runs" on public.onboarding_video_runs;
create policy "Users manage their own onboarding video runs"
  on public.onboarding_video_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage their own onboarding video run events" on public.onboarding_video_run_events;
create policy "Users manage their own onboarding video run events"
  on public.onboarding_video_run_events
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.touch_onboarding_video_workflows_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_onboarding_video_workflows_updated_at on public.onboarding_video_workflows;
create trigger trg_onboarding_video_workflows_updated_at
before update on public.onboarding_video_workflows
for each row execute function public.touch_onboarding_video_workflows_updated_at();

create or replace function public.touch_onboarding_video_runs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_onboarding_video_runs_updated_at on public.onboarding_video_runs;
create trigger trg_onboarding_video_runs_updated_at
before update on public.onboarding_video_runs
for each row execute function public.touch_onboarding_video_runs_updated_at();
