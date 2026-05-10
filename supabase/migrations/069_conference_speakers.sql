-- 069: Conference speaker database
-- Dual use: (1) sales prospecting target list; (2) E2.3 conference circuit gap signal source.
-- Tracks speakers at technology leadership conferences.
-- conference_appearances enables gap detection: a speaker active in Y-2/Y-1 but absent in Y
-- implies a leadership change worth investigating.

create table public.conference_speakers (
  id              uuid        primary key default gen_random_uuid(),
  full_name       text        not null,
  first_name      text,
  last_name       text,
  title           text,
  company         text,
  linkedin_url    text        unique,
  pdl_id          text        unique,
  sector          text,
  notes           text,
  outreach_status text        not null default 'not_started'
                    check (outreach_status in (
                      'not_started', 'contacted', 'responded', 'converted', 'not_interested', 'skip'
                    )),
  outreach_date   date,
  outreach_notes  text,
  priority        integer     not null default 2
                    check (priority between 1 and 3),
  matched_user_id uuid        references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_speakers_company  on public.conference_speakers (company);
create index idx_speakers_status   on public.conference_speakers (outreach_status);
create index idx_speakers_priority on public.conference_speakers (priority, outreach_status);

alter table public.conference_speakers enable row level security;

-- One row per speaker per conference per year.
-- Unique constraint on (speaker_id, conference_name, conference_year) prevents duplicates on re-import.

create table public.conference_appearances (
  id               uuid        primary key default gen_random_uuid(),
  speaker_id       uuid        not null references public.conference_speakers(id) on delete cascade,
  conference_name  text        not null,
  conference_year  integer     not null,
  topic            text,
  session_type     text        check (session_type in (
                     'keynote', 'panel', 'workshop', 'fireside', 'lightning', 'other'
                   )),
  created_at       timestamptz not null default now(),
  unique (speaker_id, conference_name, conference_year)
);

create index idx_appearances_year       on public.conference_appearances (conference_year, conference_name);
create index idx_appearances_speaker_id on public.conference_appearances (speaker_id);

alter table public.conference_appearances enable row level security;
