# Action Checklist: EMI Sprint 6 + Luxury-Modern Phase 0 (This Week)

**Last updated:** 2026-07-11  
**Prepared by:** Founder Office  
**Next review:** 2026-07-15 EOD

---

## TODAY (Fri 2026-07-11)

### ✅ Communications & Alignment
- [ ] **Rich:** Send calendar invite for EMI-503 sync with Chris (30min, target Fri 2026-07-12 at 2pm)
- [ ] **Product Lead:** Send calendar invite for design direction kickoff (60min, today @ 3pm)
- [ ] **Engineering Lead:** Check metrics access — test prod dashboard login by EOD
- [ ] **Design Lead:** Pull current Figma file and share read-only link with team
- [ ] **All leads:** Read and confirm receipt of dual-workstream summary doc (this file + the two detailed specs)

### ✅ EMI-501 (GTM Prep)
- [ ] **Chris (GTM Lead):** Pull current conversion funnel data from GA4 (identify top bounce/exit points)
- [ ] **Chris:** Identify top 3-5 objections from recent sales calls + support tickets
- [ ] **Product Lead:** Prepare 3 pages for objection deep-dive (list current messaging that failed for each)

### ✅ EMI-502 (Engineering Prep)
- [ ] **Engineering Lead:** Pull 30-day production metrics for these flows:
  - Assessment completion (start time → submit time → result delivery time)
  - Daily loop delivery (trigger time → email send time → open time → action time)
  - Digest compilation (data fetch time → render time → send time)
- [ ] **Engineering Lead:** Capture P50, P95, P99 latencies + error rates for each
- [ ] **Engineering Lead:** Set up Sentry/Datadog workspace if not already done for EMI infrastructure

### ✅ Luxury-Modern Design System (Prep)
- [ ] **Design Lead:** Create Figma board titled "LUX-001 Design System v1"
- [ ] **Design Lead:** Upload current design token audit (colors, typography, spacing from current site)
- [ ] **Design Lead:** Screenshot 3 benchmark systems (Atlassian, Notion, Lucid) for reference on luxury/modern feel
- [ ] **Design Lead:** Share Figma link in #design Slack channel

### ✅ Luxury-Modern Metrics (Prep)
- [ ] **Analytics Lead:** Verify GA4 project has access to Starting Monday data
- [ ] **Analytics Lead:** Create GA4 report for current state: entry pages (home, /for-executives, /for-coaches, /for-outplacement, /for-search-firms)
- [ ] **Analytics Lead:** Metrics to capture: entry users, bounce rate, avg session duration, scroll depth to 50%/75%, CTA click rate
- [ ] **Analytics Lead:** Share GA4 link with Product + Growth team

### ✅ Documentation
- [ ] **PMO:** Create shared docs folder `/docs/emi/` if not exists
- [ ] **PMO:** Create shared docs folder `/docs/lux/` if not exists
- [ ] **PMO:** Post links to #product, #engineering, #design Slack channels

---

## MONDAY (2026-07-15)

### ✅ EMI-501: Objection Tuning
- [ ] **Chris (GTM Lead):** Draft document: "Top-10 Objections & Current Messaging Analysis"
  - Format: Objection | Current page/copy | Why it failed | Proposed revision
  - Complete: At least 3 objections fully documented
- [ ] **Chris:** Schedule 30-min review with Product Lead
- [ ] **Product:** Add proposed changes to `/docs/emi/objection-cure-scripts-draft-2026-07-15.md`

### ✅ EMI-502: SLO Definition
- [ ] **Engineering Lead:** Document baseline metrics in `/docs/emi/baseline-metrics-2026-07-15.md`
- [ ] **Engineering Lead:** Draft SLO targets for each flow (availability %, latency P99)
- [ ] **Engineering Lead:** Identify monitoring gaps (e.g., "email delivery SLA" needs third-party tracking)

### ✅ EMI-503: Operating Cadence
- [ ] **Rich + Chris:** Complete 30-min sync (outcome: Q4 cadence, owners, scorecard metrics)
- [ ] **Rich:** Document decision in `/docs/emi/q4-operating-cadence-2026-07-15.md`
- [ ] **Rich:** Assign owners for weekly metrics (signal, objection, conversion, churn)

### ✅ Luxury-Modern Design System
- [ ] **Design Lead:** Post token draft to Figma: "LUX Design System Tokens v1"
  - Include: Color palette (6-8 shades), typography scale, spacing, motion easing
  - Include: Reference images from benchmarks (Atlassian, Notion)
- [ ] **Design Lead:** Schedule 30-min team review (Tue 2026-07-16)

