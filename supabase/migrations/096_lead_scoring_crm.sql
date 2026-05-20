-- Ticket 5: lead scoring + routing fields for CRM workflows
alter table public.contacts
  add column if not exists lead_score integer not null default 0,
  add column if not exists lead_tier text not null default 'nurture',
  add column if not exists lead_queue text not null default 'nurture',
  add column if not exists lead_score_reasons jsonb not null default '[]'::jsonb,
  add column if not exists lead_scored_at timestamptz,
  add column if not exists lead_routed_at timestamptz;

alter table public.contacts
  drop constraint if exists contacts_lead_score_range,
  add constraint contacts_lead_score_range check (lead_score >= 0 and lead_score <= 100);

alter table public.contacts
  drop constraint if exists contacts_lead_tier_check,
  add constraint contacts_lead_tier_check check (lead_tier in ('hot', 'warm', 'nurture'));

alter table public.contacts
  drop constraint if exists contacts_lead_queue_check,
  add constraint contacts_lead_queue_check check (lead_queue in ('hot', 'warm', 'nurture'));

create index if not exists idx_contacts_lead_score
  on public.contacts (lead_score desc);

create index if not exists idx_contacts_lead_queue
  on public.contacts (lead_queue);

create index if not exists idx_contacts_channel_lead_score
  on public.contacts (channel, lead_score desc);
