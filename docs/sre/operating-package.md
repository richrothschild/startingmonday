# Starting Monday Reliability Operating Package

Last updated: 2026-05-18
Owner: Engineering

## Purpose

This package defines how Starting Monday achieves enterprise-grade reliability and UX quality.

It includes:

1. Route/page SLO catalog with full codebase coverage
2. Alert matrix with exact thresholds and escalation paths
3. Production synthetic checks and deploy gate specification
4. Runbook templates and incident severity policy
5. 90-day implementation epic

## Source of Truth Files

1. SLO Catalog: docs/sre/slo-catalog.md
2. Alert Matrix: docs/sre/alert-matrix.md
3. Synthetic Tests and Deploy Gates: docs/sre/synthetic-tests-and-deploy-gates.md
4. Runbook Templates: docs/sre/runbook-templates.md
5. Incident Severity Policy: docs/sre/incident-severity-policy.md
6. 90-day Epic: docs/epic-90-day-reliability-rollout.md

## Coverage Inputs

All current route/page inventory is captured in:

1. docs/sre/inventory-pages.md
2. docs/sre/inventory-api-routes.md

Any route/page added to src/app must be added to the inventory files in the same PR and mapped by SLO tier rules in docs/sre/slo-catalog.md.

## Operating Cadence

1. Weekly reliability review (SLO attainment, burn, active incidents)
2. Post-incident review within 48 hours for Sev-1/Sev-2
3. Monthly alert quality review (noise, missed detection, runbook quality)
4. Quarterly SLO and threshold recalibration

## Release Policy

1. No production deploy if synthetic gate fails
2. No production deploy when fast-burn SLO alert is open
3. Feature work is paused when error budget policy requires reliability focus
