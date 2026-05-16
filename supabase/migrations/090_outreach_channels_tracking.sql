alter table public.contacts
  add column if not exists email text,
  add column if not exists outreach_status text not null default 'prospect',
  add column if not exists contact_type text,
  add column if not exists last_role_discussed text;

alter table public.follow_ups
  add column if not exists google_event_url text;

alter table public.outreach_logs
  add column if not exists recipient_email text,
  add column if not exists recipient_name text,
  add column if not exists sender_email text,
  add column if not exists subject text,
  add column if not exists message_body text,
  add column if not exists send_mode text,
  add column if not exists outreach_channel text check (outreach_channel in ('executives', 'search_firms', 'coaches')),
  add column if not exists fit_tier text check (fit_tier in ('strong', 'medium')),
  add column if not exists persona_focus text,
  add column if not exists resend_message_id text,
  add column if not exists delivery_status text,
  add column if not exists webhook_event_type text,
  add column if not exists webhook_payload jsonb;

create index if not exists outreach_logs_recipient_email_idx on public.outreach_logs(user_id, recipient_email, sent_at desc);
create index if not exists outreach_logs_outreach_channel_idx on public.outreach_logs(user_id, outreach_channel, sent_at desc);
create index if not exists outreach_logs_resend_message_id_idx on public.outreach_logs(resend_message_id);
create index if not exists follow_ups_google_event_idx on public.follow_ups(user_id, due_date) where google_event_url is not null;
