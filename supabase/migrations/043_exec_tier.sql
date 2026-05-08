-- Executive tier: priority flag on contacts for recruiter tracker enhancements
alter table public.contacts
  add column if not exists is_priority boolean not null default false;

create index if not exists idx_contacts_priority
  on public.contacts(user_id) where is_priority = true;
