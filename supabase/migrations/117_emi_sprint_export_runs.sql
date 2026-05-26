create table if not exists public.emi_sprint_export_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sprint_key text not null,
  export_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists emi_sprint_export_runs_user_created_idx
  on public.emi_sprint_export_runs(user_id, created_at desc);

create index if not exists emi_sprint_export_runs_sprint_created_idx
  on public.emi_sprint_export_runs(sprint_key, created_at desc);

alter table public.emi_sprint_export_runs enable row level security;

create policy "Users manage their own EMI sprint export runs"
  on public.emi_sprint_export_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());