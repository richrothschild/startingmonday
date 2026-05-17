-- Client-managed permissions for coach access.

create table if not exists public.coach_client_permissions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  access_enabled boolean not null default true,
  access_level text not null default 'read_write' check (access_level in ('read_only', 'read_write')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(coach_id, client_id)
);

alter table public.coach_client_permissions enable row level security;

create index if not exists idx_coach_client_permissions_coach_client
  on public.coach_client_permissions (coach_id, client_id);

create policy "clients_manage_own_coach_permissions"
  on public.coach_client_permissions
  for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "coaches_read_client_permissions"
  on public.coach_client_permissions
  for select
  using (auth.uid() = coach_id);
