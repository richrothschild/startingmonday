create table if not exists public.automation_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source_table text not null,
  source_id uuid,
  alert_code text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  message text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists automation_alerts_user_status_created_idx
  on public.automation_alerts(user_id, status, created_at desc);

create index if not exists automation_alerts_source_idx
  on public.automation_alerts(source_table, created_at desc);

alter table public.automation_alerts enable row level security;

create policy "Users manage their own automation alerts"
  on public.automation_alerts
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.raise_automation_alert_if_needed()
returns trigger
language plpgsql
as $$
declare
  row_data jsonb;
  v_status text;
  v_lint_status text;
  v_typecheck_status text;
  v_severity text;
  v_alert_code text;
  v_message text;
  v_user_id uuid;
  v_source_id uuid;
  v_error_count integer;
  v_mismatch_count integer;
begin
  row_data := to_jsonb(new);
  v_status := coalesce(row_data->>'status', row_data->>'alert_level', '');
  v_lint_status := coalesce(row_data->>'lint_status', '');
  v_typecheck_status := coalesce(row_data->>'typecheck_status', '');
  v_severity := coalesce(row_data->>'severity', 'medium');
  v_user_id := nullif(row_data->>'user_id', '')::uuid;
  v_source_id := nullif(row_data->>'id', '')::uuid;
  v_error_count := coalesce((row_data->>'error_count')::integer, 0);
  v_mismatch_count := coalesce((row_data->>'mismatch_count')::integer, 0);

  if v_status in ('failed', 'risk', 'critical', 'mismatch', 'error', 'late', 'degraded', 'past_due')
      or v_lint_status = 'failed'
      or v_typecheck_status = 'failed'
     or v_severity = 'high'
     or v_error_count > 0
     or v_mismatch_count > 0 then
    v_alert_code := format('%s_%s', tg_table_name, case when v_status = '' then 'anomaly' else v_status end);
    v_message := format('Automation alert from %s: %s', tg_table_name, case when v_status = '' then 'anomaly detected' else v_status end);

    insert into public.automation_alerts (
      user_id,
      source_table,
      source_id,
      alert_code,
      severity,
      message,
      details,
      status
    ) values (
      v_user_id,
      tg_table_name,
      v_source_id,
      v_alert_code,
      case when v_severity in ('low', 'medium', 'high') then v_severity else 'medium' end,
      v_message,
      row_data,
      'open'
    );
  end if;

  return new;
end;
$$;

do $$
declare
  v_table_name text;
begin
  foreach v_table_name in array[
    'lead_scoring_runs',
    'usage_monitor_runs',
    'customer_health_checks',
    'support_issue_triage',
    'plan_change_requests',
    'failed_payment_retry_runs',
    'payment_reconciliation_checks',
    'revenue_sync_runs',
    'revenue_mismatch_flags',
    'ci_check_runs',
    'lint_typecheck_runs',
    'test_execution_runs',
    'deployment_validation_runs',
    'error_monitoring_runs',
    'runtime_health_check_runs',
    'scheduled_job_observability_runs'
  ] loop
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public' and table_name = v_table_name
    ) then
      execute format('drop trigger if exists trg_automation_alert_%I on public.%I', v_table_name, v_table_name);
      execute format(
        'create trigger trg_automation_alert_%I after insert or update on public.%I for each row execute function public.raise_automation_alert_if_needed()',
        v_table_name,
        v_table_name
      );
    end if;
  end loop;
end
$$;