# Sprint 1 IA Spec and Route Map

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

## Sprint 1 Scope

This sprint locks information architecture and decision architecture for four channel entries:
- Executive
- Coaches
- Outplacement
- Search Firms

This sprint does not ship full channel UI implementation. It defines the contract for Sprint 2 and Sprint 3 delivery.

## Decision 1: Channel Entry Architecture

### Canonical channel entry routes (target)

- /executives
- /coaches
- /outplacement
- /search-firms

### Current production routes (interim)

- /for-cio (executive entry proxy)
- /for-coaches
- /for-outplacement
- /for-search-firms

### Migration rule

Until Sprint 2 channel pages are live, the current production routes remain primary for external traffic. New channel routes will launch behind internal review first, then become canonical in a controlled cutover.

## Decision 2: Persona Matrix

### Executive personas

- CIO/CTO transition: /for-cio
- VP to C-suite transition: /for-vp
- VP Technology: /for-vp-technology
- Chief Data Officer: /for-data-officer
- Chief Digital Officer: /for-cdo
- CISO: /for-ciso
- CPO: /for-cpo
- COO: /for-coo

### Coach personas

- Independent executive coach: /for-coaches
- Boutique firm coach partner: /for-coaches
- Enterprise-sponsored coach cohort lead: /for-coaches

Sprint 3 note: coach persona-specific subroutes are planned for implementation and instrumentation.

### Outplacement buyer personas

- Practice leader: /for-outplacement
- Program operations director: /for-outplacement
- Counselor lead: /for-outplacement
- Procurement and legal reviewer: /for-outplacement

Sprint 3 note: role-specific subroutes are planned for implementation and instrumentation.

### Search-firm personas

- Partner/firm lead: /for-search-firms
- Principal and delivery lead: /for-search-firms
- Candidate success and readiness owner: /for-search-firms

Sprint 3 note: sub-persona route split is planned after channel entry implementation.

## Decision 3: URL and naming rules

- Route format: lowercase, hyphen-separated.
- Channel root pages own top-level narrative and trust framing.
- Persona routes inherit channel-level trust blocks and add role-specific outcomes.
- Primary CTA naming is channel-specific, not generic.

## Decision 4: Micro-product taxonomy boundaries (v1)

- Signal Scanner
  - For: early transition detection and priority monitoring.
  - Not for: full search workflow management.

- Relationship Command Center
  - For: pipeline and follow-up execution discipline.
  - Not for: CRM replacement for enterprise sales teams.

- Prep Brief Engine
  - For: high-stakes interview and meeting readiness.
  - Not for: general interview coaching substitution.

- Daily Briefing
  - For: accountability cadence and action prioritization.
  - Not for: general-purpose news aggregation.

- Strategy Brief
  - For: search thesis and positioning alignment.
  - Not for: long-form resume writing services.

- Resume Tailoring
  - For: role-targeted revision support.
  - Not for: outsourced resume writing.

## Sprint 1 Exit Contract

Sprint 1 will be considered complete when:
- Channel and persona IA is approved.
- Route map and URL conventions are approved.
- Measurement framework owners are assigned.
- Micro-product boundaries and naming are approved.

## Open items to close this sprint

- Confirm whether /executives or /for-executives is final canonical route.
- Confirm coach sub-persona route slugs for Sprint 3 build.
- Confirm outplacement role sub-persona route slugs for Sprint 3 build.
- Confirm search-firm sub-persona route slugs for Sprint 3 build.
