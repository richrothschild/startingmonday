create table if not exists public.admin_shared_workspaces (
  workspace_key text primary key,
  workspace_state jsonb not null default '{}'::jsonb,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_shared_workspaces_updated_at_idx
  on public.admin_shared_workspaces (updated_at desc);

create or replace function public.touch_admin_shared_workspaces_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_admin_shared_workspaces_updated_at on public.admin_shared_workspaces;
create trigger trg_touch_admin_shared_workspaces_updated_at
before update on public.admin_shared_workspaces
for each row
execute function public.touch_admin_shared_workspaces_updated_at();

alter table public.admin_shared_workspaces enable row level security;

drop policy if exists "admin_shared_workspaces_select_service_role" on public.admin_shared_workspaces;
create policy "admin_shared_workspaces_select_service_role"
  on public.admin_shared_workspaces
  for select
  to service_role
  using (true);

drop policy if exists "admin_shared_workspaces_write_service_role" on public.admin_shared_workspaces;
create policy "admin_shared_workspaces_write_service_role"
  on public.admin_shared_workspaces
  for all
  to service_role
  using (true)
  with check (true);