### ✅ Luxury-Modern Copy & Headlines
- [ ] **Product Lead:** Draft 5 hero headlines (one per page) using template: Authority + Mechanism + Outcome
  - Homepage
  - /for-executives
  - /for-coaches
  - /for-outplacement
  - /for-search-firms
- [ ] **Product Lead:** Post draft to #product Slack with note: "Headlines for team feedback by Wed EOD"

### ✅ Luxury-Modern Metrics Baseline
- [ ] **Analytics Lead:** Create GA4 custom event taxonomy:
  - `page_view_emi_phase1` (tag all Phase 1 page views)
  - `cta_click` (tag all CTA clicks with attributes: `cta_type`, `cta_placement`, `source_page`)
  - `scroll_depth` (track 50%, 75%, 100% events)
- [ ] **Analytics Lead:** Deploy GA4 event tags to test version of 2 pages (homepage + /for-executives)
- [ ] **Analytics Lead:** Verify events firing in GA4 real-time by EOD

---

## WEDNESDAY (2026-07-17)

### ✅ EMI-501: Objection Scripts — Final Draft
- [ ] **Chris (GTM Lead):** Complete all 10 objections with revised messaging
- [ ] **Chris:** Prepare 2-slide deck: "Top-10 Objection Cures" for Friday review
- [ ] **Chris:** Share in #emi-sprint-6 Slack channel

### ✅ EMI-502: SLOs — Final Definition
- [ ] **Engineering Lead:** Draft Sentry/Datadog alert rules for each SLO threshold
- [ ] **Engineering Lead:** Test alerts in staging (trigger fake failures, confirm Slack notifications)
- [ ] **Engineering Lead:** Document in `/docs/emi/slo-monitoring-rules-2026-07-17.md`

### ✅ Luxury-Modern Design System — v1 Complete
- [ ] **Design Lead:** Finalize token set in Figma (colors, typography, spacing, motion ready for engineering)
- [ ] **Design Lead:** Create 5 component specs: HeroBlock, TrustRail, EvidencePanel, CTARail, ProofCard
- [ ] **Design Lead:** Post design review slides to #design (Thursday kickoff at 10am)

### ✅ Luxury-Modern Headlines — Team Review
- [ ] **Product Lead:** Consolidate headline feedback from #product Slack
- [ ] **Product Lead:** If consensus on 3+ headlines → lock them; otherwise schedule 15-min breakout
- [ ] **Product Lead:** Target: 5 approved headlines by EOD Thursday

### ✅ Luxury-Modern GA4 — Live on Production
- [ ] **Analytics Lead:** Deploy GA4 event tags to all 5 Phase 1 pages (production code)
- [ ] **Analytics Lead:** Verify real data flowing into GA4 by monitoring test visits
- [ ] **Analytics Lead:** Create baseline dashboard (screenshot current state of entry pages)
- [ ] **Analytics Lead:** Share baseline dashboard screenshot in #analytics

---

## THURSDAY (2026-07-18)

### ✅ EMI-501/502/503 Reviews
- [ ] **Rich:** Host 1-hour review meeting: Objections + SLOs + Cadence
  - Review: Top-10 objection scripts + confidence scores
  - Review: SLO targets + monitoring setup
  - Review: Q4 cadence + owner assignments
- [ ] **Rich:** Decision point: Are we ready to lock these (yes/no/minor revisions)?
- [ ] **All:** Document outcomes in `/docs/emi/sprint-6-review-2026-07-18.md`

### ✅ EMI-504 Capstone Report — Draft
- [ ] **PMO:** Gather all epic success criteria (from original EMI launch brief)
- [ ] **PMO:** Score each criterion (met/partial/miss) with evidence
- [ ] **PMO:** Draft remediation plan (3-5 gaps + proposed fixes + owners + timeline)
- [ ] **PMO:** Post draft to #emi-sprint-6 for feedback

### ✅ Luxury-Modern Design System — Ready for Engineering
- [ ] **Design Lead:** Finalize all 5 component Figma specs
- [ ] **Design Lead:** Create "Component Handoff" doc with:
  - Component name + purpose
  - Figma link
  - Props/variations
  - Usage guidelines (when to use each)
- [ ] **Design Lead:** Share with Engineering Lead

### ✅ Luxury-Modern Figma Redesigns — 50% Draft
- [ ] **Design Lead:** Post 50% draft of 5 page redesigns to Figma
  - Include: Hero section layout for all 5 pages
  - Include: TrustRail placement on all 5 pages
  - Include: Proof/Evidence section on all 5 pages
- [ ] **Design Lead:** Add notes on each: "Desktop final by Tue 2026-07-23"

### ✅ Luxury-Modern Copy Modules — Final
- [ ] **Product + Growth:** Lock proof-first copy templates for all 5 pages
- [ ] **Product:** Document copy spec per page in `/docs/lux/copy-specs-by-page-2026-07-18.md`
- [ ] **Product:** Share with Design team (Monday integration)

