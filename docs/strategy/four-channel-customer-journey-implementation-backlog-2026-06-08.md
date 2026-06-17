# Four-Channel Customer Journey Implementation Backlog

Date: 2026-06-08
Owner: Product + Growth + Engineering + Partnerships
Status: Ready for Jira ingestion
Horizon: 2 quarters

## Scope
Channels covered:
- Executives
- Coaches
- Outplacement partners
- Search firms

Journey stages covered:
- Discover
- Activate
- Adopt
- Expand
- Advocate

## KPI Target Framework (Per Channel)
Measurement windows:
- Activation: first 7 days
- Adoption: first 30 days
- Expansion: by day 60-90

### Executive KPI Targets
- Discover to signup conversion: +20% vs current baseline.
- Activation completion (first signal run + first prep brief + first outreach action): >= 55% in 7 days.
- 30-day retained active usage: >= 45%.
- Interview progression rate from active campaigns: +15% vs baseline.
- Offer decision confidence score capture rate: >= 70% of offer-stage users.

### Coach KPI Targets
- Partner lead to pilot start: >= 30%.
- Client activation within 7 days of invite: >= 60%.
- Clients completing weekly execution loop: >= 50% by day 30.
- Coach seat retention (90-day): >= 85%.
- Coach-attributed pipeline quality lift (interview progression): +12%.

### Outplacement KPI Targets
- Partner target to active pilot: >= 25%.
- Participant activation within 7 days: >= 65%.
- Time to first interview (median): -20% vs baseline cohort.
- Stalled campaign rate (14+ day inactivity): <= 20% of active participants.
- Program renewal readiness packet acceptance: >= 80%.

### Search Firm KPI Targets
- Firm intro to pilot kickoff: >= 25%.
- Candidate readiness passport completion: >= 70% of pilot candidates.
- Candidate first-round advancement rate: +15% vs baseline.
- Recruiter handoff completion within SLA: >= 90%.
- Mandate-fit reuse rate (assets reused across searches): >= 40%.

---

## WBS 1: Cross-Channel Foundation (Build Once, Reuse Everywhere)

Story 1.1: Decision Timeline Engine
- Description:
  - Create a timeline surface that shows next irreversible decision, blocked dependencies, confidence, and owner.
- Acceptance criteria:
  - Timeline visible in dashboard context for all 4 channel roles.
  - Each campaign has at least one required next-decision marker.
  - Stalled state triggers after 14 days with owner-level alert.
- KPI impact target:
  - Reduce stalled campaign rate by 20% across all active campaigns.

Story 1.2: Outcome Attribution Layer
- Description:
  - Implement event model and query pack linking signal -> prep -> outreach -> interview -> offer.
- Acceptance criteria:
  - Attribution view exists for user, admin, and partner summaries.
  - Weekly digest auto-generated with conversion leakage by stage.
  - At least 95% of core events are schema-valid and attributable.
- KPI impact target:
  - Increase measurable conversion coverage to >= 90% of active campaigns.

Story 1.3: Trust and Governance Console
- Description:
  - Provide source provenance, confidence banding, and AI-use disclosure for every recommendation and brief.
- Acceptance criteria:
  - Source and confidence visible on recommendation detail and evidence assets.
  - Governance summary page linked from channel landing pages and pricing.
  - Data lineage field present on all externally shared partner reports.
- KPI impact target:
  - Improve trial-to-paid conversion by +8% in trust-sensitive channels.

Story 1.4: Multi-Stakeholder Workspace
- Description:
  - Shared campaign context with role-scoped views for candidate, coach, outplacement operator, and recruiter.
- Acceptance criteria:
  - Same campaign can be viewed by at least 2 roles with role-appropriate data redaction.
  - Shared notes and action owners are tracked with audit log.
  - Permission model enforced for all role views.
- KPI impact target:
  - Improve weekly execution completion rate by +15% in partner-led channels.

---

