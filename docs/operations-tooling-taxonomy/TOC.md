# Starting Monday Tooling Taxonomy

Purpose: Canonical taxonomy of monitoring, observability, automation, and code-quality systems used to operate Starting Monday.

## Canonical Links
- Synthetic monitoring rollout summary:
  - [../status/synthetic-monitoring-rollout-summary-2026-06-13.md](../status/synthetic-monitoring-rollout-summary-2026-06-13.md)
- Synthetic monitoring rollout plan:
  - [../sre/synthetic-coverage-rollout-plan-2026-06-09.md](../sre/synthetic-coverage-rollout-plan-2026-06-09.md)
- Monitoring dashboard and runbook:
  - [../site-monitoring-dashboard.md](../site-monitoring-dashboard.md)
  - [../site-monitoring-runbook.md](../site-monitoring-runbook.md)

## Taxonomy

| Domain | Scope | Index |
| --- | --- | --- |
| Synthetic Monitoring | Route/action synthetics, generated harness, production synthetic schedules | [01-synthetic-monitoring/README.md](01-synthetic-monitoring/README.md) |
| Observability and Alerting | Health checks, watchdogs, alert fanout, reliability dashboards | [02-observability-alerting/README.md](02-observability-alerting/README.md) |
| CI/CD and Release Gates | Build, predeploy, post-deploy checks, branch promotion gates | [03-ci-cd-release-gates/README.md](03-ci-cd-release-gates/README.md) |
| Quality Assurance and Code Health | Test suites, lint/type gates, dependency/doc/rubric guards | [04-quality-assurance-and-code-health/README.md](04-quality-assurance-and-code-health/README.md) |
| Data Integrity and Security | Integrity checks, migration rollback readiness, API/security policies | [05-data-integrity-and-security/README.md](05-data-integrity-and-security/README.md) |
| Growth, PMF, and Reporting | Growth metrics gates, PMF monitors, weekly KPI exports/reports | [06-growth-pmf-and-reporting/README.md](06-growth-pmf-and-reporting/README.md) |
| Outreach and GTM Operations | Outreach reliability audits, send/reconcile pipelines, tone/compliance guards | [07-outreach-and-gtm-operations/README.md](07-outreach-and-gtm-operations/README.md) |
| Guide and Knowledge Sync | User/internal guide sync, retrieval evals, freshness guards | [08-guide-and-knowledge-sync/README.md](08-guide-and-knowledge-sync/README.md) |
| Worker Automations | Scheduled worker job system and domain jobs | [09-worker-automations/README.md](09-worker-automations/README.md) |
| Infrastructure and Runtime Operations | Railway/runtime preflight, env checks, health surfaces | [10-infrastructure-runtime-operations/README.md](10-infrastructure-runtime-operations/README.md) |
| Governance and Council Audits | Synthetic council, debt/security audits, readiness closeout controls | [11-governance-council-audits/README.md](11-governance-council-audits/README.md) |

## Operating Principle
This taxonomy is intentionally orthogonal: each tool appears in the domain of its primary operational responsibility, with cross-references where needed.
