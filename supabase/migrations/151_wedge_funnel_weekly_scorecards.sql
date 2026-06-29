-- Wedge funnel weekly scorecards for shortlist + partner pilot trend persistence.

create table if not exists public.wedge_funnel_weekly_scorecards (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  generated_at timestamptz not null default now(),
  lookback_days integer not null default 30,

  shortlist_viewed_users integer not null default 0,
  shortlist_cta_click_users integer not null default 0,
  shortlist_checkout_started_users integer not null default 0,
  shortlist_purchased_users integer not null default 0,
  shortlist_delivered_users integer not null default 0,
  shortlist_credit_applied_users integer not null default 0,

  shortlist_cta_click_through_rate numeric(5,2) not null default 0,
  shortlist_checkout_start_rate numeric(5,2) not null default 0,
  shortlist_purchase_rate_from_checkout numeric(5,2) not null default 0,
  shortlist_delivery_completion_rate numeric(5,2) not null default 0,
  shortlist_credit_application_rate numeric(5,2) not null default 0,

  pilot_partner_accounts_active integer not null default 0,
  pilot_seat_updates_logged integer not null default 0,
  pilot_seats_total integer not null default 0,
  pilot_at_risk_seats integer not null default 0,
  pilot_seats_active_rate numeric(5,2) not null default 0,

  decision_motion1_direct_paid_sprint text not null default 'iterate',
  decision_motion2_partner_pilot text not null default 'iterate',
  decision_summary text not null default 'iterate',
  decision_reasons jsonb not null default '[]'::jsonb,

  unique (week_start)
);

create index if not exists idx_wedge_funnel_weekly_scorecards_week
  on public.wedge_funnel_weekly_scorecards (week_start desc);

alter table public.wedge_funnel_weekly_scorecards enable row level security;

create policy "Staff read wedge funnel weekly scorecards"
  on public.wedge_funnel_weekly_scorecards
  for select
  using (true);
