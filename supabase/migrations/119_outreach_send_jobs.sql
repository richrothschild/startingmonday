create table if not exists public.outreach_send_batches (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('live', 'test_to_self')),
  campaign_step text,
  template_step text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'completed_with_failures')),
  requested_count integer not null default 0,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach_send_jobs (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.outreach_send_batches(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  recipient_email text not null,
  provider text not null default 'resend',
  provider_message_id text,
  state text not null default 'queued' check (state in ('queued', 'sending', 'accepted', 'delivered', 'bounced', 'complained', 'replied', 'failed')),
  attempt_count integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  accepted_at timestamptz,
  completed_at timestamptz,
  locked_at timestamptz,
  locked_by text,
  domain_bucket text not null default 'corporate' check (domain_bucket in ('gmail', 'microsoft', 'corporate')),
  idempotency_key text,
  payload jsonb not null,
  last_error jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outreach_send_batches_user_created_idx
  on public.outreach_send_batches(user_id, created_at desc);

create index if not exists outreach_send_jobs_batch_idx
  on public.outreach_send_jobs(batch_id, created_at asc);

create index if not exists outreach_send_jobs_due_idx
  on public.outreach_send_jobs(state, next_attempt_at asc);

create index if not exists outreach_send_jobs_provider_message_idx
  on public.outreach_send_jobs(provider_message_id)
  where provider_message_id is not null;

create unique index if not exists outreach_send_jobs_user_idempotency_idx
  on public.outreach_send_jobs(user_id, idempotency_key)
  where idempotency_key is not null;

alter table public.outreach_send_batches enable row level security;
alter table public.outreach_send_jobs enable row level security;

create policy "Users manage their own outreach send batches"
  on public.outreach_send_batches
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users manage their own outreach send jobs"
  on public.outreach_send_jobs
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.touch_outreach_send_batches_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_outreach_send_batches_updated_at on public.outreach_send_batches;
create trigger trg_outreach_send_batches_updated_at
before update on public.outreach_send_batches
for each row execute function public.touch_outreach_send_batches_updated_at();

create or replace function public.touch_outreach_send_jobs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_outreach_send_jobs_updated_at on public.outreach_send_jobs;
create trigger trg_outreach_send_jobs_updated_at
before update on public.outreach_send_jobs
for each row execute function public.touch_outreach_send_jobs_updated_at();