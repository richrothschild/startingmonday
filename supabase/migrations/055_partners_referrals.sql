-- Partner referral system: coaches and outplacement firms who refer users.

create table public.partners (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  email          text        not null unique,
  company        text,
  referral_code  text        not null unique,
  commission_pct integer     not null default 20,
  is_active      boolean     not null default true,
  notes          text,
  created_at     timestamptz not null default now()
);

create index idx_partners_code on public.partners(referral_code);

-- One attribution per signed-up user (unique on signup_user_id).
create table public.referral_attributions (
  id             uuid        primary key default gen_random_uuid(),
  signup_user_id uuid        not null unique references auth.users(id) on delete cascade,
  partner_id     uuid        not null references public.partners(id) on delete cascade,
  attributed_at  timestamptz not null default now()
);

create index idx_referral_attributions_partner on public.referral_attributions(partner_id);
