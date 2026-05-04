-- Company intelligence signals detected from news sources
create table public.company_signals (
  id             uuid        primary key default gen_random_uuid(),
  company_id     uuid        not null references public.companies on delete cascade,
  user_id        uuid        not null references auth.users on delete cascade,
  signal_type    text        not null check (signal_type in (
                               'funding', 'exec_departure', 'exec_hire', 'acquisition',
                               'expansion', 'layoffs', 'ipo', 'new_product', 'award'
                             )),
  signal_summary text        not null,
  outreach_angle text,
  signal_date    date        not null,
  source_url     text,
  notified_at    timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.company_signals enable row level security;

create policy "Users manage own signals"
  on public.company_signals for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_company_signals_user_date
  on public.company_signals (user_id, signal_date desc);

create index idx_company_signals_company
  on public.company_signals (company_id, signal_date desc);

-- Partial index for un-notified signals (used by briefing job)
create index idx_company_signals_unnotified
  on public.company_signals (user_id, signal_date desc)
  where notified_at is null;
