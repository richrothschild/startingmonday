-- Add SELECT policy to feedback_items so authenticated users can read items.
-- Without this, PostgREST's INSERT...RETURNING * fails with 403 even though
-- the INSERT policy exists.
create policy "feedback_items_select_authenticated"
  on public.feedback_items
  for select
  to authenticated
  using (true);
