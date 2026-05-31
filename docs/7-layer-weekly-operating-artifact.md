# 7-Layer Weekly Operating Artifact

Owner: Product Lead (Lane A)
Cadence: Weekly (45 minutes)
Applies to: All in-flight and release-candidate product changes

## Weekly Run Order

1. Review changes entering Gate 0 to Gate 2 (new work).
2. Review release-candidate changes at Gate 3 to Gate 5.
3. Score 7-layer coverage and trust impact.
4. Record pass/fail/hold decisions and required remediation.
5. Confirm owners, dates, and follow-up checks.

---

## A) Gate Checklist (Run Every Week)

Use one row per change item.

| Change ID | Change Name | Gate 0 Intake | Gate 1 Design | Gate 2 Build | Gate 3 Data | Gate 4 Trust | Gate 5 Outcome | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EX-001 | Example feature | [ ] 7-layer declaration complete + DRI named | [ ] State acknowledged before action in critical flow | [ ] Provenance/confidence/accountability controls implemented | [ ] KPI events + dashboard live before launch | [ ] Confidentiality/permissions impact reviewed | [ ] 30-day outcome readout scheduled or complete | Pass / Fail / Hold |

Gate criteria reference:

- Gate 0: Primary layer, secondary layers, user state, decision-risk statement, trust impact, KPI hypothesis, DRI.
- Gate 1: Emotional containment and decision-cockpit copy in key flow.
- Gate 2: Confidence/provenance/human-owner controls in product behavior.
- Gate 3: Instrumentation and dashboard coverage active.
- Gate 4: Sensitive-path confidentiality controls and permission review complete.
- Gate 5: Post-launch confidence/trust/decision metrics reviewed.

Hard rule: Any unchecked required gate item is an automatic Fail.

---

## B) 7-Layer Scorecard Template (Per Change)

Scoring scale:

- 0 = No contribution or introduces regression risk
- 1 = Partial contribution
- 2 = Strong contribution and measurable behavior change

| Change ID | Primary Layer | Secondary Layer 1 | Secondary Layer 2 | Surface | Sensory | Choreography | Anticipation | Infrastructure | Memory | Identity | Trust Impact | KPI Link | Ship Threshold Met |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EX-001 | Choreography | Infrastructure | Identity | 1 | 1 | 2 | 1 | 1 | 0 | 1 | Positive | kpi_decision_confidence | Yes/No |

Ship thresholds:

1. Primary layer score must be 2.
2. At least two additional layers must score at least 1.
3. Infrastructure and Identity cannot be 0 on high-stakes flows.
4. Trust impact must be non-negative.

---

## C) Decision Log Template (Pass / Fail / Hold)

Record every reviewed item.

| Date | Change ID | Decision | Why | Owner | Due Date | Recheck Date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-29 | EX-001 | Hold | Missing Gate 3 dashboard coverage | Lane C Data | 2026-06-02 | 2026-06-03 | Add KPI event + dashboard panel |

Decision definitions:

- Pass: All gate checks and thresholds met.
- Fail: Required checks not met; cannot ship.
- Hold: Not ready to ship; remediation in progress.

Escalation rules:

- Two consecutive weekly Holds on same item -> escalation to Product + Engineering leads.
- Any trust regression on sensitive path -> immediate Fail until corrected.
- No owner or due date on Fail/Hold -> automatic governance violation.

---

## D) Weekly Meeting Script (10 Minutes)

1. What changed this week by gate status?
2. Which items are failing trust, identity, or instrumentation requirements?
3. Which items are passing but weak on secondary layers?
4. What must be fixed before next release cut?
5. Who owns each remediation and by when?

---

## E) Definition of Weekly Completion

The weekly run is complete only when:

1. All reviewed changes have gate status updated.
2. All reviewed changes have a 7-layer scorecard row.
3. Every Fail/Hold has owner + due date + recheck date.
4. Dashboard and decision log links are attached to meeting notes.
