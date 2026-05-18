-- Ticket 30: invoices and receipts
create table if not exists public.invoice_receipt_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_reference text,
  receipt_reference text,
  status text not null default 'generated' check (status in ('generated', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists invoice_receipt_runs_user_created_idx
  on public.invoice_receipt_runs(user_id, created_at desc);

alter table public.invoice_receipt_runs enable row level security;

create policy "Users manage their own invoice receipt runs"
  on public.invoice_receipt_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 31: billing renewal reminders
create table if not exists public.billing_renewal_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null,
  target_date date,
  sent_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);

create index if not exists billing_renewal_reminder_logs_user_sent_idx
  on public.billing_renewal_reminder_logs(user_id, sent_at desc);

alter table public.billing_renewal_reminder_logs enable row level security;

create policy "Users manage their own billing renewal reminder logs"
  on public.billing_renewal_reminder_logs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 32: failed payment retries
create table if not exists public.failed_payment_retry_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_invoice_id text,
  status text not null default 'no_action' check (status in ('retried', 'failed', 'no_action')),
  attempts integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists failed_payment_retry_runs_user_created_idx
  on public.failed_payment_retry_runs(user_id, created_at desc);

alter table public.failed_payment_retry_runs enable row level security;

create policy "Users manage their own failed payment retry runs"
  on public.failed_payment_retry_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 33: revenue recognition inputs
create table if not exists public.revenue_recognition_inputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  recognized_amount_cents integer not null default 0,
  deferred_amount_cents integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists revenue_recognition_inputs_user_created_idx
  on public.revenue_recognition_inputs(user_id, created_at desc);

alter table public.revenue_recognition_inputs enable row level security;

create policy "Users manage their own revenue recognition inputs"
  on public.revenue_recognition_inputs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 34: refund workflow triggers
create table if not exists public.refund_workflow_triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  amount_cents integer,
  status text not null default 'queued' check (status in ('queued', 'processed', 'rejected')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists refund_workflow_triggers_user_created_idx
  on public.refund_workflow_triggers(user_id, created_at desc);

alter table public.refund_workflow_triggers enable row level security;

create policy "Users manage their own refund workflow triggers"
  on public.refund_workflow_triggers
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 35: subscription status updates
create table if not exists public.subscription_status_update_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  previous_status text,
  new_status text not null,
  previous_tier text,
  new_tier text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists subscription_status_update_logs_user_created_idx
  on public.subscription_status_update_logs(user_id, created_at desc);

alter table public.subscription_status_update_logs enable row level security;

create policy "Users manage their own subscription status update logs"
  on public.subscription_status_update_logs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 36: payment reconciliation checks
create table if not exists public.payment_reconciliation_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'ok' check (status in ('ok', 'mismatch', 'error')),
  mismatch_count integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_reconciliation_checks_user_created_idx
  on public.payment_reconciliation_checks(user_id, created_at desc);

alter table public.payment_reconciliation_checks enable row level security;

create policy "Users manage their own payment reconciliation checks"
  on public.payment_reconciliation_checks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 37: Stripe/Supabase/accounting sync
create table if not exists public.revenue_sync_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'synced' check (status in ('synced', 'partial', 'failed')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists revenue_sync_runs_user_created_idx
  on public.revenue_sync_runs(user_id, created_at desc);

alter table public.revenue_sync_runs enable row level security;

create policy "Users manage their own revenue sync runs"
  on public.revenue_sync_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 38: mismatch flagging
create table if not exists public.revenue_mismatch_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  details jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists revenue_mismatch_flags_user_created_idx
  on public.revenue_mismatch_flags(user_id, created_at desc);

alter table public.revenue_mismatch_flags enable row level security;

create policy "Users manage their own revenue mismatch flags"
  on public.revenue_mismatch_flags
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 39: revenue classification
create table if not exists public.revenue_classification_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  classification_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists revenue_classification_runs_user_created_idx
  on public.revenue_classification_runs(user_id, created_at desc);

alter table public.revenue_classification_runs enable row level security;

create policy "Users manage their own revenue classification runs"
  on public.revenue_classification_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 40: payout matching
create table if not exists public.payout_matching_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  matched_count integer not null default 0,
  unmatched_count integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payout_matching_runs_user_created_idx
  on public.payout_matching_runs(user_id, created_at desc);

alter table public.payout_matching_runs enable row level security;

create policy "Users manage their own payout matching runs"
  on public.payout_matching_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 41: exception reporting
create table if not exists public.revenue_exception_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists revenue_exception_reports_user_created_idx
  on public.revenue_exception_reports(user_id, created_at desc);

alter table public.revenue_exception_reports enable row level security;

create policy "Users manage their own revenue exception reports"
  on public.revenue_exception_reports
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 42: bookkeeping entry preparation
create table if not exists public.bookkeeping_entry_preparation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  entries_payload jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bookkeeping_entry_preparation_runs_user_created_idx
  on public.bookkeeping_entry_preparation_runs(user_id, created_at desc);

alter table public.bookkeeping_entry_preparation_runs enable row level security;

create policy "Users manage their own bookkeeping entry preparation runs"
  on public.bookkeeping_entry_preparation_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 43: CI checks
create table if not exists public.ci_check_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'success', 'failed')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ci_check_runs_user_created_idx
  on public.ci_check_runs(user_id, created_at desc);

alter table public.ci_check_runs enable row level security;

create policy "Users manage their own ci check runs"
  on public.ci_check_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 44: lint and type check
create table if not exists public.lint_typecheck_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lint_status text not null default 'queued' check (lint_status in ('queued', 'success', 'failed')),
  typecheck_status text not null default 'queued' check (typecheck_status in ('queued', 'success', 'failed')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lint_typecheck_runs_user_created_idx
  on public.lint_typecheck_runs(user_id, created_at desc);

alter table public.lint_typecheck_runs enable row level security;

create policy "Users manage their own lint typecheck runs"
  on public.lint_typecheck_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 45: test execution
create table if not exists public.test_execution_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'success', 'failed')),
  test_suite text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists test_execution_runs_user_created_idx
  on public.test_execution_runs(user_id, created_at desc);

alter table public.test_execution_runs enable row level security;

create policy "Users manage their own test execution runs"
  on public.test_execution_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 46: release notes
create table if not exists public.release_note_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notes_markdown text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists release_note_runs_user_created_idx
  on public.release_note_runs(user_id, created_at desc);

alter table public.release_note_runs enable row level security;

create policy "Users manage their own release note runs"
  on public.release_note_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 47: deployment validation
create table if not exists public.deployment_validation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  environment text not null default 'production',
  status text not null default 'unknown' check (status in ('healthy', 'degraded', 'unknown')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists deployment_validation_runs_user_created_idx
  on public.deployment_validation_runs(user_id, created_at desc);

alter table public.deployment_validation_runs enable row level security;

create policy "Users manage their own deployment validation runs"
  on public.deployment_validation_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 48: error monitoring
create table if not exists public.error_monitoring_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  error_count integer not null default 0,
  severity text not null default 'low' check (severity in ('low', 'medium', 'high')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists error_monitoring_runs_user_created_idx
  on public.error_monitoring_runs(user_id, created_at desc);

alter table public.error_monitoring_runs enable row level security;

create policy "Users manage their own error monitoring runs"
  on public.error_monitoring_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 49: runtime health checks
create table if not exists public.runtime_health_check_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'healthy' check (status in ('healthy', 'warning', 'critical')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists runtime_health_check_runs_user_created_idx
  on public.runtime_health_check_runs(user_id, created_at desc);

alter table public.runtime_health_check_runs enable row level security;

create policy "Users manage their own runtime health check runs"
  on public.runtime_health_check_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 50: scheduled job observability
create table if not exists public.scheduled_job_observability_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_name text not null,
  status text not null default 'ok' check (status in ('ok', 'late', 'failed')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists scheduled_job_observability_runs_user_created_idx
  on public.scheduled_job_observability_runs(user_id, created_at desc);

alter table public.scheduled_job_observability_runs enable row level security;

create policy "Users manage their own scheduled job observability runs"
  on public.scheduled_job_observability_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 51: daily operating snapshots
create table if not exists public.daily_operating_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null,
  snapshot_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists daily_operating_snapshots_user_created_idx
  on public.daily_operating_snapshots(user_id, created_at desc);

alter table public.daily_operating_snapshots enable row level security;

create policy "Users manage their own daily operating snapshots"
  on public.daily_operating_snapshots
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 52: weekly KPI summaries
create table if not exists public.weekly_kpi_summary_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  summary_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists weekly_kpi_summary_runs_user_created_idx
  on public.weekly_kpi_summary_runs(user_id, created_at desc);

alter table public.weekly_kpi_summary_runs enable row level security;

create policy "Users manage their own weekly KPI summary runs"
  on public.weekly_kpi_summary_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 53: monthly business review packs
create table if not exists public.monthly_business_review_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  review_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists monthly_business_review_runs_user_created_idx
  on public.monthly_business_review_runs(user_id, created_at desc);

alter table public.monthly_business_review_runs enable row level security;

create policy "Users manage their own monthly business review runs"
  on public.monthly_business_review_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 54: exception lists
create table if not exists public.exception_list_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exception_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists exception_list_runs_user_created_idx
  on public.exception_list_runs(user_id, created_at desc);

alter table public.exception_list_runs enable row level security;

create policy "Users manage their own exception list runs"
  on public.exception_list_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 55: trend reports
create table if not exists public.trend_report_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trend_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trend_report_runs_user_created_idx
  on public.trend_report_runs(user_id, created_at desc);

alter table public.trend_report_runs enable row level security;

create policy "Users manage their own trend report runs"
  on public.trend_report_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Ticket 56: council review prep
create table if not exists public.council_review_prep_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prep_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists council_review_prep_runs_user_created_idx
  on public.council_review_prep_runs(user_id, created_at desc);

alter table public.council_review_prep_runs enable row level security;

create policy "Users manage their own council review prep runs"
  on public.council_review_prep_runs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());