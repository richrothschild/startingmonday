# Q2 2027 Sprint-Ready Tickets: Epic B (Partner Scale and Flywheel)

Epic source: docs/epic-partner-scale-and-flywheel-2026-2027.md
Quarter window: Q2 2027 (April-June)
Assignee default for all tickets: You

## Planning assumptions

1. Sprint cadence: 2 weeks.
2. Q2 planning capacity target: 70-84 points.
3. Priority order follows Epic B Phase 2: outplacement scale mechanics.
4. Every ticket must pass Section 15 gate checks and 7-layer scorecard.

## Ticket list (summary)

| Ticket ID | Title | Story mapping | Owner lane | Points | Target sprint | Assignee |
| --- | --- | --- | --- | --- | --- | --- |
| PB-Q2-001 | Cohort roster and milestone data model | P2.1 | Lane B + Lane C | 8 | Sprint 1 | You |
| PB-Q2-002 | Outplacement cohort admin console v1 | P2.1 | Lane D + Lane B | 8 | Sprint 1 | You |
| PB-Q2-003 | Sponsor snapshot controls and cadence monitor | P2.1 | Lane C + Lane E | 5 | Sprint 1 | You |
| PB-Q2-004 | One-click partner provisioning import pipeline | P2.2 | Lane B + Lane C | 8 | Sprint 2 | You |
| PB-Q2-005 | Seat lifecycle automation and permission controls | P2.2 | Lane B + Lane E | 8 | Sprint 2 | You |
| PB-Q2-006 | Provisioning SLA, error QA, and retry workflow | P2.2 | Lane C + Lane B | 5 | Sprint 2 | You |
| PB-Q2-007 | Program template schema and version governance | P2.3 | Lane A + Lane C | 8 | Sprint 3 | You |
| PB-Q2-008 | Executive transition, board-track, and restructuring packs | P2.3 | Lane A + Lane D | 8 | Sprint 3 | You |
| PB-Q2-009 | Template adoption analytics and quality scorecard | P2.3 | Lane C + Lane E | 5 | Sprint 3 | You |
| PB-Q2-010 | Value-lane pricing model and entitlements | P2.4 | Lane E + Lane B | 8 | Sprint 4 | You |
| PB-Q2-011 | Migration playbook automation and segmented comms | P2.4 | Lane E + Lane D | 8 | Sprint 4 | You |
| PB-Q2-012 | ARPU and pilot-to-contract conversion dashboard | P2.4 | Lane C + Lane E | 5 | Sprint 4 | You |

Planned total: 84 points

## Detailed ticket cards

### PB-Q2-001

Title: Cohort roster and milestone data model
Story mapping: P2.1
Owner lane: Lane B + Lane C
Points: 8
Assignee: You

Description:

Define cohort-level roster, milestone, and sponsor snapshot schema to support outplacement operations.

Acceptance criteria:

1. Data model supports cohort roster, status, start/end dates, and milestone checkpoints.
2. Sponsor snapshot fields are normalized for reporting consumption.
3. Model supports per-cohort and per-program breakdowns.
4. Contract tests validate compatibility with partner reporting routes.

7-layer primary and secondary:

1. Primary: Infrastructure
2. Secondary: Memory, Identity

---

### PB-Q2-002

Title: Outplacement cohort admin console v1
Story mapping: P2.1
Owner lane: Lane D + Lane B
Points: 8
Assignee: You

Description:

Build admin console for cohort creation, roster edits, milestone updates, and sponsor snapshot review.

Acceptance criteria:

1. Admins can create and edit cohorts with role-based access controls.
2. Roster add/remove and milestone update actions are audited.
3. Cohort-level progress view renders milestone completion by status.
4. UI passes operator clarity review for partner success workflows.

Dependencies:

1. PB-Q2-001 complete.

7-layer primary and secondary:

1. Primary: Surface
2. Secondary: Choreography, Infrastructure

---

### PB-Q2-003

Title: Sponsor snapshot controls and cadence monitor
Story mapping: P2.1
Owner lane: Lane C + Lane E
Points: 5
Assignee: You

