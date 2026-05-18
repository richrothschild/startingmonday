-- Ticket 16: context capture
create table if not exists public.onboarding_context_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'automation',
  context_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_context_snapshots_user_created_idx
  on public.onboarding_context_snapshots(user_id, created_at desc);

alter table public.onboarding_context_snapshots enable row level security;

create policy "Users manage their own onboarding context snapshots"
  on public.onboarding_context_snapshots
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 17: first brief generation tracking
create table if not exists public.onboarding_brief_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  context_snapshot_id uuid references public.onboarding_context_snapshots(id) on delete set null,
  status text not null default 'generated' check (status in ('generated', 'failed')),
  brief_text text,
  created_at timestamptz not null default now(),
  error_message text
);

create index if not exists onboarding_brief_runs_user_created_idx
  on public.onboarding_brief_runs(user_id, created_at desc);

alter table public.onboarding_brief_runs enable row level security;

create policy "Users manage their own onboarding brief runs"
  on public.onboarding_brief_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 18: workflow assignment
create table if not exists public.onboarding_workflow_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workflow_key text not null,
  assignment_reason text,
  assigned_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'completed', 'paused'))
);

create index if not exists onboarding_workflow_assignments_user_assigned_idx
  on public.onboarding_workflow_assignments(user_id, assigned_at desc);

alter table public.onboarding_workflow_assignments enable row level security;

create policy "Users manage their own onboarding workflow assignments"
  on public.onboarding_workflow_assignments
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 19 and 20: first milestones and reminders
create table if not exists public.activation_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_alert_at timestamptz,
  first_brief_at timestamptz,
  first_action_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.activation_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null,
  sent_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);

create index if not exists activation_reminder_logs_user_sent_idx
  on public.activation_reminder_logs(user_id, sent_at desc);

alter table public.activation_milestones enable row level security;
alter table public.activation_reminder_logs enable row level security;

create policy "Users manage their own activation milestones"
  on public.activation_milestones
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users manage their own activation reminder logs"
  on public.activation_reminder_logs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 21: usage monitoring
create table if not exists public.usage_monitor_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metrics jsonb not null default '{}'::jsonb,
  alert_level text not null default 'normal' check (alert_level in ('normal', 'watch', 'risk')),
  created_at timestamptz not null default now()
);

create index if not exists usage_monitor_runs_user_created_idx
  on public.usage_monitor_runs(user_id, created_at desc);

alter table public.usage_monitor_runs enable row level security;

create policy "Users manage their own usage monitor runs"
  on public.usage_monitor_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 22: health checks
create table if not exists public.customer_health_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  health_score integer not null default 0,
  status text not null default 'watch' check (status in ('healthy', 'watch', 'risk')),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists customer_health_checks_user_created_idx
  on public.customer_health_checks(user_id, created_at desc);

alter table public.customer_health_checks enable row level security;

create policy "Users manage their own customer health checks"
  on public.customer_health_checks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 23: renewal reminders
create table if not exists public.renewal_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null,
  target_date date,
  sent_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);

create index if not exists renewal_reminder_logs_user_sent_idx
  on public.renewal_reminder_logs(user_id, sent_at desc);

alter table public.renewal_reminder_logs enable row level security;

create policy "Users manage their own renewal reminder logs"
  on public.renewal_reminder_logs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 24: inactivity nudges
create table if not exists public.inactivity_nudge_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nudge_type text not null,
  sent_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);

create index if not exists inactivity_nudge_logs_user_sent_idx
  on public.inactivity_nudge_logs(user_id, sent_at desc);

alter table public.inactivity_nudge_logs enable row level security;

create policy "Users manage their own inactivity nudge logs"
  on public.inactivity_nudge_logs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 25: issue triage
create table if not exists public.support_issue_triage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  issue_text text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  category text not null default 'general',
  route_to text not null default 'support_queue',
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists support_issue_triage_user_created_idx
  on public.support_issue_triage(user_id, created_at desc);

alter table public.support_issue_triage enable row level security;

create policy "Users manage their own support issue triage"
  on public.support_issue_triage
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 26: FAQ responses
create table if not exists public.faq_response_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  confidence integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists faq_response_logs_user_created_idx
  on public.faq_response_logs(user_id, created_at desc);

alter table public.faq_response_logs enable row level security;

create policy "Users manage their own faq response logs"
  on public.faq_response_logs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 27: help center routing
create table if not exists public.help_center_routing_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  issue_text text not null,
  routed_article_slug text not null,
  route_reason text,
  created_at timestamptz not null default now()
);

create index if not exists help_center_routing_logs_user_created_idx
  on public.help_center_routing_logs(user_id, created_at desc);

alter table public.help_center_routing_logs enable row level security;

create policy "Users manage their own help center routing logs"
  on public.help_center_routing_logs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 28: customer status reporting
create table if not exists public.customer_status_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists customer_status_reports_user_created_idx
  on public.customer_status_reports(user_id, created_at desc);

alter table public.customer_status_reports enable row level security;

create policy "Users manage their own customer status reports"
  on public.customer_status_reports
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 29: plan changes
create table if not exists public.plan_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_plan text,
  to_plan text not null,
  reason text,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'completed')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists plan_change_requests_user_requested_idx
  on public.plan_change_requests(user_id, requested_at desc);

alter table public.plan_change_requests enable row level security;

create policy "Users manage their own plan change requests"
  on public.plan_change_requests
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
