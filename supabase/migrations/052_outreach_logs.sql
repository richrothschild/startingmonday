-- Tracks outreach messages sent by a user to a contact.
-- Separate from follow_ups (which are scheduled reminders).
-- This is an immutable log: one row per message sent.

create table public.outreach_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  contact_id  uuid references public.contacts(id) on delete set null,
  company_id  uuid references public.companies(id) on delete set null,
  signal_id   uuid references public.company_signals(id) on delete set null,
  channel     text not null check (channel in ('linkedin', 'email', 'phone', 'other')),
  message_preview text,  -- first ~200 chars; not required
  sent_at     timestamptz not null default now()
);

alter table public.outreach_logs enable row level security;

create policy "Users manage their own outreach logs"
  on public.outreach_logs
  for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create index outreach_logs_user_sent_idx  on public.outreach_logs(user_id, sent_at desc);
create index outreach_logs_contact_idx    on public.outreach_logs(contact_id);
