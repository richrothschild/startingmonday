-- Executive Brief: full Grill Me protocol sessions, artifacts, and transcription consent/integration placeholders.

create table if not exists public.executive_grill_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  goal text not null,
  intents text,
  context text,
  mode text not null check (mode in ('focused', 'stress', 'board')),
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  artifact_slug text not null,
  artifact_markdown text not null,
  current_question_id text not null,
  current_question text not null,
  last_confirmation text,
  next_question_number integer not null default 2,
  next_flag_number integer not null default 1,
  entries_count integer not null default 0,
  open_flags_count integer not null default 0,
  council_verdicts jsonb not null default '{}'::jsonb,
  council_verdicts_updated boolean not null default false,
  ceo_summary jsonb not null default '{}'::jsonb,
  ceo_summary_updated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists executive_grill_sessions_user_idx
  on public.executive_grill_sessions (user_id, created_at desc);

create table if not exists public.executive_grill_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.executive_grill_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  asked text not null,
  answer text not null,
  captured text not null,
  council_voices jsonb not null default '[]'::jsonb,
  consequence_chains jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists executive_grill_entries_session_question_idx
  on public.executive_grill_entries (session_id, question_id);

create table if not exists public.executive_grill_flags (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.executive_grill_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  flag_id text not null,
  description text not null,
  owner text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists executive_grill_flags_session_flag_idx
  on public.executive_grill_flags (session_id, flag_id);

create index if not exists executive_grill_flags_open_idx
  on public.executive_grill_flags (session_id, status)
  where status = 'open';

create table if not exists public.executive_transcription_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null default 'meeting_transcription_analysis',
  jurisdiction text,
  acknowledged_text text,
  consented_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists executive_transcription_consents_user_idx
  on public.executive_transcription_consents (user_id, consented_at desc);

create table if not exists public.executive_transcription_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('otter', 'fireflies', 'fathom', 'grain', 'gong', 'other')),
  connection_label text,
  status text not null default 'connected' check (status in ('connected', 'disconnected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists executive_transcription_connections_user_idx
  on public.executive_transcription_connections (user_id, provider, created_at desc);

create table if not exists public.executive_meeting_transcripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.executive_grill_sessions(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  consent_id uuid references public.executive_transcription_consents(id) on delete set null,
  source_type text not null check (source_type in ('paste', 'provider_import')),
  provider text check (provider in ('otter', 'fireflies', 'fathom', 'grain', 'gong', 'other')),
  title text,
  transcript_text text not null,
  notes_text text,
  analyzed_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists executive_meeting_transcripts_user_idx
  on public.executive_meeting_transcripts (user_id, created_at desc);

alter table public.executive_grill_sessions enable row level security;
alter table public.executive_grill_entries enable row level security;
alter table public.executive_grill_flags enable row level security;
alter table public.executive_transcription_consents enable row level security;
alter table public.executive_transcription_connections enable row level security;
alter table public.executive_meeting_transcripts enable row level security;

create policy "executive_grill_sessions_own"
  on public.executive_grill_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "executive_grill_entries_own"
  on public.executive_grill_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "executive_grill_flags_own"
  on public.executive_grill_flags
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "executive_transcription_consents_own"
  on public.executive_transcription_consents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "executive_transcription_connections_own"
  on public.executive_transcription_connections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "executive_meeting_transcripts_own"
  on public.executive_meeting_transcripts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
