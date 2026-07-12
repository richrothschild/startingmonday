# Trust Daily Report

Generated: 2026-07-12T16:35:06.798Z
Channel: reliability---service

## Workflow Health

- Trust Integrity Agent: status=failed, conclusion=failure, age=152m, threshold=1800m
- Trust Escalation Agent: status=missing, conclusion=n/a, age=n/a, threshold=n/a
- Trust Weekly Issues Report: status=healthy, conclusion=success, age=1462m, threshold=11520m
- Trust Monthly Trends Report: status=healthy, conclusion=success, age=1461m, threshold=57600m

## Devil's Advocate Risks

- [elevated] Signal count parity drifts across dashboard, briefing, and signals surfaces without immediate detection.
  Mitigation: Trust Integrity Agent enforces parity as a P0 contract with daily cadence.
- [elevated] Stale relative-time language reappears and undermines trust in recency-sensitive guidance.
  Mitigation: Relative-time phrase checks run in trust integrity contracts and report findings via Slack and artifacts.
- [elevated] Trust issues are found but trend direction is unclear, delaying corrective prioritization.
  Mitigation: Weekly issue and monthly trend agents translate failures into directional operating signals.

## Route-Level Evidence Snippets

- Source generated: 2026-07-12T16:32:07.146Z
- Snapshot pass: pass
- Contract snippets:
  - signalParity=pass (dashboard=5, briefing=5, signals=5)
  - title=pass
  - landmark=pass
  - relativeTime=pass
- Route snippets:
  - /dashboard: status=200, title=ok, main=1, stalePhrases=0
  - /dashboard/briefing: status=200, title=ok, main=1, stalePhrases=0
  - /dashboard/signals: status=200, title=ok, main=1, stalePhrases=0
  - /dashboard/calendar: status=200, title=ok, main=1, stalePhrases=0
  - /dashboard/contacts: status=200, title=ok, main=1, stalePhrases=0
- Finding snippets:
  - None

## Missing Guardrails

- Automated owner mapping for repeated trust contract failures to reduce triage latency.
- Trust contract threshold ratchet that tightens after 30 consecutive healthy days.
- Cross-surface parity preflight in staging before production promotion runs.
- Contract-specific SLO targets (for example, parity extraction reliability) with rolling error budgets.

