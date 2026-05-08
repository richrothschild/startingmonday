-- Team seats for multi-seat B2B accounts
create table if not exists public.team_seats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_email text not null,
  member_user_id uuid references auth.users(id) on delete set null,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'pending',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique(owner_id, member_email)
);

create index if not exists idx_team_seats_owner on public.team_seats(owner_id);
create index if not exists idx_team_seats_token on public.team_seats(token);
create index if not exists idx_team_seats_member on public.team_seats(member_user_id);

alter table public.team_seats enable row level security;

create policy "owners_select_seats" on public.team_seats
  for select using (auth.uid() = owner_id);

create policy "members_select_seat" on public.team_seats
  for select using (auth.uid() = member_user_id);

create policy "owners_insert_seats" on public.team_seats
  for insert with check (auth.uid() = owner_id);

create policy "owners_delete_seats" on public.team_seats
  for delete using (auth.uid() = owner_id);

-- Partner inquiries from the /partners public form
create table if not exists public.partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  role text not null,
  how_heard text,
  interests text,
  created_at timestamptz not null default now()
);

alter table public.partner_inquiries enable row level security;

create policy "insert_partner_inquiry" on public.partner_inquiries
  for insert with check (true);
