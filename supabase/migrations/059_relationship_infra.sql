-- OS Sprint 2: Relationship Infrastructure
-- contact_type: relationship role (distinct from channel which is how-we-met)
-- last_role_discussed: for recruiter contacts, what role was last discussed
alter table public.contacts
  add column if not exists contact_type text,
  add column if not exists last_role_discussed text;

create index if not exists idx_contacts_contact_type on public.contacts(user_id, contact_type);
