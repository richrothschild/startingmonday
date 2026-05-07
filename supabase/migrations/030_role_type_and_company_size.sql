-- PQ1: Role type on user profile and company size on companies.
-- role_type drives role-specific AI framing in prep briefs.
-- company_size drives CTO startup vs enterprise context.

alter table user_profiles
  add column if not exists role_type text;

alter table companies
  add column if not exists company_size text;