Description:

Implement snapshot controls and cadence monitor to ensure sponsor rollups are complete on scheduled intervals.

Acceptance criteria:

1. Snapshot completeness checks run on configured cadence.
2. Missing cohort fields trigger alerts with owner assignment.
3. Cadence adherence is measured and surfaced by cohort.
4. Summary output supports partner success weekly review.

Dependencies:

1. PB-Q2-001 complete.
2. PB-Q2-002 complete in staging.

7-layer primary and secondary:

1. Primary: Anticipation
2. Secondary: Memory, Infrastructure

---

### PB-Q2-004

Title: One-click partner provisioning import pipeline
Story mapping: P2.2
Owner lane: Lane B + Lane C
Points: 8
Assignee: You

Description:

Build bulk import and provisioning workflow for partner cohorts with one-click execution and deterministic validation.

Acceptance criteria:

1. 100-seat import completes in under 15 minutes in staging load tests.
2. Import validation rejects malformed rows with explicit error reasons.
3. Provisioning jobs generate auditable run logs and retry metadata.
4. Error rate remains below 2% in pilot simulation runs.

Dependencies:

1. PB-Q2-001 complete.

7-layer primary and secondary:

1. Primary: Infrastructure
2. Secondary: Choreography, Identity

---

### PB-Q2-005

Title: Seat lifecycle automation and permission controls
Story mapping: P2.2
Owner lane: Lane B + Lane E
Points: 8
Assignee: You

Description:

Automate seat invite, activation, suspension, and transfer flows with partner-safe permission boundaries.

Acceptance criteria:

1. Lifecycle transitions include invite, activate, suspend, transfer, and archive.
2. Permission checks enforce partner/org scoping for all transitions.
3. Transition events are logged for audit and rollback diagnostics.
4. Admin workflows support bulk actions for cohort changes.

Dependencies:

1. PB-Q2-004 complete.

7-layer primary and secondary:

1. Primary: Choreography
2. Secondary: Infrastructure, Identity

---

### PB-Q2-006

Title: Provisioning SLA, error QA, and retry workflow
Story mapping: P2.2
Owner lane: Lane C + Lane B
Points: 5
Assignee: You

Description:

Add SLA and QA monitor for provisioning jobs, including auto-retry policy and alerting for breach conditions.

Acceptance criteria:

1. SLA monitor reports job duration and error class distribution.
2. Retry policy is configurable per partner provisioning run.
3. Alerts fire for SLA breaches and repeated failure patterns.
4. Weekly QA summary identifies top remediation causes.

Dependencies:

1. PB-Q2-004 complete.
2. PB-Q2-005 complete.

7-layer primary and secondary:

1. Primary: Infrastructure
2. Secondary: Anticipation, Memory

---

### PB-Q2-007

Title: Program template schema and version governance
Story mapping: P2.3
Owner lane: Lane A + Lane C
Points: 8
Assignee: You

Description:

Define template schema, versioning, and governance controls for partner program configurations.

Acceptance criteria:

1. Template schema supports required sections and configurable defaults.
2. Version history tracks editor, timestamp, and change summary.
3. Publish workflow enforces validation checks before activation.
4. Backward compatibility path exists for active partner cohorts.

Dependencies:

1. PB-Q2-001 complete.

7-layer primary and secondary:

1. Primary: Memory
2. Secondary: Infrastructure, Identity

---

### PB-Q2-008

Title: Executive transition, board-track, and restructuring packs
Story mapping: P2.3
Owner lane: Lane A + Lane D
Points: 8
Assignee: You

Description:

Ship three first-class program template packs for executive transition, board-track, and restructuring use cases.

Acceptance criteria:

1. Three program packs are publishable from template system.
2. Each pack includes milestones, session cadence, and sponsor summary fields.
3. Pack copy and UX pass editorial and operator review.
4. New partner cohorts can launch with one-click template apply.

Dependencies:

1. PB-Q2-007 complete.

