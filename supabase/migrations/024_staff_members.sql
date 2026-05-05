-- Staff members for internal admin access
create table if not exists staff_members (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  role        text not null check (role in ('owner', 'admin', 'viewer')) default 'viewer',
  permissions jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  created_by  text
);

create index if not exists staff_members_email_idx on staff_members(email);

-- No RLS — accessed only via service role key (admin client)
-- Seed the owner
insert into staff_members (email, role, created_by)
values ('rothschild@gmail.com', 'owner', 'system')
on conflict (email) do nothing;
