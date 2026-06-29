-- Canonical ledgers to close wedge economics/commercial reporting gaps.

create table if not exists public.marketing_spend_entries (
  id uuid primary key default gen_random_uuid(),
  motion text not null,
  channel text,
  amount_usd numeric(12,2) not null check (amount_usd >= 0),
  effective_at timestamptz not null default now(),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint marketing_spend_entries_motion_check check (motion in (
    'direct_paid_sprint',
    'partner_pilot',
    'other'
  ))
);

create index if not exists idx_marketing_spend_entries_motion_effective
  on public.marketing_spend_entries (motion, effective_at desc);

create table if not exists public.partner_commercial_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  event_type text not null,
  amount_usd numeric(12,2),
  effective_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint partner_commercial_events_type_check check (event_type in (
    'pilot_fee_collected',
    'expansion_proposal_sent',
    'expansion_accepted',
    'expansion_rejected'
  ))
);

create index if not exists idx_partner_commercial_events_partner_type_effective
  on public.partner_commercial_events (partner_id, event_type, effective_at desc);

alter table public.marketing_spend_entries enable row level security;
alter table public.partner_commercial_events enable row level security;

drop policy if exists marketing_spend_entries_admin_only on public.marketing_spend_entries;
create policy marketing_spend_entries_admin_only on public.marketing_spend_entries
  for all using (false);

drop policy if exists partner_commercial_events_admin_only on public.partner_commercial_events;
create policy partner_commercial_events_admin_only on public.partner_commercial_events
  for all using (false);
