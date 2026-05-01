-- Prevent duplicate active company names per user.
-- Partial index: allows the same name to be re-added after archiving.
create unique index companies_active_name_unique
  on public.companies(user_id, name)
  where archived_at is null;
