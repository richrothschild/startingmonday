-- E1.2: Board composition tracking via SEC DEF 14A (annual proxy statement).
-- board_snapshots stores the extracted director list from each proxy filing.
-- board_changes records additions and departures detected by diffing consecutive snapshots.

create table public.board_snapshots (
  id               uuid        primary key default gen_random_uuid(),
  company_id       uuid        not null references public.companies(id) on delete cascade,
  snapshot_date    date        not null,
  directors        jsonb       not null default '[]',
  -- Each director: { name, title, independent, tenure_years, committees[] }
  proxy_year       int,
  filing_date      date,
  accession_number text,
  created_at       timestamptz not null default now(),
  unique (company_id, accession_number)
);

create index idx_board_snapshots_company
  on public.board_snapshots (company_id, snapshot_date desc);

alter table public.board_snapshots enable row level security;
-- No user-scoped RLS — board data is company-level, read by the worker service only.
-- The worker uses the service-role key which bypasses RLS.

create table public.board_changes (
  id            uuid        primary key default gen_random_uuid(),
  company_id    uuid        not null references public.companies(id) on delete cascade,
  snapshot_id   uuid        references public.board_snapshots(id) on delete cascade,
  change_type   text        not null check (change_type in ('departure', 'addition')),
  director_name text        not null,
  director_title text,
  detected_at   timestamptz not null default now()
);

create index idx_board_changes_company
  on public.board_changes (company_id, detected_at desc);