## WBS 2: Executive Channel Backlog

Story 2.1: Role-Fit Simulator
- Description:
  - Simulate fit against top target role archetypes and identify narrative/evidence gaps.
- Acceptance criteria:
  - User can run simulator against at least 3 role archetypes.
  - Output includes top 5 fit gaps and action plan.
  - Re-run history is saved and trendable.
- KPI target:
  - Improve first-round interview conversion by +10% for simulator users.

Story 2.2: Interview Readiness Drill Loop
- Description:
  - Add board/C-suite mock drills with rubric scoring and objection heatmap.
- Acceptance criteria:
  - At least 3 scenario types (board, peer exec, recruiter screen).
  - Rubric score persisted per attempt.
  - Objection heatmap rendered and linked to prep actions.
- KPI target:
  - Increase readiness score by >= 12 points median after 2 drill cycles.

Story 2.3: Offer Decision Cockpit
- Description:
  - Build weighted tradeoff framework for compensation, mandate scope, sponsor map, and risk.
- Acceptance criteria:
  - Offer comparison supports at least 3 active offers.
  - User-defined weighting with saved presets.
  - Decision memo export generated in one click.
- KPI target:
  - >= 70% of offer-stage users complete a decision scorecard.

Story 2.4: Intelligence Search Watch Mode
- Description:
  - Confidential low-noise mode for seated executives with trigger thresholds and discreet cadence.
- Acceptance criteria:
  - Weekly digest mode and threshold controls available.
  - No daily task prompts unless threshold breach occurs.
  - Trigger events are logged and visible in timeline.
- KPI target:
  - Increase passive-user 30-day retention to >= 50%.

---

## WBS 3: Coach Channel Backlog

Story 3.1: Coach Command Center
- Description:
  - Portfolio-level view of client momentum, readiness, risk, and next intervention.
- Acceptance criteria:
  - Coach sees ranked intervention queue across all assigned clients.
  - Filter by stalled, low readiness, and overdue follow-up.
  - Weekly export available for coach operating review.
- KPI target:
  - Reduce client stall incidents by 25% in coach-managed cohorts.

Story 3.2: Session-to-Execution Bridge
- Description:
  - Convert session outcomes into dated actions and track completion before next session.
- Acceptance criteria:
  - Coach can create action plan during/after session in <= 3 minutes.
  - Client reminders fire automatically based on due date.
  - Completion status shown in next session prep view.
- KPI target:
  - >= 50% of coached clients complete weekly action loop by day 30.

Story 3.3: Coaching ROI Scorecard
- Description:
  - Show before/after deltas for prep quality, cadence adherence, and interview progression.
- Acceptance criteria:
  - Scorecard available per client and per coach portfolio.
  - Includes at least 4 core deltas and confidence intervals where possible.
  - Export-ready artifact for retention/renewal conversations.
- KPI target:
  - Improve coach renewal conversion by +10%.

Story 3.4: White-Label Weekly Digest
- Description:
  - Co-branded client progress digest with coach narrative section and next-step commitments.
- Acceptance criteria:
  - Branding and messaging can be customized per coach account.
  - Digest includes KPI trends, risks, and top 3 actions.
  - Digest send and open rates are tracked.
- KPI target:
  - Digest open rate >= 55%; coach retention >= 85%.

---

## WBS 4: Outplacement Channel Backlog

Story 4.1: Cohort Operations Hub
- Description:
  - Build cohort-level onboarding, readiness, and progression dashboard for outplacement teams.
- Acceptance criteria:
  - Program manager view supports cohort filters and benchmark comparison.
  - Participant activation, readiness, and stall metrics visible by cohort.
  - Drill-down to participant-level interventions.
- KPI target:
  - Participant activation >= 65% within 7 days.

Story 4.2: SLA and Compliance Layer
- Description:
  - Add SLA tracking for counselor response, checkpoint completion, and quality thresholds.
