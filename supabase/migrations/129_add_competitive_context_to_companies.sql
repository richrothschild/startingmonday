-- Ensure production schemas include the competitive field expected by dashboard + prep flows.
alter table if exists public.companies
  add column if not exists competitive_context text;
