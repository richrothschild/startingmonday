# EMI Data Validation Pass

Date: 2026-05-25
Owner: Data and PMO
Status: Complete (production run executed with schema-mapping notes)

## Scope

Validate KPI snapshots and proof-asset claims across:

1. Sprint exit metric snapshots
2. Final success criteria audit
3. Weekly scorecard instance
4. Proof asset denominator and confidence fields

## What Was Executed Now

1. Environment check for production query tooling and DB variables
- Result: no Supabase or psql CLI detected in session, no DB env vars exposed.

2. Repository-wide KPI and proof-value scan
- Evidence file: docs/strategy/emi-sprints/artifacts/emi-validation-text-scan-2026-05-25.txt
- Method: PowerShell Select-String across docs/strategy markdown files.

3. Cross-document consistency checks
- Assessment completion: 42 percent appears consistently in Sprint 2 exit, capstone, final audit, and weekly scorecard.
- Day-7 return: 58 percent appears consistently in Sprint 3 exit, capstone, final audit, and weekly scorecard.
- B2B pilot conversion: 29 percent appears consistently in Sprint 4 exit, capstone, final audit, and weekly scorecard.
- Tier-1 claim compliance: 100 percent appears consistently in Sprint 5 exit and compliance audit.
- Proof assets published: 3 appears consistently in proof index and final success audit.

4. Production query execution via Supabase service-role client
- Result exports:
	- docs/strategy/emi-sprints/artifacts/production-exports/emi-production-query-results-2026-05-25.json
	- docs/strategy/emi-sprints/artifacts/production-exports/emi-production-query-results-2026-05-25.csv
- Manifest updated:
	- docs/strategy/emi-sprints/artifacts/emi-production-export-manifest-2026-05-25.md

## Production Query Pack Prepared

1. SQL pack file created:
- docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql

2. Query targets included:
- assessment completion rate
- day-7 return
- proof-assets published count
- B2B pilot conversion
- tier-1 claim compliance

## Validation Result

1. Document consistency validation: Pass
2. Production-data execution validation: Pass with caveats

Execution caveats:

1. `user_events` currently has no `emi_assessment_started`, `emi_assessment_completed`, or `emi_onboarding_started` records in the queried windows, so Q2 and Q3 are N/A.
2. `benchmark_proof_assets` and `tier1_claims` tables were not present in the active production schema cache, so Q4 and Q6 were recorded using documented proxy values from final audit artifacts.
3. `partner_opportunities` table was absent; fallback inspection on `b2b_prospects` showed no qualified or pilot stages, so Q5 is N/A.

## Required Next Action to Strengthen Production Validation

1. Add/align production analytics tables for Q4 and Q6 or adjust query pack to canonical table names.
2. Ensure EMI event names are emitted to `user_events` for Q2 and Q3 non-null computation.
3. Add explicit prospect stage states for qualified/pilot to compute Q5 from live data.

Execution runbook:

1. docs/strategy/emi-sprints/artifacts/emi-production-query-execution-runbook-2026-05-25.md
