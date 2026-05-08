-- Company intelligence product: public company registry + access tokens

create table public.intelligence_companies (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null unique,
  company_name text        not null,
  description  text,
  sector       text,
  website      text,
  is_featured  boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_intelligence_companies_slug     on public.intelligence_companies (slug);
create index idx_intelligence_companies_featured on public.intelligence_companies (is_featured) where is_featured = true;

-- Signed tokens that grant full (ungated) access to a company's public intelligence page
create table public.intelligence_access_tokens (
  id           uuid        primary key default gen_random_uuid(),
  company_slug text        not null references public.intelligence_companies(slug) on delete cascade,
  created_by   uuid        not null references auth.users(id) on delete cascade,
  label        text,
  expires_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index idx_intel_tokens_slug on public.intelligence_access_tokens (company_slug);
