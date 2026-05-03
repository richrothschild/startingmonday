-- Brief logging and user rating
create table public.briefs (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users on delete cascade,
  type       text        not null check (type in ('strategy', 'prep', 'outreach')),
  company_id uuid        references public.companies on delete set null,
  contact_id uuid        references public.contacts on delete set null,
  output_text text       not null,
  user_rating smallint   check (user_rating in (-1, 1)),
  created_at  timestamptz not null default now()
);

alter table public.briefs enable row level security;

create policy "Users manage own briefs"
  on public.briefs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_briefs_user_type_created
  on public.briefs (user_id, type, created_at desc);
