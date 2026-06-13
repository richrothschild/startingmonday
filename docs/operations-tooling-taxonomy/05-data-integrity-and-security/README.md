# 05 Data Integrity and Security

## Integrity and Data Health
- scripts/check-data-integrity.mjs
- scripts/check-dead-letter-coverage.mjs
- scripts/check-rls.sql
- scripts/backfill-*.mjs (data normalization and consistency backfills)

## Billing and Financial Safety
- scripts/check-billing-readiness.mjs
- scripts/fix-billing-placeholder-sql.mjs
- .github/workflows/dependency-health.yml

## Access and API Security
- scripts/check-api-guards.mjs
- scripts/check-auth.mjs
- docs/security-audit-runbook.md
- docs/security-deep-dive-audit.latest.md

## Runtime Security Surfaces
- sentry.client.config.ts
- sentry.server.config.ts
- sentry.edge.config.ts
- worker/index.js (Sentry + uncaught exception handlers)
