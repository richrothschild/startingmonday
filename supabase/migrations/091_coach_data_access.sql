-- Coach data access: Enable coaches to view and edit client data with full audit trail

-- Add coach_access_enabled to team_seats to control access
alter table public.team_seats
  add column if not exists coach_access_enabled boolean not null default false,
  add column if not exists access_level text not null default 'read_write' check (access_level in ('read_only', 'read_write')),
  add column if not exists access_granted_at timestamptz,
  add column if not exists last_accessed_at timestamptz;

create index if not exists idx_team_seats_access on public.team_seats(owner_id, coach_access_enabled) where coach_access_enabled = true;

-- Audit log for coach data access
create table if not exists public.coach_access_logs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('view', 'update', 'create', 'delete')),
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

alter table public.coach_access_logs enable row level security;

create index if not exists idx_coach_access_logs_coach on public.coach_access_logs(coach_id);
create index if not exists idx_coach_access_logs_client on public.coach_access_logs(client_id);
create index if not exists idx_coach_access_logs_created on public.coach_access_logs(created_at desc);

-- Coaches can view their own access logs
create policy "coaches_view_own_logs" on public.coach_access_logs
  for select using (
    auth.uid() = coach_id
    or auth.uid() = client_id
  );

-- Coach alert preferences
create table if not exists public.coach_alert_preferences (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  alert_on_company_signal boolean not null default true,
  alert_on_new_interview boolean not null default true,
  alert_on_client_edit boolean not null default false,
  alert_frequency text not null default 'daily' check (alert_frequency in ('immediate', 'daily', 'weekly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(coach_id, client_id)
);

alter table public.coach_alert_preferences enable row level security;

create index if not exists idx_coach_prefs_coach_client on public.coach_alert_preferences(coach_id, client_id);

-- Coaches can manage their own preferences
create policy "coaches_manage_prefs" on public.coach_alert_preferences
  for all using (auth.uid() = coach_id);

-- Update team_seats RLS to allow coaches to query their access relationships
create policy "coaches_view_client_access" on public.team_seats
  for select using (
    auth.uid() = member_user_id 
    and coach_access_enabled = true
    and status = 'accepted'
  );

-- Update RLS on companies to allow coach access
-- Coaches can read/write companies if they have access granted
drop policy if exists "companies_own" on public.companies;

create policy "companies_own" on public.companies 
  for all using (auth.uid() = user_id);

create policy "coaches_access_companies" on public.companies
  for all using (
    exists (
      select 1 from public.team_seats
      where owner_id = user_id
      and member_user_id = auth.uid()
      and coach_access_enabled = true
      and status = 'accepted'
    )
  );

-- Update RLS on briefs
drop policy if exists "briefs_own" on public.briefs;

create policy "briefs_own" on public.briefs
  for all using (auth.uid() = user_id);

create policy "coaches_access_briefs" on public.briefs
  for all using (
    exists (
      select 1 from public.team_seats
      where owner_id = user_id
      and member_user_id = auth.uid()
      and coach_access_enabled = true
      and status = 'accepted'
    )
  );

-- Update RLS on company_signals
drop policy if exists "signals_own" on public.company_signals;

create policy "signals_own" on public.company_signals
  for all using (auth.uid() = user_id);

create policy "coaches_access_signals" on public.company_signals
  for all using (
    exists (
      select 1 from public.team_seats
      where owner_id = user_id
      and member_user_id = auth.uid()
      and coach_access_enabled = true
      and status = 'accepted'
    )
  );

-- Update RLS on interview_logs (if it exists)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'interview_logs') then
    drop policy if exists "interview_logs_own" on public.interview_logs;
    
    create policy "interview_logs_own" on public.interview_logs
      for all using (auth.uid() = user_id);
    
    create policy "coaches_access_interview_logs" on public.interview_logs
      for all using (
        exists (
          select 1 from public.team_seats
          where owner_id = user_id
          and member_user_id = auth.uid()
          and coach_access_enabled = true
          and status = 'accepted'
        )
      );
  end if;
end
$$;

-- Update RLS on contacts
drop policy if exists "contacts_own" on public.contacts;

create policy "contacts_own" on public.contacts
  for all using (auth.uid() = user_id);

create policy "coaches_access_contacts" on public.contacts
  for all using (
    exists (
      select 1 from public.team_seats
      where owner_id = user_id
      and member_user_id = auth.uid()
      and coach_access_enabled = true
      and status = 'accepted'
    )
  );

-- Update RLS on outreach_logs
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'outreach_logs') then
    drop policy if exists "outreach_logs_own" on public.outreach_logs;
    
    create policy "outreach_logs_own" on public.outreach_logs
      for all using (auth.uid() = user_id);
    
    create policy "coaches_access_outreach_logs" on public.outreach_logs
      for all using (
        exists (
          select 1 from public.team_seats
          where owner_id = user_id
          and member_user_id = auth.uid()
          and coach_access_enabled = true
          and status = 'accepted'
        )
      );
  end if;
end
$$;

-- Update RLS on company_documents
drop policy if exists "documents_own" on public.company_documents;

create policy "documents_own" on public.company_documents
  for all using (auth.uid() = user_id);

create policy "coaches_access_documents" on public.company_documents
  for all using (
    exists (
      select 1 from public.team_seats
      where owner_id = user_id
      and member_user_id = auth.uid()
      and coach_access_enabled = true
      and status = 'accepted'
    )
  );
