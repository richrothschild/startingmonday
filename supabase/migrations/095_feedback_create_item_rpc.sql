-- Create a SECURITY DEFINER RPC for feedback submission.
--
-- Rationale:
-- The live authenticated insert path for feedback_items is still failing with
-- RLS error 42501 even after policy remediation. This RPC keeps the user-facing
-- route authenticated while letting the database owner perform the insert.

create or replace function public.create_feedback_item(
  p_title text,
  p_body text,
  p_category text,
  p_screenshot_url text default null
)
returns public.feedback_items
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_row public.feedback_items;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  insert into public.feedback_items (
    type,
    title,
    body,
    category,
    screenshot_url,
    user_id,
    status
  ) values (
    'feedback',
    p_title,
    p_body,
    p_category,
    nullif(p_screenshot_url, ''),
    auth.uid(),
    'new'
  )
  returning * into inserted_row;

  return inserted_row;
end;
$$;

grant execute on function public.create_feedback_item(text, text, text, text) to authenticated;
