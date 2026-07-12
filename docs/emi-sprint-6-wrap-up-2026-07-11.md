# EMI Sprint 6 Wrap-Up & Capstone (2026-07-11)

**Status:** In Execution  
**Owner:** Founder Office + GTM + Engineering + PMO  
**Target completion:** 2026-07-18  
**Escalation:** Rich (Founder Office)

---

## Sprint 6 Goal
Lock EMI system for Q4 execution with finalized SLOs, objection cure scripts, operating cadence, and remediation plan.

---

## Ticket Breakdown & Status

### EMI-501: Tune Top-10 Objection Conversion Gaps
**Owner:** GTM Lead  
**Due:** 2026-07-14  
**Input needed from:** Product, customer data, sales scripts

**Tasks:**
- [ ] Pull top-10 objections from current conversion funnel data (source: /dashboard/admin/signals or Supabase conversion events)
- [ ] Correlate objections with page bounce/exit points
- [ ] Extract current messaging that failed to overcome each objection
- [ ] Draft revised headline/value prop for each objection class
- [ ] A/B test specs for next sprint (flag behind EMI-AB-001)
- [ ] Publish scripts and page revision brief to `/docs/emi/objection-cure-scripts-2026-q4.md`

**Success criteria:**
- 10 objections documented with page source and current copy
- Revised messaging for each with confidence score (estimated LTV lift)
- Script pack ready for sales team deployment

**Blockers:** None identified

---

### EMI-502: Finalize EMI SLOs for Critical Flows
**Owner:** Engineering + Observability  
**Due:** 2026-07-15  
**Input needed from:** Product (flow definitions), Analytics (baseline metrics)

**Tasks:**
- [ ] Define three critical flows for SLO:
  - Flow 1: Assessment completion (start → submit → results)
  - Flow 2: Daily loop delivery (trigger → email send → open → action)
  - Flow 3: Digest compilation (data fetch → render → send)
- [ ] Pull 30-day baseline metrics for each flow:
  - P50, P95, P99 latency
  - Error rate and timeout frequency
  - Success rate (end-to-end completion)
- [ ] Set SLO targets with risk tolerance:
  - Assessment flow: 99.5% availability, P99 < 3s
  - Daily loop: 99.9% availability, email delivery SLA
  - Digest: 99.0% availability, <5m compilation time
- [ ] Create Sentry/datadog alert rules for each SLO
- [ ] Document SLO register in `/docs/emi/slos-and-gates-2026.md`
- [ ] Add SLO checks to pre-deploy gate

**Success criteria:**
- All three flows have documented SLOs with monitoring
- Alerts firing correctly in staging
- SLO targets approved by leadership

**Blockers:** Need access to production metrics dashboard

---

### EMI-503: Finalize Q4 Operating Cadence
**Owner:** Founder Office + PMO  
**Due:** 2026-07-16  
**Input needed from:** All workstream leads (Product, Engineering, GTM, Finance)

**Tasks:**
- [ ] Create owner map for EMI operation:
  - Weekly signal review (Product lead)
  - Weekly objection triage (GTM lead)
  - Bi-weekly KPI steering (Founder Office)
  - Monthly vendor/compliance review (Ops)
- [ ] Set meeting cadence:
  - Weekly 30m: Signal quality & objection review
  - Bi-weekly 60m: Conversion and revenue performance
  - Monthly 60m: Executive steering & Q1 planning
- [ ] Define scorecard metrics (what we measure weekly):
  - Assessment starts / day
  - Assessment completion rate
  - Objection categories (by page, by segment)
  - Conversion rate (trial to paid)
  - NPS and churn by cohort
- [ ] Assign owner for each metric and refresh cadence
- [ ] Create scorecard template and Slack automation
- [ ] Publish calendar and roles doc

**Success criteria:**
- Owner map signed off by all leads
- Calendar locked in
- Scorecard template live and first report produced
- Q4 responsibilities clear

**Blockers:** Need Chris (GTM) and Rich (Founder) alignment on weekly cadence

---

### EMI-504: Publish Capstone Report & Remediation Plan
**Owner:** PMO + Founder Office  
**Due:** 2026-07-18  
**Input needed from:** All workstream results (EMI-501/502/503 above)

**Tasks:**
- [ ] Gather all epic success criteria from original brief (5 criteria)
- [ ] Score actual achievement for each:
  - Criterion 1: [description] → Status (met/partial/miss) → Evidence
  - Criterion 2: [description] → Status → Evidence
  - Criterion 3: [description] → Status → Evidence
  - Criterion 4: [description] → Status → Evidence
  - Criterion 5: [description] → Status → Evidence
- [ ] Document wins, misses, and key learning
- [ ] Identify gaps requiring remediation in Q4:
  - Missing signals or journeys
  - Weak objection handling
  - Underperforming segments
- [ ] Create 4-week remediation plan with owners and dates
- [ ] Publish capstone report to `/docs/emi/capstone-report-2026-07-18.md`
- [ ] Create next-sprint tickets for remediation work
- [ ] Present findings to leadership

**Success criteria:**
- All 5 epic criteria scored with evidence
- Remediation plan has 3-5 high-priority gaps with fixes
- Q4 roadmap updated with learnings
- Report shared with stakeholders

**Blockers:** Need final metrics from production analytics

---

## Weekly Standup Template (For Tracking)

**Week of 2026-07-11:**
- EMI-501: [ ] Draft → In review (scope: 3 objections done, 7 in progress)
- EMI-502: [ ] Analysis → In progress (waiting on metrics access)
- EMI-503: [ ] Planning → Not started (waiting for Chris/Rich sync)
- EMI-504: [ ] Blocked (waiting on 501-503 outputs)

---

## Remediation Ticket Template

Once capstone report is done, create Jira tickets for each gap:

```
Title: EMI-Q4-[gap-name]
Owner: [Owner]
Size: [S/M/L]
Due: [Date in Q4]
Success Criteria:
- [Measurable outcome]
- [Conversion/KPI impact]
Blocking ticket: EMI-504 (capstone)
```

---

## Go/No-Go Criteria (For Q4 Deployment)

EMI is ready for Q4 execution if ALL of the following are met:

- [ ] SLOs defined and monitoring live
- [ ] Top-10 objection scripts finalized
- [ ] Weekly operating cadence established with clear owners
- [ ] Success metrics all >= "partial" (no "miss" criteria)
- [ ] Remediation plan prioritized and ticketed
- [ ] Leadership sign-off on Q4 roadmap

**Go/No-Go Decision Authority:** Rich (Founder Office) + Chris (GTM)  
**Target Decision Date:** 2026-07-19

---

## Next Steps (Immediately)

1. **Today (2026-07-11):** Schedule 30m sync with Chris (GTM) and Rich (Founder) to align on EMI-503 cadence
2. **By EOD Friday (2026-07-12):** Engineering to provide production metrics access for EMI-502
3. **Monday (2026-07-15):** First draft of EMI-501 objection tuning ready for review
4. **By EOD Wed (2026-07-17):** All three tickets in "ready for review" state
5. **By EOD Thu (2026-07-18):** EMI-504 capstone report published and go/no-go decision made
