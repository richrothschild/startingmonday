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
