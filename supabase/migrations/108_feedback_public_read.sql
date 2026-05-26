-- Allow unauthenticated users to browse feedback items (public Ideas board)

-- Grant SELECT to anon role
grant select on public.feedback_items to anon;

-- RLS policy: anyone (including anonymous) can view feedback items
create policy "feedback_items_select_public"
on public.feedback_items
for select
to anon
using (true);
