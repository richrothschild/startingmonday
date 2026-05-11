-- Track when a user adds their first watched company.
-- Used in the trial tracking admin view to identify engaged vs. passive trials.
alter table users add column if not exists first_company_added_at timestamptz;

-- Backfill from earliest company per user.
update users u
set first_company_added_at = (
  select min(c.created_at)
  from companies c
  where c.user_id = u.id
)
where u.first_company_added_at is null
  and exists (select 1 from companies c where c.user_id = u.id);
