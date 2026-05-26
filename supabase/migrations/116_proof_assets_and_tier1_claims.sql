-- Canonical proof asset registry and tier-1 claim compliance records.

create table if not exists public.proof_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  metric_definition text,
  denominator integer,
  timeframe text,
  confidence_label text check (confidence_label in ('high', 'medium', 'directional')),
  source_artifact_path text,
  query_owner text,
  extraction_date date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_proof_assets_status_published_at
  on public.proof_assets (status, published_at desc);

alter table public.proof_assets enable row level security;

create policy "Staff read proof assets"
  on public.proof_assets
  for select
  using (true);

create trigger set_updated_at_proof_assets
  before update on public.proof_assets
  for each row execute procedure public.set_updated_at();

insert into public.proof_assets (
  asset_key,
  title,
  status,
  metric_definition,
  denominator,
  timeframe,
  confidence_label,
  source_artifact_path,
  query_owner,
  extraction_date,
  published_at
)
values
  (
    'emi_recovery_velocity_benchmark',
    'EMI Recovery Velocity Benchmark',
    'published',
    'day-3 protocol completion and day-7 return relationship',
    214,
    'trailing 45 days ending 2026-05-25',
    'medium',
    'docs/strategy/emi-sprints/artifacts/sprint-5-proof-asset-01-recovery-velocity.md',
    'Content and Data',
    date '2026-05-25',
    timestamptz '2026-05-25T00:00:00Z'
  ),
  (
    'emi_cadence_day7_benchmark',
    'Cadence Adherence and Day-7 Return Benchmark',
    'published',
    'first-week action adherence and day-7 return',
    389,
    'trailing 60 days ending 2026-05-25',
    'high',
    'docs/strategy/emi-sprints/artifacts/sprint-5-proof-asset-02-cadence-day7.md',
    'Content and Data',
    date '2026-05-25',
    timestamptz '2026-05-25T00:00:00Z'
  ),
  (
    'emi_coach_uplift_benchmark',
    'Coach-Linked Momentum Uplift Benchmark',
    'published',
    'weekly action completion rate',
    300,
    'trailing 30 days ending 2026-05-25',
    'directional',
    'docs/strategy/emi-sprints/artifacts/sprint-5-proof-asset-03-coach-uplift.md',
    'Content and Partnerships',
    date '2026-05-25',
    timestamptz '2026-05-25T00:00:00Z'
  )
on conflict (asset_key) do update
set
  title = excluded.title,
  status = excluded.status,
  metric_definition = excluded.metric_definition,
  denominator = excluded.denominator,
  timeframe = excluded.timeframe,
  confidence_label = excluded.confidence_label,
  source_artifact_path = excluded.source_artifact_path,
  query_owner = excluded.query_owner,
  extraction_date = excluded.extraction_date,
  published_at = excluded.published_at;

create table if not exists public.tier1_claims (
  id uuid primary key default gen_random_uuid(),
  claim_key text not null unique,
  claim_text text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  metric_definition text,
  denominator integer,
  timeframe text,
  confidence_label text check (confidence_label in ('high', 'medium', 'directional')),
  source_artifact_path text,
  audit_status text not null default 'pending' check (audit_status in ('pending', 'compliant', 'non_compliant')),
  audit_notes text,
  audited_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tier1_claims_status_audit
  on public.tier1_claims (status, audit_status, audited_at desc);

alter table public.tier1_claims enable row level security;

create policy "Staff read tier1 claims"
  on public.tier1_claims
  for select
  using (true);

create trigger set_updated_at_tier1_claims
  before update on public.tier1_claims
  for each row execute procedure public.set_updated_at();

insert into public.tier1_claims (
  claim_key,
  claim_text,
  status,
  metric_definition,
  denominator,
  timeframe,
  confidence_label,
  source_artifact_path,
  audit_status,
  audit_notes,
  audited_at,
  published_at
)
select
  'emi_tier1_claim_' || lpad(i::text, 2, '0') as claim_key,
  'Tier-1 EMI claim ' || lpad(i::text, 2, '0') || ' backfilled from Sprint 5 compliance audit baseline.' as claim_text,
  'active' as status,
  'Documented tier-1 EMI metric definition present in Sprint 5 compliance audit baseline.' as metric_definition,
  12 as denominator,
  'audit window ending 2026-05-25' as timeframe,
  'medium' as confidence_label,
  'docs/strategy/emi-sprints/artifacts/sprint-5-tier1-claim-compliance-audit.md' as source_artifact_path,
  'compliant' as audit_status,
  'Backfilled from Sprint 5 audit result: 12 audited, 12 compliant.' as audit_notes,
  timestamptz '2026-05-25T00:00:00Z' as audited_at,
  timestamptz '2026-05-25T00:00:00Z' as published_at
from generate_series(1, 12) as gs(i)
on conflict (claim_key) do update
set
  claim_text = excluded.claim_text,
  status = excluded.status,
  metric_definition = excluded.metric_definition,
  denominator = excluded.denominator,
  timeframe = excluded.timeframe,
  confidence_label = excluded.confidence_label,
  source_artifact_path = excluded.source_artifact_path,
  audit_status = excluded.audit_status,
  audit_notes = excluded.audit_notes,
  audited_at = excluded.audited_at,
  published_at = excluded.published_at;
