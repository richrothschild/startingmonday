-- Reference company catalog for autocomplete on "Add Company"
-- Seeded from Crunchbase export; users add from this list into their pipeline.

create extension if not exists pg_trgm;

create table if not exists reference_companies (
  id            serial primary key,
  slug          text not null unique,
  name          text not null,
  description   text,
  hq_location   text,
  industries    text[],
  cb_rank       int,
  crunchbase_url text,
  created_at    timestamptz not null default now()
);

-- Fast prefix/fuzzy search on company name
create index if not exists idx_ref_companies_name_trgm
  on reference_companies using gin (name gin_trgm_ops);

-- Ordering by prominence
create index if not exists idx_ref_companies_cb_rank
  on reference_companies (cb_rank);
