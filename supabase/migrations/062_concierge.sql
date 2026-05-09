-- Sprint 6: Executive Concierge tier
-- Adds is_concierge flag and concierge_calls table for monthly strategy calls.

alter table user_profiles add column if not exists is_concierge boolean not null default false;

create table if not exists concierge_calls (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  status       text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  agenda       jsonb not null default '[]',
  call_notes   text,
  created_at   timestamptz not null default now()
);

create index if not exists concierge_calls_user_id_idx on concierge_calls(user_id);
create index if not exists concierge_calls_scheduled_at_idx on concierge_calls(scheduled_at);

alter table concierge_calls enable row level security;

create policy "Users read own concierge calls"
  on concierge_calls for select
  using (auth.uid() = user_id);
