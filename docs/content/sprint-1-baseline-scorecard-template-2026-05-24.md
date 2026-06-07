# Sprint 1 Baseline Scorecard Template

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-24
Epic: Council Score 95 Plus Site Improvement Epic
Sprint: 1 (IA and decision architecture)

## Baseline Council Scores

| Council | Baseline average | Target |
| --- | ---: | ---: |
| Main Synthetic Council | 83.7 | 95.0 |
| Executive Council | 84.2 | 95.0 |
| Coaches Council | 89.7 | 95.0 |
| Outplacement Council | 85.0 | 95.0 |
| Blended | 85.2 | 95.0 |

## Baseline Funnel Metrics

| Metric | Definition | Owner | Baseline | Target direction |
| --- | --- | --- | --- | --- |
| channel_entry_click_through_rate | Channel card click / homepage sessions | Data Engineer | TBD | Up |
| channel_entry_to_next_step_rate | Next-step CTA click after channel entry | Product Lead | TBD | Up |
| persona_route_selection_rate | Persona route click / channel sessions | Frontend Lead | TBD | Up |
| persona_route_completion_rate | Persona route CTA click / persona route sessions | Product Ops | TBD | Up |
| trust_block_interaction_rate | Trust interaction / route sessions | Trust and Compliance Lead | TBD | Up |

## Event Contract Implemented In Code

- src/lib/channel-metrics-events.ts
- src/lib/channel-ia.ts
- src/components/home/ChannelEntryStrip.tsx
- src/app/page.tsx
- src/components/LandingPage.tsx

## Weekly Review Rhythm

- Monday: refresh prior-week baseline and trend.
- Wednesday: investigate metric regressions and owner actions.
- Friday: publish sprint delta memo for council scoring evidence.

## Exit Note

Sprint 1 exit criteria met:
- IA spec published.
- Route map and URL conventions published.
- Measurement contract published.
- Event schema published and implemented for baseline collection.
- Scorecard template published with owners and baseline contract.
