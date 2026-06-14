# Agent Graph Implementation Tickets

Date: 2026-06-13
Purpose: Convert the agent graph design spec into sprint-ready implementation tickets with exact file targets.
Depends on: docs/strategy/agent-graph-design-spec-2026-06-13.md

## Ticket set

### AG-01
Title: Define canonical graph event schema
Owner: Product + Engineering
Priority: P0
Goal:
- one event taxonomy for graph node entry, completion, stall, resume, and abandonment
Acceptance:
- event names are finalized
- minimum payload shape is documented
- analytics and tracing consumers have the same naming contract
File targets:
- docs/strategy/agent-graph-design-spec-2026-06-13.md
- src/lib/trace.ts
- docs/product-requirements.md

### AG-02
Title: Map current product features to graph nodes
Owner: Product
Priority: P0
Goal:
- every major workflow feature has an explicit graph node home
Acceptance:
- prep briefs, daily briefing, signal triage, outreach drafting, and follow-up reminders are mapped
- missing states are listed explicitly
File targets:
- docs/product-requirements.md
- ARCHITECTURE.md

### AG-03
Title: Add stall-state model for company and opportunity lanes
Owner: Engineering
Priority: P1
Goal:
- system can detect and expose stalled lanes instead of implying false progress
Acceptance:
- stall thresholds defined
- stalled lanes available to daily briefing and dashboard surfaces
- at least one measurable stall event emitted
File targets:
- src/lib/action-scores.ts
- worker/jobs/briefing-job.js
- relevant dashboard surfaces for company/opportunity state
- docs/product-requirements.md

### AG-04
Title: Add re-entry queue for paused or drifting users
Owner: Engineering
Priority: P1
Goal:
- returning users see changed state first and one best restart action
Acceptance:
- re-entry queue logic documented
- first-return experience surfaces changed companies, overdue actions, and one restart recommendation
File targets:
- worker jobs affecting cadence
- dashboard home surfaces
- docs/product-requirements.md

### AG-05
Title: Enforce human checkpoint before high-stakes outreach actions
Owner: Engineering
Priority: P1
Goal:
- AI can draft but not silently escalate high-stakes actions
Acceptance:
- outreach drafts require explicit review state before send logging
- checkpoint state is measurable
File targets:
- outreach drafting route(s)
- src/lib/trace.ts
- docs/product-requirements.md

### AG-06
Title: Add brief lifecycle state model
Owner: Engineering
Priority: P1
Goal:
- briefs move from generated to reviewed to used with measurable transitions
Acceptance:
- review state and usage state exist for prep briefs
- morning briefing and coach views can reference brief readiness
File targets:
- brief generation APIs
- brief persistence tables or adapters
- coach/client views referencing briefs

### AG-07
Title: Add coach pre-session snapshot from graph deltas
Owner: Engineering
Priority: P1
Goal:
- coaches see what changed since the last session in under two minutes
Acceptance:
- snapshot includes signals since last session, pipeline changes, and brief review changes
- coach snapshot is backed by persisted timestamps, not hand-rolled heuristics only
File targets:
- src/components/coach/client-data-view.tsx
- src/app/api/coach/client/[clientId]/scorecards/route.ts
- src/app/api/coach/client/[clientId]/alerts/route.ts
- docs/coach-council-epic.md

### AG-08
Title: Emit coach pilot checkpoint metrics
Owner: Product + Engineering
Priority: P2
Goal:
- pilot pass/fail decision is evidence-backed rather than anecdotal
Acceptance:
- first signal action, first prep brief review, and day-30 decision completion are measurable
File targets:
- coach preview and coach economics strategy docs
- coach funnel telemetry implementation
- docs/coach-council-epic.md

## Suggested sequencing

1. AG-01
2. AG-02
3. AG-03
4. AG-05
5. AG-06
6. AG-07
7. AG-04
8. AG-08

## Minimal first engineering slice

If only one engineering slice ships first, ship:
- AG-03 stall state
- AG-05 human checkpoint enforcement
- AG-07 coach pre-session snapshot

Those three create the fastest product-quality lift from the graph model.
