# Agent Graph Design Spec

Date: 2026-06-13
Owner: Product + Engineering
Status: Draft
Purpose: Define the core Starting Monday workflow as an explicit graph with persistent state, decision criteria, checkpoints, and telemetry.

## Why this spec exists

Starting Monday already has AI features, recurring worker jobs, brief generation, and daily cadence loops.
What it does not yet have is one explicit graph that answers four questions:

1. What state is the user in right now?
2. What decision should happen next?
3. What can the system do automatically?
4. Where must a human confirm, interpret, or override?

This spec turns the product from a collection of useful capabilities into a deliberately designed operating system.

## Product thesis

The moat is not the model alone.
The moat is the graph:
- which nodes exist
- what state persists between nodes
- what transitions are allowed
- which transitions happen automatically
- where human checkpoints are required
- how the system recovers from stall, ambiguity, and silence

For Starting Monday, the graph is the product design layer that sits above:
- models
- tools
- jobs
- UI surfaces
- notification channels

## Design principles

1. Persistent state beats stateless generation.
The system should remember what happened at the company, contact, opportunity, and user-cadence level.

2. One decision per step.
Each node should drive a single next decision, not a flood of options.

3. Human judgment stays where stakes rise.
The system can summarize, propose, rank, and draft.
It should not silently send, escalate, or reposition in high-stakes moments without review.

4. Stall must be visible.
A graph without stall detection becomes a false sense of momentum.

5. Re-entry should be cheap.
Users will pause, drift, or go dark.
The graph must support clean reactivation.

## Scope

This first spec covers the core executive-search operating loop and the coach overlay.
It does not yet define:
- search-firm-specific workflow branches
- outplacement cohort branches
- alumni mode
- concierge / managed-service graph

## Core graph entities

### Primary entities

- User
- Company
- Contact
- Signal
- Opportunity lane
- Brief
- Follow-up
- Coach relationship

### State containers

- User search mode
- Company priority state
- Opportunity state
- Brief readiness state
- Contact engagement state
- Cadence health state
- Coach visibility state

## Core executive-search graph

## Node 1: Company tracked

Definition:
A company has been added to the user pipeline and is eligible for monitoring.

Entry triggers:
- user manually adds company
- import flow adds company
- coach or advisor suggests company and user accepts

State created:
- company_id
- company priority
- rationale for inclusion
- target role family
- decision timeline notes
- watch status

Next transitions:
- signal scan scheduled
- company reprioritized
- company archived

## Node 2: Signal detected

Definition:
A worker job or intake process produces a potentially meaningful company event.

Examples:
- executive departure
- board change
- funding event
- job post
- acquisition
- leadership expansion

State created:
- signal type
- source
- timestamp
- raw evidence
- confidence
- recency

Next transitions:
- signal triaged
- signal discarded
- signal grouped into pattern

## Node 3: Signal triaged

Definition:
A signal is interpreted into business meaning for the user.

System action:
- classify importance
- map likely implication
- suggest urgency
- suggest likely action type

Required state:
- triage status
- urgency score
- implication summary
- recommended action class
- owner decision needed boolean

Human checkpoint:
- required when action affects outreach, narrative, or company priority

Next transitions:
- company reprioritized
- outreach drafted
- monitor only
- no action

## Node 4: Company reprioritized

Definition:
The company is moved up, down, or paused based on fresh signal interpretation.

State updated:
- priority rank
- rationale
- changed_at
- changed_by
- expiry or revisit date

Next transitions:
- outreach drafted
- prep brief requested
- follow-up scheduled
- passive monitoring continues

## Node 5: Outreach drafted

Definition:
The system has enough context to propose an outreach action.

System action:
- generate message angle
- incorporate signal context
- map to audience type
- propose CTA

Required state:
- recipient type
- outreach objective
- source context
- draft version
- review status

Human checkpoint:
- required before send

Next transitions:
- outreach approved
- outreach rewritten
- outreach abandoned

## Node 6: Outreach sent

Definition:
A reviewed outreach message has been sent or logged as sent externally.

State updated:
- sent_at
- channel
- recipient
- message objective
- expected response window

Next transitions:
- reply received
- follow-up scheduled
- no response timeout

## Node 7: Prep brief requested

Definition:
A user or coach needs a high-quality brief for an active conversation or interview.

System prerequisites:
- company context exists
- user positioning exists
- target conversation type exists

State created:
- brief type
- target audience
- input bundle version
- generated_at
- model used
- confidence or completeness flags

Next transitions:
- brief reviewed
- brief revised
- brief used in conversation

## Node 8: Brief reviewed

Definition:
A human has opened and assessed the brief.

State updated:
- reviewed_at
- reviewed_by
- quality rating optional
- missing-context flag optional

Next transitions:
- interview logged
- positioning updated
- objection rehearsal needed

## Node 9: Interview or high-stakes conversation logged

Definition:
The user records that a live conversation happened.

State created:
- conversation type
- date
- participants
- outcome
- objections encountered
- next step
- risk flags

