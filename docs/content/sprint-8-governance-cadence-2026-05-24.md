# Sprint 8 Governance Cadence

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-24
Purpose: Keep council score closure above 95 through a predictable operating rhythm.

## Governance objectives

- Protect the 95+ council score floor for all reviewed members.
- Detect trust, conversion, onboarding, and intelligence regressions early.
- Convert evidence into prioritized fixes within one weekly cycle.

## Cadence model

### Weekly operating review (Monday)

Attendees: Product Lead, Data Engineer, Frontend Lead, Trust and Compliance Lead, Growth Engineer
Inputs:
- docs/weekly-unified-audit.latest.md
- docs/weekly-unified-audit.latest.json
- docs/code-synthetic-council-audit.latest.md
- docs/content/sprint-8-re-review-score-closure-2026-05-24.md

Output checklist:
- Confirm council score remains at or above 95 closure threshold.
- Log any new findings with owner and due date.
- Classify findings as blocking versus non-blocking.

### Biweekly council delta review (Wednesday, every 2 weeks)

Attendees: Product Ops, GTM Lead, Trust and Compliance Lead
Inputs:
- member score deltas against Sprint 8 closure table
- conversion and objection trend changes by channel/persona

Output checklist:
- Update member-level deltas and evidence references.
- Re-rank top score-lift opportunities by expected impact.
- Approve one stop-doing item and one focus item for next cycle.

### Monthly roadmap rebalance (first Friday)

Owner: Product Lead
Attendees: Founder, Product Ops, Engineering leads, GTM
Inputs:
- 4-week trend in council/debt/security signals
- unresolved medium-severity findings queue
- conversion and activation trend summaries

Output checklist:
- Rebalance roadmap by highest score-lift ROI.
- Set monthly quality gates for trust, onboarding, and proof architecture.
- Publish updated top-10 backlog with owners.

## Quality gates

A governance cycle is in good standing when all conditions remain true:
- Council closure floor: all reviewed members remain at or above 95.
- Unified audit council score: at least 95.
- Security high/critical vulnerabilities: 0.
- True auth guard gaps: 0.
- Regression checks: no sustained failure beyond one cycle without owner/date.

## Ownership map

- Founder: final score closure accountability and sprint sign-off.
- Product Ops: scorecard integrity, evidence links, and cadence facilitation.
- Product Lead: roadmap rebalance and dependency management.
- Data Engineer: metric refresh and dashboard integrity.
- Trust and Compliance Lead: claims/trust policy integrity and procurement-safe language.
- Frontend Lead: channel/persona conversion path quality and UX regressions.
- Growth Engineer: onboarding and activation optimization loops.

## Escalation policy

Escalate to same-day action planning when any of the following occurs:
- any reviewed member falls below 95
- unified council score drops below 95
- high or critical security vulnerabilities become non-zero
- trust or onboarding conversion trend declines for two consecutive weekly checks

## Reporting artifacts

- Weekly status snapshot: docs/weekly-unified-audit.latest.md
- Structured weekly data: docs/weekly-unified-audit.latest.json
- Sprint closure source of truth: docs/content/sprint-8-re-review-score-closure-2026-05-24.md
- Epic status source of truth: docs/content/council-score-95-site-improvement-epic.md