- Acceptance criteria:
  - SLA breaches trigger operator alerts.
  - Compliance summary included in monthly program report.
  - Audit history retained for all SLA events.
- KPI target:
  - >= 90% counselor checkpoint SLA compliance.

Story 4.3: Employer-Facing Impact Packet
- Description:
  - Auto-generate enterprise-ready impact packet with cohort outcomes and confidence notes.
- Acceptance criteria:
  - Packet includes KPI trend charts and intervention narrative.
  - One-click export to PDF and share link.
  - Packet schema aligns with renewal decision template.
- KPI target:
  - Renewal packet acceptance >= 80%.

Story 4.4: Risk Segmentation Engine
- Description:
  - Classify participants into risk segments and prescribe intervention playbooks.
- Acceptance criteria:
  - Risk model produces low/medium/high categories with rationale.
  - Intervention recommendation shown for high-risk participants.
  - Weekly risk movement report generated.
- KPI target:
  - Reduce high-risk segment by 20% over 60 days.

---

## WBS 5: Search Firm Channel Backlog

Story 5.1: Candidate Readiness Passport
- Description:
  - Standardized candidate quality packet for recruiter handoff and client presentation.
- Acceptance criteria:
  - Passport includes narrative thesis, prep score, sponsor map, and risk flags.
  - Export and share workflow supports internal recruiter collaboration.
  - Version history preserved.
- KPI target:
  - Passport completion for >= 70% of pilot candidates.

Story 5.2: Mandate-Match Radar
- Description:
  - Match active candidates against mandate profiles by fit, urgency, and trajectory.
- Acceptance criteria:
  - Recruiter can filter by role, sector, geography, and mandate urgency.
  - Radar ranks top matches with explainability fields.
  - Match actions logged for later attribution.
- KPI target:
  - Increase qualified shortlist creation speed by 20%.

Story 5.3: Shortlist Quality Predictor
- Description:
  - Predict candidate advancement probability prior to first formal round.
- Acceptance criteria:
  - Predictor outputs score + top contributors + confidence band.
  - Calibration review job runs weekly.
  - False-positive/false-negative metrics visible to admins.
- KPI target:
  - Improve first-round advancement rate by +15%.

Story 5.4: Recruiter Collaboration Layer
- Description:
  - Shared notes, objection tracking, and SLA handoff workflow between candidate and recruiter stakeholders.
- Acceptance criteria:
  - Handoff checklist is required before candidate submission.
  - Objections and responses tracked with owner and due date.
  - SLA compliance visible in admin and partner reports.
- KPI target:
  - Handoff SLA completion >= 90%.

---

## Delivery Plan (Now / Next / Later)

Now (next 30 days)
- 1.1 Decision Timeline Engine
- 1.2 Outcome Attribution Layer (schema + initial cards)
- 2.1 Role-Fit Simulator
- 3.1 Coach Command Center
- 4.1 Cohort Operations Hub
- 5.1 Candidate Readiness Passport

Next (days 31-60)
- 1.3 Trust and Governance Console
- 2.2 Interview Readiness Drill Loop
- 3.2 Session-to-Execution Bridge
- 4.2 SLA and Compliance Layer
- 5.2 Mandate-Match Radar

Later (days 61-90)
- 1.4 Multi-Stakeholder Workspace
- 2.3 Offer Decision Cockpit
- 2.4 Intelligence Search Watch Mode
- 3.3 Coaching ROI Scorecard
- 3.4 White-Label Weekly Digest
- 4.3 Employer-Facing Impact Packet
- 4.4 Risk Segmentation Engine
- 5.3 Shortlist Quality Predictor
- 5.4 Recruiter Collaboration Layer

## Definition of Done (All Stories)
- Feature behind entitlement-aware access control.
- Events logged with documented schema.
- Admin/reporting visibility for the new metric.
- Channel-specific UX rubric checks pass.
- KPI baseline and target added to weekly operating artifact.
