create table if not exists public.llm_traces (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  feature text not null,
  model text not null,
  prompt_tokens int,
  completion_tokens int,
  latency_ms int,
  input_snapshot jsonb,
  output_snapshot text,
  eval_pass bool,
  eval_notes text
);

create index if not exists idx_llm_traces_user on public.llm_traces(user_id);
create index if not exists idx_llm_traces_feature on public.llm_traces(feature, created_at desc);
create index if not exists idx_llm_traces_created on public.llm_traces(created_at desc);

alter table public.llm_traces enable row level security;

-- Users can insert their own traces (server routes run with the user's JWT)
create policy "user_insert_own_trace" on public.llm_traces
  for insert with check (auth.uid() = user_id);
