-- Broad feedback insert policy for authenticated users.
--
-- The existing per-user insert policy is still denying production inserts
-- with 42501 in the live environment. This migration replaces the insert
-- policy with an authenticated-role check so feedback submission can work
-- while still requiring the request to be from a signed-in user.

alter table public.feedback_items enable row level security;

grant select on public.feedback_items to authenticated;
grant insert on public.feedback_items to authenticated;
grant update on public.feedback_items to authenticated;

drop policy if exists "feedback_items_insert_own" on public.feedback_items;
drop policy if exists "feedback_items_insert_authenticated" on public.feedback_items;
drop policy if exists "feedback_items_insert_authenticated_role" on public.feedback_items;

create policy "feedback_items_insert_authenticated_role"
on public.feedback_items
for insert
to authenticated
with check (
  auth.role() = 'authenticated'
  and type = 'feedback'
);
