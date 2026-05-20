-- Restore insert capability for authenticated users on feedback_items.
-- Root cause observed in production synthetic checks:
--   ERROR 42501: new row violates row-level security policy for table "feedback_items"
--
-- This migration is idempotent and safe to re-run.

alter table public.feedback_items enable row level security;

grant select on public.feedback_items to authenticated;
grant insert on public.feedback_items to authenticated;
grant update on public.feedback_items to authenticated;

-- Keep legacy policy name if present.
drop policy if exists "feedback_items_insert_own" on public.feedback_items;

-- Ensure there is a permissive insert policy for authenticated users.
drop policy if exists "feedback_items_insert_authenticated" on public.feedback_items;
create policy "feedback_items_insert_authenticated"
on public.feedback_items
for insert
to authenticated
with check (
  auth.uid() = user_id
  and type = 'feedback'
);
