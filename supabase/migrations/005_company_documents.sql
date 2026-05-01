-- Company-level documents: job descriptions, news, annual reports, org notes.
-- Attached to company (not a prep session) so they persist across all prep generations.

create table public.company_documents (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  label      text not null,   -- 'job_description' | 'news' | 'annual_report' | 'org_notes' | 'other'
  content    text not null,
  created_at timestamptz not null default now()
);

create index company_documents_company on public.company_documents (company_id, user_id);

alter table public.company_documents enable row level security;

create policy "documents_select_own" on public.company_documents
  for select using (auth.uid() = user_id);

create policy "documents_insert_own" on public.company_documents
  for insert with check (auth.uid() = user_id);

create policy "documents_delete_own" on public.company_documents
  for delete using (auth.uid() = user_id);
