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
