# White-Label Product Spec (One Page)

Date: 2026-06-16  
Owner: Product + Partnerships  
Status: Draft for review

## Decision

Pursue the white-label pivot as a focused channel extension, not a full repositioning.

Rationale:
- Synthetic council guidance consistently favors outplacement and transition partners when the offer is trust-first, measurable, and no-custom at pilot start.
- Buyer evidence indicates generic executive-coach channel is too broad; transition-heavy providers are the higher-fit wedge.
- Current product already contains coach/outplacement workflow foundations, reducing build risk for an 8-10 week MVP.

Guardrail:
- Do not expand to broad non-executive career categories until transition-partner retention and unit economics are proven in two cohorts.

## MVP Scope (8-10 Weeks)

### Goal
Enable a partner firm to run a branded transition program for mixed seniority clients (executive + non-executive) using a shared operating cadence and measurable outcomes.

### In Scope
1. White-label tenant basics
- Custom logo, colors, and domain/subdomain.
- Partner-branded emails and weekly digest templates.
- Tenant-level role model: firm admin, coach/counselor, participant.

2. Program tracks (configuration, not forked product)
- Track A: Executive Transition.
- Track B: Professional Transition (manager/director/IC).
- Track-specific language, milestones, and templates.

3. Cohort operations
- Cohort dashboard with activation, momentum, stall risk, and intervention queue.
- Weekly operating report export for sponsor/internal review.

4. Coach/counselor workflow
- Session prep snapshot: what changed since last session.
- Action-plan to due-date loop with completion tracking.

5. Trust and governance pack
- Published data boundary statement, role permissions, and claims caveats.
- Audit log visibility for access and key workflow changes.

### Out of Scope (MVP)
- Deep ATS/HRIS integrations.
- Full enterprise SSO bundle beyond one standard SSO path.
- Highly custom per-client workflow logic.
- New AI model families or major brief-generation re-architecture.

### MVP Success Criteria
- 3 pilot partners launched.
- Participant 7-day activation >= 60%.
- 30-day weekly-loop completion >= 50%.
- Pilot-to-paid conversion >= 40%.
- At least 2 publishable case studies approved.

## Required Data Model Changes

1. Multi-tenant foundation
- Add tenant entity with branding, plan, and policy metadata.
- Hard tenant scoping for all participant, coach, and cohort records.

2. Program and track model
- Add program entity linked to tenant.
- Add program_track enum: executive_transition, professional_transition.
- Track-specific milestone templates and checklist states.

3. Role and access model
- Add tenant roles: firm_admin, counselor, participant, sponsor_viewer.
- Add permission matrix by role and data surface.

4. Cohort + outcomes schema
- Add cohort entity and participant-cohort membership.
- Add outcome events: activation_complete, session_prep_viewed, weekly_loop_complete, interview_stage_advance, offer_recorded.
- Add risk flags: stalled_14d, low_momentum, overdue_action.

5. Reporting objects
- Add weekly_snapshot table/materialized view keyed by tenant/cohort/week.
- Add export metadata (generated_by, generated_at, filters_used).

6. Audit and trust records
- Add audit_event for access, role changes, and report exports.
- Add claims_context field for externally shared KPI artifacts (directional vs validated).

## Pricing Matrix (White-Label)

Pricing principle:
- Platform fee + active participant seats, with governance/reporting depth increasing by tier.

| Tier | ICP | Base Platform Fee | Included Active Participants | Overage | Key Inclusions |
| --- | --- | --- | --- | --- | --- |
| Solo | 1 coach / small practice | $299/mo | 10 | $19 per active participant/mo | Branding lite, 1 track, weekly digest, core dashboard |
| Boutique | 3-20 coaches or transition team | $1,500/mo | 75 | $15 per active participant/mo | Full branding, 2 tracks, cohort dashboard, sponsor report export, priority support |
| Outplacement | Regional/national program operator | $5,000/mo | 300 | $10 per active participant/mo | Multi-cohort ops hub, governance pack, SLA reporting, executive readout templates |

Commercial notes:
- Annual prepay discount: 12%.
- Pilot option: 8-12 weeks at 50% base fee, then auto-convert to standard unless canceled.
- Optional add-ons: SSO hardening, CRM integration, dedicated CSM.

## Launch Plan

Weeks 1-2: tenant model + branding + role scaffolding.  
Weeks 3-4: track configuration + counselor workflow upgrades.  
Weeks 5-6: cohort reporting + weekly export + audit events.  
Weeks 7-8: pilot onboarding kit + trust pack + pricing packaging.  
Weeks 9-10: pilot hardening, case-study capture, conversion rollout.

## Risks and Mitigations

1. Risk: Segment sprawl from custom requests.
- Mitigation: strict configuration boundaries and no-custom pilot contract.

2. Risk: Weak trust confidence in procurement/legal review.
- Mitigation: publish trust artifacts and claims policy before scaled outreach.

3. Risk: Low counselor adoption.
- Mitigation: require week-1 workflow checkpoint and session-prep quick win metrics.
