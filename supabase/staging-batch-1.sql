-- Starting Monday - Initial Schema
-- Reflects actual deployed schema as of 2026-04-30.
-- Run in Supabase SQL Editor on a fresh project.

-- ── Utility ───────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Users ─────────────────────────────────────────────────────────────────────
-- subscription_tier: free | pro | executive
-- subscription_status: inactive | trialing | active | past_due | canceled

create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  stripe_customer_id text,
  subscription_tier text not null default 'free',
  subscription_status text not null default 'inactive',
  created_at timestamptz not null default now()
);

-- ── User profiles ─────────────────────────────────────────────────────────────
-- search_status: active | paused | closed
-- briefing_days: array of day names, e.g. {Monday,Wednesday,Friday}

create table public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  full_name text,
  resume_text text,
  resume_json jsonb,
  target_titles text[],
  target_sectors text[],
  target_locations text[],
  target_salary_min int,
  positioning_summary text,
  linkedin_headline text,
  linkedin_about text,
  linkedin_optimized jsonb,
  search_status text,
  briefing_time time,
  briefing_timezone text,
  briefing_days text[],
  search_started_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ── Companies ─────────────────────────────────────────────────────────────────
-- stage: watching | researching | applied | interviewing | offer
-- alert_threshold: minimum ai_score (0-100) to trigger a match alert
-- fit_score: manually set fit rating

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  career_page_url text,
  sector text,
  fit_score int,
  stage text not null default 'watching',
  notes text,
  last_checked_at timestamptz,
  alert_threshold int,
  archived_at timestamptz,
  archived_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Scan results ──────────────────────────────────────────────────────────────
-- One row per company scan (not per job posting).
-- raw_hits: [{title, score, is_match, summary, is_new}]
-- status: success | error

create table public.scan_results (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  status text not null,
  raw_hits jsonb,
  ai_score int,
  ai_summary text,
  notified_at timestamptz,
  error_message text
);

-- ── Contacts ──────────────────────────────────────────────────────────────────
-- channel: linkedin | referral | cold | inbound | event
-- status: active | archived

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  title text,
  firm text,
  channel text,
  status text not null default 'active',
  contacted_at timestamptz,
  follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Follow-ups ────────────────────────────────────────────────────────────────
-- status: pending | done | snoozed

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  due_date date not null,
  action text not null,
  status text not null default 'pending',
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Conversations ─────────────────────────────────────────────────────────────
-- messages: full conversation history [{role, content, ts}]

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  messages jsonb not null default '[]',
  token_count int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Drafts ────────────────────────────────────────────────────────────────────
-- draft_type: cover_letter | email | linkedin_message | follow_up

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  draft_type text not null,
  subject text,
  body text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Company signals ───────────────────────────────────────────────────────────
-- signal_type: hiring_surge | funding | exec_move | expansion | award

create table public.company_signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  signal_type text not null,
  signal_summary text not null,
  source_url text,
  signal_date date not null,
  outreach_angle text,
  notified_at timestamptz,
  detected_at timestamptz not null default now()
);

-- ── Momentum scores ───────────────────────────────────────────────────────────
-- Weekly score (0-100). components: breakdown by factor.

create table public.momentum_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  week_of date not null,
  score int not null check (score between 0 and 100),
  components jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, week_of)
);

-- ── Pipeline audit log ────────────────────────────────────────────────────────
-- initiated_by: 'user' | 'worker' | 'system'

create table public.pipeline_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  table_name text not null,
  record_id uuid not null,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  initiated_by text not null,
  created_at timestamptz not null default now()
);

-- ── Auth trigger ──────────────────────────────────────────────────────────────

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  insert into public.user_profiles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- ── Updated_at triggers ───────────────────────────────────────────────────────

create trigger set_updated_at before update on public.user_profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.companies
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.contacts
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.conversations
  for each row execute procedure public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index idx_companies_user_active on public.companies(user_id) where archived_at is null;
create index idx_scan_results_unnotified on public.scan_results(user_id, scanned_at) where notified_at is null;
create index idx_scan_results_company on public.scan_results(company_id, scanned_at desc);
create index idx_follow_ups_pending on public.follow_ups(user_id, due_date) where status = 'pending';
create index idx_contacts_user_active on public.contacts(user_id) where status = 'active';
create index idx_company_signals_company on public.company_signals(company_id, signal_date desc);

-- ── Row Level Security ────────────────────────────────────────────────────────

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
-- Prevent duplicate active company names per user.
-- Partial index: allows the same name to be re-added after archiving.
create unique index companies_active_name_unique
  on public.companies(user_id, name)
  where archived_at is null;
-- Track when each user's last briefing was sent to prevent duplicate sends.
alter table public.user_profiles
  add column if not exists last_briefing_sent_at timestamptz;
-- Tracks API usage per user per month for cost monitoring and rate limiting.
-- user_id is nullable: NULL = system-level (worker) usage not tied to a user.
-- service: 'anthropic' | 'browserless' | 'resend'

create table public.api_usage (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id) on delete cascade,
  service       text not null,
  month_key     text not null,  -- 'YYYY-MM'
  request_count int  not null default 0,
  token_count   int  not null default 0,
  updated_at    timestamptz not null default now()
);

