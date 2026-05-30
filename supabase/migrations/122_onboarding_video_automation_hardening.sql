-- Epic A Sprint 1 / Task A1 hardening:
-- enforce tenant integrity between workflow/runs/events and tighten retry invariants.

create unique index if not exists onboarding_video_workflows_id_user_idx
  on public.onboarding_video_workflows(id, user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'onboarding_video_runs_workflow_user_fk'
      and conrelid = 'public.onboarding_video_runs'::regclass
  ) then
    alter table public.onboarding_video_runs
      add constraint onboarding_video_runs_workflow_user_fk
      foreign key (workflow_id, user_id)
      references public.onboarding_video_workflows(id, user_id)
      on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'onboarding_video_runs_retry_bounds_ck'
      and conrelid = 'public.onboarding_video_runs'::regclass
  ) then
    alter table public.onboarding_video_runs
      add constraint onboarding_video_runs_retry_bounds_ck
      check (max_retries >= 0 and max_retries <= 10 and retry_count >= 0 and retry_count <= max_retries);
  end if;
end
$$;

create or replace function public.sync_onboarding_video_run_event_user()
returns trigger
language plpgsql
as $$
declare
  run_owner uuid;
begin
  select r.user_id
  into run_owner
  from public.onboarding_video_runs r
  where r.id = new.run_id;

  if run_owner is null then
    raise exception 'Invalid run_id for onboarding_video_run_events';
  end if;

  new.user_id = run_owner;
  return new;
end;
$$;

drop trigger if exists trg_sync_onboarding_video_run_event_user on public.onboarding_video_run_events;
create trigger trg_sync_onboarding_video_run_event_user
before insert or update on public.onboarding_video_run_events
for each row execute function public.sync_onboarding_video_run_event_user();

drop policy if exists "Users manage their own onboarding video run events" on public.onboarding_video_run_events;
create policy "Users manage their own onboarding video run events"
  on public.onboarding_video_run_events
  for all
  using (
    exists (
      select 1
      from public.onboarding_video_runs r
      where r.id = onboarding_video_run_events.run_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.onboarding_video_runs r
      where r.id = onboarding_video_run_events.run_id
        and r.user_id = auth.uid()
    )
  );
