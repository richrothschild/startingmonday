# Reliability Daily Report

Generated: 2026-07-11T14:22:56.183Z
Channel: reliability---service

## Workflow Health

- Production Synthetics: status=failed, conclusion=failure, age=8m, threshold=30m
- Dashboard Behavior Baseline Agent: status=missing, conclusion=n/a, age=n/a, threshold=n/a
- Production Monitoring: status=healthy, conclusion=success, age=18m, threshold=90m
- Monitoring Watchdog: status=failed, conclusion=failure, age=34m, threshold=90m
- Deployment Watchdog: status=healthy, conclusion=success, age=7m, threshold=90m

## Devil's Advocate Risks

- [elevated] Primary flows are slow enough to feel broken while still technically passing.
  Mitigation: Track settle-time percentiles (P50/P95) and alert on variance, not only hard failures.
- [controlled] Synthetic checks drift from live UX and stop representing real user behavior.
  Mitigation: Daily dashboard baseline crawl with route discovery and contract checks; review drift weekly.
- [controlled] Too many noisy alerts cause teams to ignore real incidents.
  Mitigation: Classify soft vs hard failures, dedupe repeats, include owner and runbook links in alerts.
- [elevated] A scheduled agent silently stops running.
  Mitigation: Watchdog freshness checks for each critical workflow with staleness thresholds.
- [controlled] Slack/webhook/auth secrets rotate or disappear, silently breaking alert delivery.
  Mitigation: Validate required secrets at workflow start and raise hard-fail alert when missing.
- [controlled] Synthetic account state drifts (limits, stale data, auth changes) and creates false failures.
  Mitigation: Use dedicated synthetic accounts, explicit skip reasons, and periodic account reset automation.

## Missing Guardrails

- Cross-environment parity check comparing staging vs production route performance over the same commit window.
- Automated alert dedupe window keyed by failure signature and route to reduce repeated noise.
- Monthly synthetic-account reset job to avoid data entropy and quota/limit drift in probes.
- Error budget burn-rate signal that escalates before hard SLO breaches.

