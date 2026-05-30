-- Epic A / Task A4:
-- normalized onboarding video webhook persistence with replay-safe dedupe.

create table if not exists public.onboarding_video_webhook_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  provider text not null default 'unknown',
  dedupe_key text not null,
  provider_event_id text,
  provider_run_id text,
  event_type text not null,
  event_status text not null default 'received' check (event_status in ('received', 'processed', 'ignored', 'failed')),
  matched_run_count integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, dedupe_key)
);

create index if not exists onboarding_video_webhook_events_received_idx
  on public.onboarding_video_webhook_events(received_at desc);

create index if not exists onboarding_video_webhook_events_provider_run_idx
  on public.onboarding_video_webhook_events(provider, provider_run_id)
  where provider_run_id is not null;

create index if not exists onboarding_video_webhook_events_event_id_idx
  on public.onboarding_video_webhook_events(provider, provider_event_id)
  where provider_event_id is not null;

alter table public.onboarding_video_webhook_events enable row level security;

drop policy if exists "Users read their onboarding video webhook events" on public.onboarding_video_webhook_events;
create policy "Users read their onboarding video webhook events"
  on public.onboarding_video_webhook_events
  for select
  using (user_id = auth.uid());

create or replace function public.touch_onboarding_video_webhook_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_onboarding_video_webhook_events_updated_at on public.onboarding_video_webhook_events;
create trigger trg_onboarding_video_webhook_events_updated_at
before update on public.onboarding_video_webhook_events
for each row execute function public.touch_onboarding_video_webhook_events_updated_at();
