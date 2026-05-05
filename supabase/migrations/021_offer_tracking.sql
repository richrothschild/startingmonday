-- Tracks when the offer-acceptance email was sent (prevents re-send)
alter table users add column if not exists offer_email_sent_at timestamptz;

-- Opt-out for annual reactivation emails; keyed by invite_code in the unsubscribe link
alter table users add column if not exists marketing_unsubscribed_at timestamptz;

-- Testimonials submitted via the offer-completion email feedback link
create table if not exists testimonials (
  id          uuid        primary key default gen_random_uuid(),
  invite_code text,
  body        text        not null,
  created_at  timestamptz not null default now()
);
