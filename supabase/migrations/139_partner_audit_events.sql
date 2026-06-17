create table if not exists public.partner_audit_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.partner_audit_events
  add constraint partner_audit_events_action_check
  check (action in (
    'settings_accessed',
    'white_label_updated',
    'program_settings_updated',
    'report_export_generated',
    'role_linked'
  ));

create index if not exists partner_audit_events_partner_created_idx
  on public.partner_audit_events (partner_id, created_at desc);

alter table public.partner_audit_events enable row level security;

drop policy if exists partner_audit_events_admin_only on public.partner_audit_events;
create policy partner_audit_events_admin_only on public.partner_audit_events
  for all using (false);