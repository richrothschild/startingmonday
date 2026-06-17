# Sprint 3 Persona Routing and Telemetry QA

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-24
Sprint: 3 (Persona path implementation by channel)

## Delivered persona routes

- Executive personas:
  - /executives/personas
  - /executives/personas/[slug]
- Coach personas:
  - /coaches/personas
  - /coaches/personas/[slug]
- Outplacement buyer-role personas:
  - /outplacement/personas
  - /outplacement/personas/[slug]
- Search-firm personas:
  - /search-firms/personas
  - /search-firms/personas/[slug]

## Executive mode split

- /executives/active
- /executives/passive

Both routes are wired from /executives with telemetry.

## Telemetry implementation

Core events used:
- persona_route_selected
- channel_entry_clicked

All new persona and mode CTAs are instrumented with:
- channel
- persona (for persona_route_selected)
- source_route and target_route (persona routes)
- source_page and cta_label (entry clicks)

## QA dashboard

- Admin view: /dashboard/admin/channel-benchmarks
- Added telemetry QA section with pass/fail threshold:
  - required telemetry missing-rate target < 2%

## Sprint 3 acceptance mapping

- S3-001 Executive persona routes: complete
- S3-002 Coach persona routes: complete
- S3-003 Outplacement buyer-role routes: complete
- S3-004 Search-firm sub-persona routes: complete
- S3-005 Intelligence vs active executive mode split: complete
- S3-006 Persona telemetry QA: complete
