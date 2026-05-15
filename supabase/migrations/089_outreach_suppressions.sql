create table if not exists public.outreach_suppressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  reason text not null default 'manual',
  source text not null default 'manual' check (source in ('manual', 'unsubscribe', 'bounce', 'complaint', 'system')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, email)
);

create index if not exists outreach_suppressions_user_email_idx on public.outreach_suppressions(user_id, email);
create index if not exists outreach_suppressions_active_idx on public.outreach_suppressions(user_id, active);

alter table public.outreach_suppressions enable row level security;

create policy "Users manage their own outreach suppressions"
  on public.outreach_suppressions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.touch_outreach_suppressions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_outreach_suppressions_updated_at on public.outreach_suppressions;
create trigger trg_outreach_suppressions_updated_at
before update on public.outreach_suppressions
for each row execute function public.touch_outreach_suppressions_updated_at();
