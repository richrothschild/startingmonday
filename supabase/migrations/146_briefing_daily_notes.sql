-- Add a lightweight daily-note destination for briefing support actions.

create table if not exists public.briefing_daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_date date not null,
  source text not null default 'briefing' check (source in ('briefing', 'manual')),
  title text,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint briefing_daily_notes_date_unique unique (user_id, note_date)
);

create index if not exists briefing_daily_notes_user_date_idx
  on public.briefing_daily_notes(user_id, note_date desc);

drop trigger if exists set_updated_at_briefing_daily_notes on public.briefing_daily_notes;
create trigger set_updated_at_briefing_daily_notes
  before update on public.briefing_daily_notes
  for each row execute procedure public.set_updated_at();

alter table public.briefing_daily_notes enable row level security;

create policy briefing_daily_notes_select_own on public.briefing_daily_notes
  for select
  using (auth.uid() = user_id);

create policy briefing_daily_notes_insert_own on public.briefing_daily_notes
  for insert
  with check (auth.uid() = user_id);

create policy briefing_daily_notes_update_own on public.briefing_daily_notes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy briefing_daily_notes_delete_own on public.briefing_daily_notes
  for delete
  using (auth.uid() = user_id);
