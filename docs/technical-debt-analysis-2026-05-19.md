# Technical Debt Analysis (May 19, 2026)

## Executive Summary

Current debt is concentrated in three areas:

1. Tooling and release reliability drift (dependency compatibility, script portability, docs/script mismatch)
2. Type safety and lint suppression in API and automation surfaces
3. Operational script robustness and maintainability

The system is deployable and production is currently healthy, but recent failures show elevated risk in release reliability and long-term maintenance overhead.

## Method and Evidence

This analysis was based on:

- Architecture and platform docs
- Dependency and script configuration in package.json
- Static code markers (eslint-disable, explicit any, process.exit usage)
- Current lint baseline
- Recent deployment incident patterns

Evidence highlights:

- 52 automation routes under src/app/api/admin/automation/**/route.ts
- 173 lint warnings, 0 errors
- 101 process.exit(...) usages in scripts/
- check:auth uses sh script on a Windows-heavy workflow
- README references npm run typecheck, but package.json has no typecheck script

## Debt Register

| ID | Area | Severity | Evidence | Impact | Recommended Remediation |
| --- | --- | --- | --- | --- | --- |
| TD-01 | Dependency governance and release reliability | High | Recent Railway failure due to Next/Sentry peer mismatch; version churn between canary and stable | Failed production deploys and rollback pressure | Add a dependency policy: pin critical framework/observability pairs (Next + @sentry/nextjs), run npm ci in CI before merge, add a lockfile compatibility check job |
| TD-02 | Lint debt baseline | Medium | 173 warnings (0 errors); dominant rules include no-explicit-any, no-unused-vars, react/no-unescaped-entities | Slower reviews, hidden correctness issues, warning fatigue | Introduce warning budgets by rule, fail CI only on regression, burn down top 3 rules by module ownership |
| TD-03 | Automation API type suppression | High | 52 admin automation routes and many file-level eslint-disable for no-explicit-any | Reduced type guarantees in sensitive operational APIs; higher regression/security risk | Add shared typed request/response schemas for automation routes, remove file-level disables incrementally, enforce route scaffold with Zod + typed helpers |
| TD-04 | Cross-platform script portability | High | check:auth uses sh scripts/check-auth.sh in package.json | Broken local validation on Windows; inconsistent developer and CI behavior | Replace shell script with Node or PowerShell-compatible implementation, keep one canonical script path for all environments |
| TD-05 | Script process termination patterns | Medium | 101 process.exit(...) matches in scripts/ | Hard exits reduce composability, error propagation consistency, and can create runtime edge cases | Migrate critical scripts to set process.exitCode and structured error handling; prioritize scripts used in CI/prebuild |
| TD-06 | Documentation drift | Medium | README instructs npm run typecheck, but no such script in package.json | Onboarding friction and false troubleshooting paths | Add typecheck script or update README immediately; add docs validation check for command existence |
| TD-07 | Profile data model coupling | Medium | LinkedIn PDF upload currently writes extracted text into linkedin_about | Mixes generated profile copy with raw ingestion source; weak provenance and overwrite risk | Add dedicated linkedin_raw_text (or source_docs table) and keep linkedin_about as curated output only |
| TD-08 | Deprecated token path still active | Low | src/lib/pixel-token.ts keeps unsigned token support (deprecated) for compatibility | Extended attack surface and delayed hardening completion | Add deprecation timeline and telemetry; switch strict mode default on a target date; remove unsigned path after adoption window |

## Prioritized 30/60/90 Plan

### 0 to 30 days

- Enforce release reliability gates:
  - CI step: npm ci + npm run build on merge target
  - Add dependency compatibility rule for Next/Sentry
- Fix portability/documentation debt:
  - Replace check:auth shell dependency
  - Align README and package scripts (typecheck)
- Create lint baseline snapshot and freeze warning growth

### 31 to 60 days

- Start automation API hardening:
  - Build typed route scaffold (auth, schema validation, typed DB writes)
  - Migrate top 10 highest-traffic or highest-risk automation endpoints
- Reduce explicit any usage in user-facing APIs first

### 61 to 90 days

- Complete profile ingestion model split (raw LinkedIn text vs curated about/headline)
- Retire unsigned pixel token fallback after telemetry confirms safe cutoff
- Migrate critical scripts away from direct process.exit in CI-sensitive paths

## Suggested Ownership

- Platform/DevEx: TD-01, TD-04, TD-05, TD-06
- API/Backend: TD-03, TD-08
- Product Data Model: TD-07
- Cross-team quality initiative: TD-02

## Success Metrics

- 0 deploy failures caused by dependency resolution for 60 days
- Lint warnings reduced by at least 40% with no regressions in suppressed-rule count
- 100% cross-platform local execution for core validation scripts
- 80% of automation routes migrated to typed scaffold
- Deprecated unsigned token path fully removed on schedule

## Notes

This analysis intentionally prioritizes reliability and maintainability debt over feature backlog debt. Business-facing debt items should be tracked separately in product roadmap artifacts.
