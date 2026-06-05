create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_unprocessed_received_idx
  on public.stripe_webhook_events(received_at asc)
  where processed_at is null;

create index if not exists stripe_webhook_events_event_type_idx
  on public.stripe_webhook_events(event_type, received_at desc);

alter table public.stripe_webhook_events enable row level security;

create or replace function public.touch_stripe_webhook_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_stripe_webhook_events_updated_at on public.stripe_webhook_events;
create trigger trg_stripe_webhook_events_updated_at
before update on public.stripe_webhook_events
for each row execute function public.touch_stripe_webhook_events_updated_at();