-- Guide chat analytics and feedback persistence

create table if not exists public.guide_chat_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  intent text not null default 'general',
  query_status text not null default 'answered' check (query_status in ('answered', 'no_match', 'low_confidence', 'error')),
  confidence double precision,
  top_score double precision,
  top_source_url text,
  source_count integer not null default 0,
  source_payload jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists guide_chat_queries_user_created_idx
  on public.guide_chat_queries(user_id, created_at desc);

create index if not exists guide_chat_queries_created_idx
  on public.guide_chat_queries(created_at desc);

create table if not exists public.guide_chat_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guide_chat_query_id uuid not null references public.guide_chat_queries(id) on delete cascade,
  rating text not null check (rating in ('helpful', 'not_helpful')),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, guide_chat_query_id)
);

create index if not exists guide_chat_feedback_query_idx
  on public.guide_chat_feedback(guide_chat_query_id);

create index if not exists guide_chat_feedback_created_idx
  on public.guide_chat_feedback(created_at desc);

alter table public.guide_chat_queries enable row level security;
alter table public.guide_chat_feedback enable row level security;

grant select, insert on public.guide_chat_queries to authenticated;
grant select, insert on public.guide_chat_feedback to authenticated;

drop policy if exists "Users insert own guide chat queries" on public.guide_chat_queries;
create policy "Users insert own guide chat queries"
  on public.guide_chat_queries
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users read own guide chat queries" on public.guide_chat_queries;
create policy "Users read own guide chat queries"
  on public.guide_chat_queries
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users insert own guide chat feedback" on public.guide_chat_feedback;
create policy "Users insert own guide chat feedback"
  on public.guide_chat_feedback
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users read own guide chat feedback" on public.guide_chat_feedback;
create policy "Users read own guide chat feedback"
  on public.guide_chat_feedback
  for select
  to authenticated
  using (user_id = auth.uid());