Next transitions:
- follow-up scheduled
- opportunity advanced
- opportunity stalled
- opportunity dropped

## Node 10: Follow-up scheduled

Definition:
A next action exists with owner and time.

State created:
- due date
- owner
- action type
- dependency
- overdue risk

Next transitions:
- follow-up completed
- follow-up overdue
- follow-up canceled

## Node 11: Opportunity advanced

Definition:
The company lane has progressed materially.

Examples:
- first interview
- panel
- finalist
- compensation discussion

State updated:
- stage
- last meaningful movement date
- readiness requirement
- escalation priority

Next transitions:
- new prep brief requested
- follow-up scheduled
- offer tracking branch

## Node 12: Opportunity stalled or dropped

Definition:
The lane has paused, gone cold, or ended.

State updated:
- stall reason or loss reason
- last movement date
- reactivation condition
- lessons captured

Next transitions:
- reactivation watch
- archive
- related-company discovery

## Cross-cutting graph rules

### Stall detection

A lane is flagged stalled when:
- no meaningful company movement plus no user action within defined window
- follow-up overdue beyond threshold
- signal detected but no user decision recorded

Outputs:
- visible stall marker
- morning briefing inclusion
- coach snapshot inclusion when shared

### Re-entry logic

If the user returns after inactivity:
- show changed companies first
- show overdue actions second
- show one recommended restart action third

### Confidence ladder

Every system recommendation should carry one of four confidence states:
- informational only
- likely useful
- recommended
- review required before action

Only informational and likely useful states can surface without explicit friction.
Recommended and review-required states must be visible as decision points.

## Persistent state requirements

Minimum durable state by entity:

### User
- search mode
- subscription tier
- positioning snapshot
- target role family
- cadence preferences
- last meaningful action timestamp

### Company
- priority rank
- watch status
- role relevance
- latest signal timestamp
- latest action timestamp
- stall flag

### Signal
- source
- type
- confidence
- grouped pattern id optional
- triage status
- action implication

### Brief
- type
- generation inputs version
- review status
- usage status
- feedback status

### Follow-up
- due date
- owner
- completed status
- escalation status

## Coach overlay graph

The coach flow is not a separate product graph.
It is an overlay on the same client graph.

Additional coach nodes:
- coach granted access
- pre-session snapshot generated
- coach reviewed client changes
- session outcome recorded
- 30-day pilot checkpoint evaluated

Coach-specific state:
- access scope
- last coach review timestamp
- visible changes since last session
- pilot pass/fail metrics

Coach checkpoints:
- before-session summary must compress to under 2 minutes
- pilot decision must show concrete pass/fail evidence, not generic engagement

## Telemetry events

Each node should emit structured events for:
- entered
- completed
- stalled
- resumed
- abandoned

Minimum first-pass telemetry set:
- company_added
- signal_detected
- signal_triaged
- priority_changed
- outreach_draft_generated
- outreach_sent_logged
- prep_brief_generated
- prep_brief_reviewed
- conversation_logged
- follow_up_scheduled
- follow_up_overdue
- lane_stalled
- lane_reactivated
- coach_snapshot_reviewed
- pilot_checkpoint_completed

## UX implications

1. Morning briefing should map directly to graph state changes, not raw events.
2. Pricing page should sell access to better state and decisions, not just features.
3. Coach workflow should expose delta since last session, not static dashboards.
4. The product should prefer one high-confidence next step over dense option lists.

## Implementation phases

### Phase 1: Spec and telemetry mapping
- map current features to graph nodes
- confirm missing states
- define event names and payloads

### Phase 2: State surfacing
- expose company and opportunity stall state
- expose brief review and usage state
- expose changed-since-last-session coach snapshot state

### Phase 3: Checkpoint enforcement
- require review before high-stakes outreach actions
- require explicit interpretation before major priority changes

### Phase 4: Optimization
- learn where users stall
- shorten re-entry path
- tune automation thresholds

## File targets for implementation

Strategy and architecture:
- ARCHITECTURE.md
- docs/product-requirements.md
- docs/coach-council-epic.md

Likely code surfaces:
- src/lib/trace.ts
- src/lib/action-scores.ts
- src/lib/api-usage.ts
- src/lib/subscription.ts
- worker/jobs/signal-job.js
- worker jobs driving follow-up and briefing cadence
- AI routes for prep briefs, strategy briefs, and outreach drafting
- coach dashboard surfaces and relevant APIs

## Acceptance criteria for this spec

1. Product, engineering, and growth can point to one shared graph for core workflow.
2. Every major AI feature maps to a graph node and a state requirement.
3. High-stakes actions have explicit checkpoints.
4. Stall, re-entry, and review events are measurable.

## Open questions

1. Should Concierge be a separate graph branch or a service layer on the same graph?
2. Which graph states should be user-visible versus internal-only?
3. Where should the system auto-log progress versus wait for explicit user confirmation?
4. Which nodes should trigger coach notifications by default?
