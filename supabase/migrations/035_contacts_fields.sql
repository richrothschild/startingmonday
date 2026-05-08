-- Add direct contact fields: email and LinkedIn URL
alter table public.contacts
  add column if not exists email        text,
  add column if not exists linkedin_url text;
