# Blameless Postmortem Template

Last updated: 2026-05-18

Reference: [Incident Severity Policy](./incident-severity-policy.md) | [On-Call Rotation](./on-call-rotation.md)

---

## About This Template

**Who fills this out:** The incident commander or on-call primary, with input from anyone involved.
**When:** Due within 72 hours of Sev-1 resolution; within 1 week for Sev-2.
**Process:** Draft in a shared doc, review in the weekly reliability review meeting, then archive here.
**Principle:** This document is about systems, processes, and tooling — not individual blame.
Phrases like "engineer X forgot to..." are not acceptable. Reframe as "the process did not prevent...".

---

## Postmortem: [Short Incident Title]

**Incident ID:** INC-YYYY-MM-DD-N (e.g. INC-2026-05-20-1)
**Severity:** Sev-1 / Sev-2
**Status:** Draft / In Review / Final
**Author:** [name]
**Reviewers:** [names]
**Reviewed at:** [date, weekly reliability review]

---

### 1. Executive Summary

> One paragraph. What happened, how long it lasted, what the impact was, what fixed it.
> Written for a non-technical reader.

**Example:** _"On [date] at [time], users were unable to log in for 23 minutes due to an invalid
Supabase connection string deployed to production. The issue was detected by automated synthetic
monitoring, mitigated by rolling back the environment variable, and resolved with no data loss."_

---

### 2. Impact

| Dimension | Value |
|---|---|
| Duration | HH:MM (start → end UTC) |
| Affected users | Estimated count or % of active users |
| Affected workflows | e.g. Login, Dashboard, Feedback submission |
| Data impact | None / Delayed / Corrupted (describe) |
| Revenue impact | None / Estimated $X in blocked checkouts |
| SLO impact | P0 availability: X% for the window (target 99.95%) |

---

### 3. Timeline (UTC)

| Time | Event |
|---|---|
| HH:MM | Triggering change deployed (if known) |
| HH:MM | First user-visible impact |
| HH:MM | First automated alert fired |
| HH:MM | Primary on-call acknowledged |
| HH:MM | Incident commander assigned |
| HH:MM | Root cause identified |
| HH:MM | Mitigation started |
| HH:MM | User-visible recovery confirmed |
| HH:MM | Monitoring confirmed stable (no recurrence) |

---

### 4. Root Cause Analysis

#### What happened (technical)

> Describe the chain of events from the triggering change to the user-visible failure.
> Focus on the system — what was the gap in safeguards that allowed this to reach production?

#### The five whys (optional, for complex incidents)

1. Why did [symptom] occur? → Because [cause 1].
2. Why did [cause 1] occur? → Because [cause 2].
3. Why did [cause 2] occur? → Because [cause 3].
4. ...
5. Root cause: [systemic gap]

---

### 5. What Went Well

> List at least 3 things that worked correctly. Reinforcing good practices is as important
> as fixing gaps.

- [ ] Alert fired within SLO target
- [ ] Runbook steps were accurate and led directly to the fix
- [ ] Rollback was completed without additional downtime
- [ ] Communication in `#prod-alerts` was clear and timely

---

### 6. What Went Poorly

> List gaps in detection, runbooks, communication, or safeguards. Use system framing.

- [ ] Detection latency was X min (target: Y min) — why?
- [ ] Runbook step Z was missing or inaccurate
- [ ] Alert was too noisy / too quiet
- [ ] Post-deploy gate did not catch the issue — why?

---

### 7. Action Items

Action items must be:
- **Specific:** A single task that can be completed and verified.
- **Owned:** One named person responsible.
- **Time-bound:** Due date (max 2 weeks for Sev-1 items, 4 weeks for Sev-2).

| Action | Owner | Due | Priority | Status |
|---|---|---|---|---|
| [Add missing alert for X] | @engineer | 2026-06-01 | P1 | Open |
| [Fix runbook step Z to include Y] | @engineer | 2026-06-03 | P2 | Open |
| [Add pre-deploy check for config validation] | @engineer | 2026-06-07 | P1 | Open |

**Action item SLA:**
- Sev-1 items: all P1 actions must be closed within 2 weeks.
- Sev-2 items: all P1 actions must be closed within 4 weeks.
- Overdue items are escalation triggers in the weekly reliability review.

---

### 8. Lessons Learned

> 2–4 concise takeaways that should influence how the team operates going forward.
> These feed the reliability audit checklist and game day playbooks.

1.
2.
3.

---

### 9. Monitoring This Won't Happen Again

> What specific check, alert, or test was added (or confirmed to exist) that will detect
> this class of failure faster or prevent it from reaching production?

| New safeguard | Type (alert / test / runbook update / deploy gate) | Owner | Added date |
|---|---|---|---|
| | | | |

---

## Monthly Postmortem Review

**Schedule:** First Monday of each month, 15-minute agenda item in the engineering sync.
**Purpose:** Review all postmortems since last review; confirm action items are on track.
**Owner:** Engineering lead / on-call rotation lead.

### Review Checklist

- [ ] All postmortems from the past month have been moved to "Final" status
- [ ] All overdue P1 action items have been escalated or re-prioritized
- [ ] Lessons learned have been incorporated into relevant runbooks
- [ ] Recurring failure patterns have been identified and added to game day playbooks
- [ ] Reliability audit checklist (reliability-audit-checklist.md) reflects any new safeguards

---

## Postmortem Archive Index

| ID | Date | Title | Severity | Status |
|---|---|---|---|---|
| INC-YYYY-MM-DD-N | | | | |
