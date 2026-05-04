-- Persistent rate limiting table.
-- Replaces the in-memory Map in /api/optimize (which resets on every deploy)
-- and provides daily per-user caps across all AI routes.
--
-- key:    IP address (for public endpoints) or "user:<uuid>" (for auth'd users)
-- window: 'YYYY-MM-DD' for daily caps, 'YYYY-MM' for monthly (future use)

create table if not exists public.rate_limits (
  key        text        not null,
  period     text        not null,  -- 'YYYY-MM-DD' daily or 'YYYY-MM' monthly
  count      integer     not null default 0,
  updated_at timestamptz not null default now(),
  primary key (key, period)
);

-- Atomically increment the counter and return whether the caller is still within limit.
-- security definer so the anon role can call it (used by /api/optimize).
create or replace function public.check_and_increment_rate_limit(
  p_key    text,
  p_window text,
  p_limit  integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits (key, period, count, updated_at)
  values (p_key, p_window, 1, now())
  on conflict (key, period)
  do update set
    count      = rate_limits.count + 1,
    updated_at = now()
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

grant execute on function public.check_and_increment_rate_limit to anon, authenticated;

-- Read-only count check — used by isRateLimited to inspect daily usage
-- without incrementing (increment happens in trackApiUsage after success).
create or replace function public.get_rate_limit_count(
  p_key    text,
  p_window text
) returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select count from public.rate_limits where key = p_key and period = p_window),
    0
  );
$$;

grant execute on function public.get_rate_limit_count to authenticated;

-- Useful query for abuse investigation (run in Supabase SQL Editor):
-- select key, period, count from public.rate_limits
-- where key like 'user:%' and period = current_date::text and count > 10
-- order by count desc;
