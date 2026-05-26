create table if not exists public.google_calendar_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'google' check (provider = 'google'),
  calendar_id text not null default 'primary',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint google_calendar_integrations_user_unique unique (user_id)
);

create index if not exists google_calendar_integrations_active_idx
  on public.google_calendar_integrations (active);

create table if not exists public.google_calendar_events (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.google_calendar_integrations(id) on delete cascade,
  source_type text not null,
  source_uid text not null,
  google_event_id text not null,
  summary text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  description text,
  event_status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint google_calendar_events_source_unique unique (integration_id, source_type, source_uid)
);

create index if not exists google_calendar_events_integration_idx
  on public.google_calendar_events (integration_id);

alter table public.google_calendar_integrations enable row level security;
alter table public.google_calendar_events enable row level security;

create policy "Users can view their calendar integrations"
  on public.google_calendar_integrations
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their calendar integrations"
  on public.google_calendar_integrations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their calendar integrations"
  on public.google_calendar_integrations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their calendar integrations"
  on public.google_calendar_integrations
  for delete
  using (auth.uid() = user_id);

create policy "Users can view their calendar events"
  on public.google_calendar_events
  for select
  using (
    exists (
      select 1
      from public.google_calendar_integrations gci
      where gci.id = integration_id
        and gci.user_id = auth.uid()
    )
  );

create policy "Users can insert their calendar events"
  on public.google_calendar_events
  for insert
  with check (
    exists (
      select 1
      from public.google_calendar_integrations gci
      where gci.id = integration_id
        and gci.user_id = auth.uid()
    )
  );

create policy "Users can update their calendar events"
  on public.google_calendar_events
  for update
  using (
    exists (
      select 1
      from public.google_calendar_integrations gci
      where gci.id = integration_id
        and gci.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.google_calendar_integrations gci
      where gci.id = integration_id
        and gci.user_id = auth.uid()
    )
  );

create policy "Users can delete their calendar events"
  on public.google_calendar_events
  for delete
  using (
    exists (
      select 1
      from public.google_calendar_integrations gci
      where gci.id = integration_id
        and gci.user_id = auth.uid()
    )
  );

create trigger set_google_calendar_integrations_updated_at
before update on public.google_calendar_integrations
for each row execute function public.set_updated_at();

create trigger set_google_calendar_events_updated_at
before update on public.google_calendar_events
for each row execute function public.set_updated_at();