-- NULLS NOT DISTINCT: two NULL user_ids for the same service+month conflict (Postgres 15+).
create unique index api_usage_unique
  on public.api_usage (user_id, service, month_key) nulls not distinct;

create index api_usage_month on public.api_usage (month_key, service);

alter table public.api_usage enable row level security;

create policy "api_usage_read_own"
  on public.api_usage for select
  using (auth.uid() = user_id);

-- Atomic upsert-increment so concurrent calls don't lose counts.
create or replace function public.increment_api_usage(
  p_user_id   uuid,
  p_service   text,
  p_month_key text,
  p_requests  int default 1,
  p_tokens    int default 0
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into api_usage (user_id, service, month_key, request_count, token_count)
  values (p_user_id, p_service, p_month_key, p_requests, p_tokens)
  on conflict (user_id, service, month_key) do update
    set request_count = api_usage.request_count + excluded.request_count,
        token_count   = api_usage.token_count   + excluded.token_count,
        updated_at    = now();
end;
$$;
-- Company-level documents: job descriptions, news, annual reports, org notes.
-- Attached to company (not a prep session) so they persist across all prep generations.

create table public.company_documents (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  label      text not null,   -- 'job_description' | 'news' | 'annual_report' | 'org_notes' | 'other'
  content    text not null,
  created_at timestamptz not null default now()
);

create index company_documents_company on public.company_documents (company_id, user_id);

alter table public.company_documents enable row level security;

create policy "documents_select_own" on public.company_documents
  for select using (auth.uid() = user_id);

create policy "documents_insert_own" on public.company_documents
  for insert with check (auth.uid() = user_id);

create policy "documents_delete_own" on public.company_documents
  for delete using (auth.uid() = user_id);
-- New profile fields captured during onboarding.
-- onboarding_completed_at: null = new user who hasn't been through onboarding.

alter table public.user_profiles
  add column if not exists current_title           text,
  add column if not exists current_company         text,
  add column if not exists employment_status       text,
  add column if not exists search_timeline         text,
  add column if not exists linkedin_url            text,
  add column if not exists resume_text             text,
  add column if not exists beyond_resume           text,
  add column if not exists dream_job               text,
  add column if not exists dream_companies         text,
  add column if not exists onboarding_completed_at timestamptz;

-- Existing users are already set up - don't redirect them to onboarding.
update public.user_profiles
  set onboarding_completed_at = now()
  where onboarding_completed_at is null;
-- Security: company_documents was missing an UPDATE policy.
-- Without it, UPDATE calls bypass RLS and affect any row matching the id.
create policy "documents_update_own" on public.company_documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Performance indexes for queries that will degrade at 1k+ users.

-- briefing-job queries scan_results filtered by user_id + status + ai_score.
create index if not exists idx_scan_results_user_score
  on public.scan_results(user_id, ai_score desc)
  where status = 'success';

-- follow-ups queried by user_id + due_date where status = 'pending' throughout the app.
create index if not exists idx_follow_ups_pending_user
  on public.follow_ups(user_id, due_date)
  where status = 'pending';

-- conversation route always fetches latest conversation per user.
create index if not exists idx_conversations_user_updated
  on public.conversations(user_id, updated_at desc);

-- companies queried with is('archived_at', null) throughout the app.
create index if not exists idx_companies_user_active
  on public.companies(user_id, fit_score desc nulls last)
  where archived_at is null;

-- Advisory lock helpers for distributed scan job deduplication.
-- Prevents two worker instances from scanning the same batch concurrently.
create or replace function public.try_advisory_lock(p_key bigint)
  returns boolean language plpgsql security definer set search_path = public as $$
begin
  return pg_try_advisory_lock(p_key);
end;
$$;

create or replace function public.advisory_unlock(p_key bigint)
  returns void language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_unlock(p_key);
end;
$$;
-- Add trial tracking and Stripe billing fields

alter table public.users
  add column if not exists trial_ends_at timestamptz,
  add column if not exists subscription_period_end timestamptz;

-- Backfill trial for existing users who haven't subscribed yet
update public.users
set trial_ends_at = created_at + interval '7 days',
    subscription_status = 'trialing'
where subscription_status = 'inactive'
  and trial_ends_at is null;

-- Update auth trigger to set trial on new signups
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, subscription_status, trial_ends_at)
  values (new.id, new.email, 'trialing', now() + interval '7 days');
  insert into public.user_profiles (user_id) values (new.id);
  return new;
end;
$$;
-- Idempotency table for Stripe webhook events (prevents double-processing on retries)
create table if not exists public.processed_stripe_events (
  event_id  text        primary key,
  processed_at timestamptz not null default now()
);

-- Service role only - no user access
alter table public.processed_stripe_events enable row level security;

-- Fix trial backfill: some existing users had trial_ends_at set in the past
-- (migration 008 ran weeks after account creation). Reset them to 7 days from now.
update public.users
set trial_ends_at = now() + interval '7 days'
where subscription_status = 'trialing'
  and trial_ends_at < now();
-- Performance indexes for users table queries that will degrade as the table grows.
-- subscription_status is filtered in billing checks and webhook handlers.
-- trial_ends_at is scanned by the trial-expiry path and backfill queries.

create index if not exists idx_users_subscription_status
  on public.users (subscription_status);

create index if not exists idx_users_trial_ends_at
  on public.users (trial_ends_at)
  where trial_ends_at is not null;
