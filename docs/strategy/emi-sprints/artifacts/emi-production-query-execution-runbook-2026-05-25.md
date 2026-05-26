# EMI Production Query Execution Runbook

Date: 2026-05-25
Owner: Data
Purpose: Execute production KPI validation queries and complete the export manifest in one pass.

## Inputs

1. Query pack:
- docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql

2. Export manifest:
- docs/strategy/emi-sprints/artifacts/emi-production-export-manifest-2026-05-25.md

3. Validation report:
- docs/strategy/emi-sprints/artifacts/emi-data-validation-pass-2026-05-25.md

4. Weekly rerun procedure:
- docs/strategy/emi-sprints/artifacts/emi-production-validation-rerun-procedure.md

## Output Target Folder

Use this output folder for query results:

1. docs/strategy/emi-sprints/artifacts/production-exports

## Option A: psql Command-Line (Recommended)

Precondition: `psql` installed and production connection string available.

1. Set connection string in session:

```powershell
$env:PG_CONN_STR = "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
```

2. Create export folder:

```powershell
New-Item -ItemType Directory -Force -Path "docs/strategy/emi-sprints/artifacts/production-exports" | Out-Null
```

3. Execute all queries to one CSV:

```powershell
psql "$env:PG_CONN_STR" -v ON_ERROR_STOP=1 -f "docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql" -P pager=off -F "," -A -o "docs/strategy/emi-sprints/artifacts/production-exports/emi-production-query-results-2026-05-25.csv"
```

4. Also save console log:

```powershell
psql "$env:PG_CONN_STR" -v ON_ERROR_STOP=1 -f "docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql" *> "docs/strategy/emi-sprints/artifacts/production-exports/emi-production-query-results-2026-05-25.log"
```

## Option B: Supabase SQL Editor

Precondition: Supabase project SQL editor access.

1. Open query text from:
- docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql

2. Run each query block `Q1` through `Q6` one at a time.

3. Export each result as CSV and save with these names:

1. q1-emi_language_adoption_percent.csv
2. q2-assessment_completion_percent.csv
3. q3-day7_return_percent.csv
4. q4-proof_assets_published_count.csv
5. q5-b2b_pilot_conversion_percent.csv
6. q6-tier1_claim_compliance_percent.csv

4. Store all exports in:
- docs/strategy/emi-sprints/artifacts/production-exports

## Option C: PowerShell Wrapper (If psql is available)

```powershell
$conn = $env:PG_CONN_STR
$outDir = "docs/strategy/emi-sprints/artifacts/production-exports"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$queryPack = "docs/strategy/emi-sprints/artifacts/emi-production-query-pack.sql"

psql "$conn" -v ON_ERROR_STOP=1 -f $queryPack -P pager=off -F "," -A -o (Join-Path $outDir "emi-production-query-results-2026-05-25.csv")
psql "$conn" -v ON_ERROR_STOP=1 -f $queryPack *> (Join-Path $outDir "emi-production-query-results-2026-05-25.log")
```

## Manifest Update Procedure

After query execution:

1. Open:
- docs/strategy/emi-sprints/artifacts/emi-production-export-manifest-2026-05-25.md

2. For each query row, fill:

1. Executed at (UTC)
2. Result value
3. Export file path
4. Reviewer

3. Set sign-off flags at bottom of manifest:

1. All query rows completed: Yes
2. Values match published KPI snapshots: Yes or No
3. Final reviewer sign-off: name and date

## Validation Report Finalization

After manifest is completed:

1. Open:
- docs/strategy/emi-sprints/artifacts/emi-data-validation-pass-2026-05-25.md

2. Update:

1. Status from partial to complete
2. Production-data execution validation from pending to pass
3. Add link to export manifest rows and CSV files

## Troubleshooting

1. Table not found
- Action: map query to actual analytics table names and rerun only affected query.

2. Null or zero denominator
- Action: verify event names and timeframe coverage before concluding metric is zero.

3. Permission denied
- Action: rerun with read role that includes analytics and partner tables.

4. Weekly rerun standardization
- Action: use docs/strategy/emi-sprints/artifacts/emi-production-validation-rerun-procedure.md and follow dated export naming.
