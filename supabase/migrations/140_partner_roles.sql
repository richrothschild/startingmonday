-- Partner role model: firm_admin, counselor, participant, sponsor_viewer
-- Scoped to a partner workspace; supports multi-role per user if needed.

create table if not exists public.partner_roles (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  granted_by uuid references public.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint partner_roles_role_check check (role in (
    'firm_admin',
    'counselor',
    'participant',
    'sponsor_viewer'
  ))
);

-- A user can hold the same role at a partner only once (active constraint enforced in app)
create unique index if not exists partner_roles_active_unique_idx
  on public.partner_roles (partner_id, user_id, role)
  where (revoked_at is null);

create index if not exists partner_roles_partner_user_idx
  on public.partner_roles (partner_id, user_id);

create index if not exists partner_roles_user_idx
  on public.partner_roles (user_id);

alter table public.partner_roles enable row level security;

-- Only system admins (service role) can read/write; app uses admin client
drop policy if exists partner_roles_admin_only on public.partner_roles;
create policy partner_roles_admin_only on public.partner_roles
  for all using (false);
