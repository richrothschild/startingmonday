-- E3.1: Executive History Database
-- Core moat-building schema. These tables accumulate over years and cannot be
-- retroactively reconstructed — every row added today is a training sample that
-- makes the departure-prediction model more accurate tomorrow.
--
-- All tables are platform-internal (service-role access only).
-- RLS enabled with no user-scoped policies — anon/authed keys cannot read.

-- ── executive_profiles ────────────────────────────────────────────────────────
-- One record per executive, identity-resolved across sources.

create table public.executive_profiles (
  id            uuid        primary key default gen_random_uuid(),
  full_name     text        not null,
  first_name    text,
  last_name     text,
  linkedin_url  text        unique,
  pdl_id        text        unique,
  wikidata_id   text        unique,
  education     jsonb,      -- [{school, degree, field, grad_year}]
  board_seats   jsonb,      -- [{company, role, start_date, end_date}]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_exec_profiles_name      on public.executive_profiles (last_name, first_name);
create index idx_exec_profiles_pdl       on public.executive_profiles (pdl_id) where pdl_id is not null;
create index idx_exec_profiles_wikidata  on public.executive_profiles (wikidata_id) where wikidata_id is not null;

alter table public.executive_profiles enable row level security;

-- ── executive_positions ───────────────────────────────────────────────────────
-- One record per role held at each company.
-- The departure-prediction training set lives here at the row level.

create table public.executive_positions (
  id                      uuid        primary key default gen_random_uuid(),
  executive_id            uuid        references public.executive_profiles(id) on delete set null,

  -- Company identity
  company_name            text        not null,
  company_cik             text,
  company_domain          text,
  company_ein             text,

  -- Company attributes AT TIME OF TENURE (point-in-time — do not update retroactively)
  company_sector          text,
  company_sic_code        text,
  company_subsector       text,
  company_hq_city         text,
  company_hq_state        text,
  company_hq_country      text        not null default 'US',
  company_hq_metro        text,

  company_stage           text        check (company_stage in (
                            'public_f500', 'public_mid', 'public_small',
                            'pe_backed', 'vc_backed', 'private',
                            'nonprofit', 'gov_contractor'
                          )),
  company_revenue_band    text        check (company_revenue_band in (
                            '<50M', '50-250M', '250M-1B', '1-10B', '>10B'
                          )),
  company_headcount_band  text        check (company_headcount_band in (
                            '<100', '100-500', '500-2k', '2k-10k', '>10k'
                          )),
  company_market_cap_band text        check (company_market_cap_band in (
                            '<500M', '500M-2B', '2-10B', '10-50B', '>50B'
                          )),
  company_growth_phase    text        check (company_growth_phase in (
                            'startup', 'growth', 'scale', 'mature', 'declining', 'turnaround'
                          )),

  pe_firm                 text,
  pe_deal_close_date      date,
  pe_deal_type            text        check (pe_deal_type in ('buyout', 'carve_out', 'growth', 'recap')),
  vc_series               text        check (vc_series in ('seed', 'a', 'b', 'c', 'd', 'growth')),

  had_activist_investor   boolean     not null default false,
  activist_firm           text,
  recent_m_and_a          boolean     not null default false,
  recent_ipo              boolean     not null default false,
  post_bankruptcy         boolean     not null default false,

  -- Role
  title                   text        not null,
  title_normalized        text        check (title_normalized in (
                            'CIO', 'CTO', 'CISO', 'CDO_DATA', 'CDO_DIGITAL',
                            'COO', 'CPO', 'VP_TECH', 'OTHER_C'
                          )),
  seniority_level         text        check (seniority_level in ('c_suite', 'svp', 'vp', 'director')),
  is_board_role           boolean     not null default false,
  reporting_to            text        check (reporting_to in ('CEO', 'COO', 'CFO', 'CTO', 'Board', 'Other')),
  direct_reports_band     text        check (direct_reports_band in ('<5', '5-25', '25-100', '>100')),

  -- Tenure
  start_date              date,
  end_date                date,
  tenure_days             integer     generated always as (
                            case when start_date is not null and end_date is not null
                            then (end_date - start_date) else null end
                          ) stored,
  is_current              boolean     not null default false,

  -- Departure context
  departure_type          text        check (departure_type in (
                            'voluntary', 'forced', 'retirement', 'acquisition',
                            'internal_promotion', 'unknown'
                          )),
  departure_trigger       text        check (departure_trigger in (
                            'ceo_change', 'activist', 'post_acquisition', 'financial_distress',
                            'strategy_shift', 'board_pressure', 'personal', 'unknown'
                          )),
  departure_signal        text        check (departure_signal in (
                            'edgar_8k_502', 'press_release', 'pdl_diff',
                            'predictleads', 'wayback', 'inference'
                          )),
  sec_accession_number    text,

  -- Succession
  successor_id            uuid        references public.executive_positions(id) on delete set null,
  successor_type          text        check (successor_type in ('internal', 'external', 'interim', 'unknown')),
  days_to_successor       integer,
  predecessor_id          uuid        references public.executive_positions(id) on delete set null,

  -- Market context at time of departure
  sp500_ytd_return        numeric(5,2),
  sector_ytd_return       numeric(5,2),
  interest_rate_env       text        check (interest_rate_env in ('low', 'rising', 'high', 'falling')),
  vix_quartile            integer     check (vix_quartile between 1 and 4),

  -- Source and quality
  data_sources            text[],
  confidence_score        numeric(3,2) check (confidence_score between 0 and 1),
  source_urls             text[],

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_exec_positions_executive    on public.executive_positions (executive_id) where executive_id is not null;
create index idx_exec_positions_cik_role     on public.executive_positions (company_cik, title_normalized) where company_cik is not null;
create index idx_exec_positions_sic_stage    on public.executive_positions (company_sic_code, company_stage) where company_sic_code is not null;
create index idx_exec_positions_departure    on public.executive_positions (departure_type, departure_trigger) where departure_type is not null;
create index idx_exec_positions_company_name on public.executive_positions (company_name);
create index idx_exec_positions_current      on public.executive_positions (company_name, title_normalized) where is_current = true;
create index idx_exec_positions_accession    on public.executive_positions (sec_accession_number) where sec_accession_number is not null;

alter table public.executive_positions enable row level security;

-- ── exec_search_lag ───────────────────────────────────────────────────────────
-- Departure matched to subsequent appointment; search lag in days.
-- The training set for "how long does a search typically take."

create table public.exec_search_lag (
  id                    uuid        primary key default gen_random_uuid(),
  departure_id          uuid        references public.executive_positions(id) on delete cascade,
  appointment_id        uuid        references public.executive_positions(id) on delete cascade,
  company_name          text,
  company_cik           text,
  company_sector        text,
  company_sic_code      text,
  company_stage         text,
  company_revenue_band  text,
  title_normalized      text,
  lag_days              integer,
  replacement_type      text        check (replacement_type in ('internal', 'external', 'interim', 'unknown')),
  search_year           integer,
  market_conditions     text        check (market_conditions in ('bull', 'bear', 'volatile', 'neutral')),
  created_at            timestamptz not null default now()
);

create index idx_search_lag_cik_role   on public.exec_search_lag (company_cik, title_normalized) where company_cik is not null;
create index idx_search_lag_sic_stage  on public.exec_search_lag (company_sic_code, company_stage) where company_sic_code is not null;
create index idx_search_lag_year       on public.exec_search_lag (search_year, title_normalized);

alter table public.exec_search_lag enable row level security;

-- ── company_tenure_stats ──────────────────────────────────────────────────────
-- Computed: company-level tenure and search lag statistics.
-- Refreshed weekly by a scheduled job once E6 is implemented.

create table public.company_tenure_stats (
  id                      uuid        primary key default gen_random_uuid(),
  company_name            text        not null,
  company_cik             text,
  title_normalized        text        not null,
  avg_tenure_days         integer,
  median_tenure_days      integer,
  p25_tenure_days         integer,
  p75_tenure_days         integer,
  avg_search_lag_days     integer,
  median_search_lag_days  integer,
  external_hire_rate      numeric(4,3),
  sample_size             integer     not null default 0,
  time_period_start       date,
  time_period_end         date,
  updated_at              timestamptz not null default now(),
  unique (company_name, title_normalized)
);

create index idx_company_tenure_cik  on public.company_tenure_stats (company_cik) where company_cik is not null;

alter table public.company_tenure_stats enable row level security;

-- ── industry_tenure_stats ─────────────────────────────────────────────────────
-- Computed: industry × company_stage × role-level tenure and search lag stats.
-- The context layer surfaced in pattern alerts ("median CIO search lag in PE-backed
-- healthcare companies is 9 weeks").

create table public.industry_tenure_stats (
  id                      uuid        primary key default gen_random_uuid(),
  sic_code                text        not null,
  sector_name             text,
  company_stage           text,
  title_normalized        text        not null,
  avg_tenure_days         integer,
  median_tenure_days      integer,
  avg_search_lag_days     integer,
  median_search_lag_days  integer,
  external_hire_rate      numeric(4,3),
  sample_size             integer     not null default 0,
  time_period_start       date,
  time_period_end         date,
  updated_at              timestamptz not null default now(),
  unique (sic_code, company_stage, title_normalized)
);

alter table public.industry_tenure_stats enable row level security;

-- ── departure_signal_context ──────────────────────────────────────────────────
-- Pre-departure signal context: what was happening in the 0-180 days before
-- each confirmed departure. This is the feature set for the fingerprinting model.

create table public.departure_signal_context (
  id                    uuid        primary key default gen_random_uuid(),
  departure_id          uuid        not null references public.executive_positions(id) on delete cascade,
  signal_type           text        not null check (signal_type in (
                          'news', 'gdelt_event', 'funding', 'ma', 'activist_entry',
                          'ceo_change', 'earnings_miss', 'regulatory_action',
                          'layoffs', 'board_change', 'insider_sale', 'filing_trend'
                        )),
  signal_date           date        not null,
  days_before_departure integer,    -- computed on insert: departure end_date - signal_date
  signal_source         text,
  signal_summary        text,
  source_url            text,
  created_at            timestamptz not null default now()
);

create index idx_departure_context_departure  on public.departure_signal_context (departure_id);
create index idx_departure_context_type_days  on public.departure_signal_context (signal_type, days_before_departure);

alter table public.departure_signal_context enable row level security;