---

## FRIDAY (2026-07-19)

### ✅ EMI Sprint 6 Go/No-Go Decision
- [ ] **Rich + Chris:** Final 30-min sync: Are all 4 tickets complete and approved? (EMI-501/502/503/504)
- [ ] **Decision:** Go/No-Go for Q4 deployment
  - **Go:** All tickets approved, remediation plan locked, Q4 roadmap published
  - **No-Go:** Identify which items need 1-week extension, resched decision for 2026-07-26
- [ ] **Rich:** Post decision + Q4 roadmap to #emi-sprint-6 Slack
- [ ] **PMO:** Create Jira tickets for all remediation items (due dates in Aug/Sept/Oct)

### ✅ Luxury-Modern Phase 0 — 80% Complete
- [ ] **Design Lead:** All 5 pages have hero + trust + proof layout complete (desktop mock)
- [ ] **Analytics Lead:** Success dashboard live in GA4 (linked in #analytics)
- [ ] **Product Lead:** All copy specs finalized and approved
- [ ] **Engineering Lead:** All 5 premium components have skeleton code ready (React + Tailwind)

### ✅ Weekly Standup Summary
- [ ] **Product Lead:** Post to #product: "EMI Sprint 6 Status + Luxury-Modern Phase 0 Progress"
  - Highlight: What shipped, what's on track, what needs attention next week
  - Include: Timeline for Phase 0 completion (next Friday 2026-07-25)

### ✅ Next Week Prep
- [ ] **Design Lead:** Schedule Monday design team sync (review Figma designs, align on mobile)
- [ ] **Engineering Lead:** Prepare Monday engineering sync (component build assignments)
- [ ] **Product Lead:** Prepare Monday all-hands brief (where we are, what happens Mon 2026-07-26)

---

## Key Blockers to Watch

| Blocker | Symptom | Owner | Escalation |
|---------|---------|-------|-----------|
| Metrics inaccessible | Engineering can't run SLO analysis by Mon | Engineering Lead | → Rich |
| Figma delays | Design can't share token/component mocks by Wed | Design Lead | → Product Lead |
| GA4 events broken | Analytics sees no Phase 1 tags in production by Fri | Analytics Lead | → Engineering Lead |
| Copy consensus fails | Headlines not approved by Thu | Product Lead | → Rich |
| EMI cadence unresolved | Chris unavailable for 503 sync | Chris | → Rich |

**If ANY blocker not resolved by EOD the stated day → escalate to Rich immediately.**

---

## Success Indicators (EOW 2026-07-19)

### ✅ EMI
- [ ] All 4 tickets complete and documented
- [ ] Q4 go/no-go decision made publicly
- [ ] Remediation tickets created in Jira

### ✅ Luxury-Modern
- [ ] All 5 premium components have React skeleton (not full-featured, but structure ready)
- [ ] All 5 page redesigns at 50% Figma draft (hero + trust + proof sections)
- [ ] All copy specs locked
- [ ] GA4 instrumentation live and reporting real data
- [ ] Baseline metrics captured for all 7 KPIs

### ✅ Readiness for Phase 1 (Mon 2026-07-26)
- [ ] Leadership sign-off on design direction
- [ ] Leadership sign-off on copy principles
- [ ] Metrics baseline confirmed
- [ ] Engineering sprint plan for Phase 1 drafted (component build + page integration timeline)

---

## Owners & Contact Info

| Role | Name/Team | Slack | Availability |
|------|-----------|-------|--------------|
| **Founder Office** | Rich | @rich | 2026-07-12 2pm EMI-503 sync |
| **GTM Lead** | Chris | @chris | Mon 2026-07-15 for objections review |
| **Product Lead** | [Name] | @[name] | Daily in #product |
| **Design Lead** | [Name] | @[name] | Today 3pm kickoff |
| **Engineering Lead** | [Name] | @[name] | EOD today metrics check |
| **Analytics Lead** | [Name] | @[name] | Mon 2026-07-15 for GA4 review |
| **PMO** | [Name] | @[name] | Tue 2026-07-16 for capstone |

**Questions? Post in #product or escalate to Rich.**

---

## Files to Track

- `/docs/emi-sprint-6-wrap-up-2026-07-11.md` — Detailed EMI work tracker
- `/docs/luxury-modern-phase-0-kickoff-2026-07-11.md` — Detailed Luxury-Modern spec
- `/docs/dual-workstream-executive-summary-2026-07-11.md` — This executive brief
- `/docs/emi/` — EMI working docs folder
- `/docs/lux/` — Luxury-Modern working docs folder

All docs linked in Slack channel pins: #product, #emi-sprint-6, #design, #engineering.
