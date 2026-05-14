-- Repair migration to ensure feedback dependent tables exist in remote environments

create extension if not exists "uuid-ossp";

create table if not exists public.feedback_votes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.feedback_items(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique(user_id, item_id)
);

create table if not exists public.feedback_comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.feedback_items(id) on delete cascade,
  body text not null,
  is_staff_note boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint feedback_comments_body_length check (char_length(body) >= 1 and char_length(body) <= 2000)
);

create table if not exists public.feedback_status_history (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.feedback_items(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid not null references auth.users(id) on delete restrict,
  change_note text,
  created_at timestamp with time zone not null default now(),
  constraint feedback_status_history_statuses check (
    new_status in ('new', 'under_review', 'planned', 'in_progress', 'shipped', 'declined')
  )
);

create index if not exists idx_feedback_votes_user_id on public.feedback_votes(user_id);
create index if not exists idx_feedback_votes_item_id on public.feedback_votes(item_id);
create index if not exists idx_feedback_votes_item_user on public.feedback_votes(item_id, user_id);

create index if not exists idx_feedback_comments_user_id on public.feedback_comments(user_id);
create index if not exists idx_feedback_comments_item_id on public.feedback_comments(item_id);
create index if not exists idx_feedback_comments_created_at on public.feedback_comments(created_at desc);

create index if not exists idx_feedback_status_history_item_id on public.feedback_status_history(item_id);
create index if not exists idx_feedback_status_history_changed_by on public.feedback_status_history(changed_by);
create index if not exists idx_feedback_status_history_created_at on public.feedback_status_history(created_at desc);

create or replace function update_feedback_vote_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.feedback_items
      set vote_count = (select count(*) from public.feedback_votes where item_id = new.item_id)
      where id = new.item_id;
  elsif tg_op = 'DELETE' then
    update public.feedback_items
      set vote_count = (select count(*) from public.feedback_votes where item_id = old.item_id)
      where id = old.item_id;
  end if;
  return null;
end;
$$ language plpgsql;

create or replace function update_feedback_comment_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.feedback_items
      set comment_count = (select count(*) from public.feedback_comments where item_id = new.item_id)
      where id = new.item_id;
  elsif tg_op = 'DELETE' then
    update public.feedback_items
      set comment_count = (select count(*) from public.feedback_comments where item_id = old.item_id)
      where id = old.item_id;
  end if;
  return null;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'feedback_votes_count_trigger'
  ) then
    create trigger feedback_votes_count_trigger
    after insert or delete on public.feedback_votes
    for each row
    execute function update_feedback_vote_count();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'feedback_comments_count_trigger'
  ) then
    create trigger feedback_comments_count_trigger
    after insert or delete on public.feedback_comments
    for each row
    execute function update_feedback_comment_count();
  end if;
end $$;

alter table public.feedback_votes enable row level security;
alter table public.feedback_comments enable row level security;
alter table public.feedback_status_history enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_votes' and policyname = 'feedback_votes_select_all'
  ) then
    create policy "feedback_votes_select_all"
    on public.feedback_votes
    for select
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_votes' and policyname = 'feedback_votes_insert_own'
  ) then
    create policy "feedback_votes_insert_own"
    on public.feedback_votes
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_votes' and policyname = 'feedback_votes_delete_own'
  ) then
    create policy "feedback_votes_delete_own"
    on public.feedback_votes
    for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_comments' and policyname = 'feedback_comments_select_all'
  ) then
    create policy "feedback_comments_select_all"
    on public.feedback_comments
    for select
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_comments' and policyname = 'feedback_comments_insert_own'
  ) then
    create policy "feedback_comments_insert_own"
    on public.feedback_comments
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_comments' and policyname = 'feedback_comments_update_own'
  ) then
    create policy "feedback_comments_update_own"
    on public.feedback_comments
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_comments' and policyname = 'feedback_comments_delete_own'
  ) then
    create policy "feedback_comments_delete_own"
    on public.feedback_comments
    for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_status_history' and policyname = 'feedback_status_history_select_all'
  ) then
    create policy "feedback_status_history_select_all"
    on public.feedback_status_history
    for select
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feedback_status_history' and policyname = 'feedback_status_history_insert_authenticated'
  ) then
    create policy "feedback_status_history_insert_authenticated"
    on public.feedback_status_history
    for insert
    to authenticated
    with check (auth.uid() = changed_by);
  end if;
end $$;

grant select on public.feedback_votes to authenticated;
grant insert on public.feedback_votes to authenticated;
grant delete on public.feedback_votes to authenticated;

grant select on public.feedback_comments to authenticated;
grant insert on public.feedback_comments to authenticated;
grant update on public.feedback_comments to authenticated;
grant delete on public.feedback_comments to authenticated;

grant select on public.feedback_status_history to authenticated;
grant insert on public.feedback_status_history to authenticated;
