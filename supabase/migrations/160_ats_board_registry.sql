-- 160: ATS board registry (T3.4). Caches detected Greenhouse/Lever/Ashby
-- boards per canonical company so the poller polls known boards directly and
-- avoids re-probing companies whose ATS could not be found.

create table if not exists public.ats_boards (
  id uuid primary key default gen_random_uuid(),
  canonical_company_id uuid not null unique references public.canonical_companies(id) on delete cascade,
  provider text,
  board_token text,
  status text not null default 'active', -- active | not_found
  detected_via text, -- career_page_url | probe
  probe_attempts int not null default 0,
  last_probed_at timestamptz,
  last_polled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ats_boards_status_idx
  on public.ats_boards (status, last_polled_at);

-- Service-role only: RLS enabled with no policies.
alter table public.ats_boards enable row level security;
