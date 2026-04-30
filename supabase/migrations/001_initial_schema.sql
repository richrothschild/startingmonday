-- Starting Monday — Initial Schema
-- Run in Supabase SQL Editor (already applied 2026-04-29)

-- Enums
create type user_tier as enum ('monitor', 'active', 'executive', 'coach');
create type company_status as enum ('monitoring', 'active', 'archived');
create type follow_up_status as enum ('pending', 'done', 'snoozed');
create type draft_type as enum ('cover_letter', 'email', 'linkedin_message', 'follow_up');

-- Users (mirrors auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  tier user_tier not null default 'monitor',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

-- User profiles
create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text,
  current_title text,
  target_roles text[],
  target_industries text[],
  resume_text text,
  linkedin_url text,
  updated_at timestamptz not null default now()
);

-- Companies being tracked
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  domain text,
  career_page_url text,
  status company_status not null default 'active',
  last_scanned_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

-- Job postings detected by scanner
create table public.scan_results (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  job_title text not null,
  job_url text,
  department text,
  location text,
  detected_at timestamptz not null default now(),
  notified_at timestamptz,
  is_match boolean not null default false,
  match_score int,
  match_reasons text[]
);

-- Contacts at target companies
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  title text,
  linkedin_url text,
  email text,
  relationship_strength int default 0 check (relationship_strength between 0 and 10),
  notes text,
  last_contacted_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Follow-up reminders
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  due_date date not null,
  status follow_up_status not null default 'pending',
  note text,
  created_at timestamptz not null default now()
);

-- AI chat conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generated drafts (cover letters, emails, etc.)
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  type draft_type not null,
  content text not null,
  subject text,
  target_contact_id uuid references public.contacts(id) on delete set null,
  target_company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Company intelligence signals (hiring surge, funding, exec moves)
create table public.company_signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  signal_type text not null,
  signal_text text not null,
  source_url text,
  detected_at timestamptz not null default now()
);

-- Daily momentum scores
create table public.momentum_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  score_date date not null,
  score int not null check (score between 0 and 100),
  factors jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, score_date)
);

-- Audit log (read-only for users)
create table public.pipeline_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  table_name text not null,
  record_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Auto-create user record on signup
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  insert into public.user_profiles (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.user_profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.companies
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.contacts
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.conversations
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.drafts
  for each row execute procedure public.set_updated_at();

-- Performance indexes
create index idx_companies_user_active on public.companies(user_id) where archived_at is null;
create index idx_scan_results_unnotified on public.scan_results(user_id, detected_at) where notified_at is null;
create index idx_scan_results_company on public.scan_results(company_id, detected_at desc);
create index idx_follow_ups_pending on public.follow_ups(user_id, due_date) where status = 'pending';
create index idx_contacts_user on public.contacts(user_id) where archived_at is null;
create index idx_company_signals_company on public.company_signals(company_id, detected_at desc);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.scan_results enable row level security;
alter table public.contacts enable row level security;
alter table public.follow_ups enable row level security;
alter table public.conversations enable row level security;
alter table public.drafts enable row level security;
alter table public.company_signals enable row level security;
alter table public.momentum_scores enable row level security;
alter table public.pipeline_audit_log enable row level security;

-- RLS policies (users see only their own data)
create policy "users_own" on public.users for all using (auth.uid() = id);
create policy "user_profiles_own" on public.user_profiles for all using (auth.uid() = user_id);
create policy "companies_own" on public.companies for all using (auth.uid() = user_id);
create policy "scan_results_own" on public.scan_results for all using (auth.uid() = user_id);
create policy "contacts_own" on public.contacts for all using (auth.uid() = user_id);
create policy "follow_ups_own" on public.follow_ups for all using (auth.uid() = user_id);
create policy "conversations_own" on public.conversations for all using (auth.uid() = user_id);
create policy "drafts_own" on public.drafts for all using (auth.uid() = user_id);
create policy "company_signals_own" on public.company_signals for all using (auth.uid() = user_id);
create policy "momentum_scores_own" on public.momentum_scores for all using (auth.uid() = user_id);
create policy "audit_log_read" on public.pipeline_audit_log for select using (auth.uid() = user_id);