7-layer primary and secondary:

1. Primary: Surface
2. Secondary: Memory, Choreography

---

### PB-Q2-009

Title: Template adoption analytics and quality scorecard
Story mapping: P2.3
Owner lane: Lane C + Lane E
Points: 5
Assignee: You

Description:

Track template adoption and quality outcomes across new partner cohorts.

Acceptance criteria:

1. Adoption metric reports template use across new cohort launches.
2. Quality scorecard tracks completion and variance by template.
3. Dashboard identifies low-performing templates for remediation.
4. Template adoption on new partner programs reaches at least 60%.

Dependencies:

1. PB-Q2-008 complete.

7-layer primary and secondary:

1. Primary: Memory
2. Secondary: Anticipation, Identity

---

### PB-Q2-010

Title: Value-lane pricing model and entitlements
Story mapping: P2.4
Owner lane: Lane E + Lane B
Points: 8
Assignee: You

Description:

Implement pricing and entitlement model by value lane for partner account packaging.

Acceptance criteria:

1. Pricing model maps plans to explicit value-lane capabilities.
2. Entitlement checks gate partner features consistently.
3. Billing-compatible plan payloads are generated for downstream systems.
4. Pricing documentation is aligned with partner success playbook.

Dependencies:

1. PB-Q2-005 complete.
2. PB-Q2-007 complete.

7-layer primary and secondary:

1. Primary: Identity
2. Secondary: Infrastructure, Choreography

---

### PB-Q2-011

Title: Migration playbook automation and segmented comms
Story mapping: P2.4
Owner lane: Lane E + Lane D
Points: 8
Assignee: You

Description:

Automate migration playbook execution and segmented communications for pricing and packaging transitions.

Acceptance criteria:

1. Migration cohorts can be scheduled by partner segment.
2. Communication templates are configurable by migration path.
3. Migration status dashboard tracks completion, exceptions, and escalations.
4. Rollout supports phased adoption with rollback control points.

Dependencies:

1. PB-Q2-010 complete.

7-layer primary and secondary:

1. Primary: Choreography
2. Secondary: Surface, Identity

---

### PB-Q2-012

Title: ARPU and pilot-to-contract conversion dashboard
Story mapping: P2.4
Owner lane: Lane C + Lane E
Points: 5
Assignee: You

Description:

Deliver partner revenue dashboard for ARPU uplift and pilot-to-contract conversion with quality guardrails.

Acceptance criteria:

1. Dashboard reports ARPU by segment and pricing lane.
2. Pilot-to-contract conversion is measurable by partner cohort.
3. Guardrails flag data anomalies and attribution drift.
4. Q2 target readout includes ARPU uplift trend and conversion trend.

Dependencies:

1. PB-Q2-010 complete.
2. PB-Q2-011 complete.

7-layer primary and secondary:

1. Primary: Memory
2. Secondary: Infrastructure, Identity

## Sprint mapping recommendation

### Sprint 1

1. PB-Q2-001 (8)
2. PB-Q2-002 (8)
3. PB-Q2-003 (5)

Sprint total: 21

### Sprint 2

1. PB-Q2-004 (8)
2. PB-Q2-005 (8)
3. PB-Q2-006 (5)

Sprint total: 21

### Sprint 3

1. PB-Q2-007 (8)
2. PB-Q2-008 (8)
3. PB-Q2-009 (5)

Sprint total: 21

### Sprint 4

1. PB-Q2-010 (8)
2. PB-Q2-011 (8)
3. PB-Q2-012 (5)

Sprint total: 21

Quarter total: 84

## Release gate reminder (must pass)

1. Gate 0 Intake: 7-layer declaration + DRI set.
2. Gate 1 Design: state acknowledgment before action in critical flow.
3. Gate 2 Build: provenance/confidence/accountability controls present.
4. Gate 3 Data: KPI events and dashboard live.
5. Gate 4 Trust: confidentiality and permission impact reviewed.
6. Gate 5 Outcome: 30-day readout scheduled and reviewed.