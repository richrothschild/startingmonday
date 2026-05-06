-- Optional alternate delivery address for briefings and activation emails.
-- When set, overrides the auth email for all outbound system emails.
-- Allows executives to receive briefings on a personal address without
-- changing their login credentials.
alter table user_profiles
  add column if not exists briefing_email text;
