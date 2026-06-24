# Search Firms Sprint 1 Implementation Tickets
Sprint: S1
Window: 2026-06-24 to 2026-07-05
Status: In progress
Primary goal: Operationalize legal, procurement, management, and trial-governance foundations while beginning canonical route implementation.

Artifacts this sprint:
1. docs/search-firms-legal-readiness-summary.md
2. docs/search-firms-procurement-packet.md
3. docs/search-firms-trial-charter-template.md

---

## SF-S1-001 Legal packet operationalization

Type: Operations and legal enablement
Priority: P0
Owner: Product operations
Support: Legal, security

Description:
- Convert legal readiness summary into an externally shareable first-pass legal packet.

Dependencies:
1. docs/search-firms-legal-readiness-summary.md
2. Existing policy and security references

Acceptance criteria:
1. Legal packet includes contract path, DPA path, confidentiality boundaries, and review checklist.
2. Escalation owners and SLA are documented.
3. Internal legal sign-off recorded.

Output:
- Versioned legal packet ready for buyer due diligence.

---

## SF-S1-002 Procurement packet go-live

Type: Revenue operations enablement
Priority: P0
Owner: Revenue operations
Support: Product, legal

Description:
- Finalize procurement packet for first-call follow-up and quote-to-order acceleration.

Dependencies:
1. docs/search-firms-procurement-packet.md
2. Pricing and package assumptions

Acceptance criteria:
1. Package options, buyer effort model, and timeline SLA are completed.
2. RACI and decision gates are explicit.
3. Procurement packet can be sent without custom rewrite.

Output:
- Procurement packet v1 approved for outbound use.

---

## SF-S1-003 Trial charter rollout

Type: Pilot governance
Priority: P0
Owner: Product operations
Support: Customer success, sponsor

Description:
- Make trial charter mandatory for pilot kickoff.

Dependencies:
1. docs/search-firms-trial-charter-template.md
2. Scorecard metric definitions

Acceptance criteria:
1. Charter template is complete and approved.
2. Pilot cannot start without named sponsor and scorecard owner.
3. Day-0 baseline and day-30 decision sections are required fields.

Output:
- Trial charter workflow integrated into pilot onboarding.

---

## SF-S1-004 Canonical route decision and implementation plan

Type: Product and IA
Priority: P0
Owner: Product
Support: Engineering, SEO

Description:
- Lock decision for /search-firms canonical journey and /for-search-firms normalization path.

Dependencies:
1. docs/search-firms-pages-revamp-plan.md

Acceptance criteria:
1. Decision recorded: redirect or short-form campaign route.
2. Sitemap and internal-link update list prepared.
3. Rollback and risk notes documented.

Output:
- Engineering-ready IA decision record.

---

## SF-S1-005 Page trust and procurement CTA spec

Type: UX and content systems
Priority: P1
Owner: Product design and content
Support: Engineering

Description:
- Define exact CTA placements linking to legal and procurement confidence assets.

Dependencies:
1. docs/search-firms-pages-revamp-plan.md
2. New legal and procurement docs

Acceptance criteria:
1. Above-fold and decision-stage CTA placements are specified.
2. Copy aligns with legal claim guardrails.
3. Persona pages have role-relevant next actions.

Output:
- Section-level implementation spec for /search-firms and /search-firms/personas.

---

## SF-S1-006 Tabletop simulation: first call to signed pilot

Type: Risk and readiness validation
Priority: P1
Owner: Operations
Support: Legal, procurement, product

Description:
- Run a tabletop simulation of legal, purchasing, and management flow from initial buyer call to signed pilot charter.

Dependencies:
1. All three new artifact docs

Acceptance criteria:
1. Blockers are logged with owner and due date.
2. Cycle-time bottlenecks are identified.
3. Updated v2 actions are added to Sprint 2 backlog.

Output:
- Simulation findings report and remediation checklist.

---

## Sprint 1 definition of done

1. Legal, procurement, and trial-governance artifacts are approved and usable.
2. Canonical route decision is locked with implementation plan.
3. Pilot readiness flow is test-run with blocker log.
4. Sprint 2 implementation backlog is generated from S1 findings.
