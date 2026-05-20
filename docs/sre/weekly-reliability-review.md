# Weekly Reliability Review

Cadence: Every Monday 10:00-10:30 local time
Facilitator: Rotating (see on-call rotation in docs/sre/on-call-rotation.md)
Owner rotation: Engineering lead sets agenda; SRE owner presents metrics

---

## Meeting Agenda (30 minutes)

1. SLO Attainment scorecard (5 min)
2. Error-budget status and burn rate (5 min)
3. Incident review (5 min)
4. Alert quality review (5 min)
5. Synthetic and deploy gate health (5 min)
6. Action items from prior week (5 min)

---

## Scorecard Template

Copy this block into your meeting notes and fill it in before the meeting.

```
Date: [YYYY-MM-DD]
Facilitator: [name]
Period: [Monday-to-Sunday dates]

### SLO Attainment

| Tier | Availability | Target  | Met? | p95 Latency | Target  | Met? |
|------|-------------|---------|------|-------------|---------|------|
| P0   | ?.????%     | 99.95%  |      | ???ms       | 1200ms  |      |
| P1   | ?.????%     | 99.90%  |      | ???ms       | 2000ms  |      |
| P2   | ?.????%     | 99.50%  |      | ???ms       | 4000ms  |      |

How to get these numbers:
  - Run: npm run slo:report:json (pipe from Railway log export)
  - Or: check Sentry Performance > P0 Routes dashboard
  - Or: GitHub Actions > Weekly SLO Report workflow summary

### Error Budget

| Tier | Budget Used This Week | Budget Remaining (30d) | Burn Rate |
|------|-----------------------|------------------------|-----------|
| P0   | ?%                    | ?%                     | ?x        |
| P1   | ?%                    | ?%                     | ?x        |

### Incidents This Week

| Severity | Short Description | Duration | Status    | Postmortem Due |
|----------|-------------------|----------|-----------|----------------|
|          |                   |          |           |                |

No incidents: [ ]

### Alert Quality

- Alerts that fired this week: [list]
- Alerts that were false positives: [list]
- Noise ratio: [N false / N total]
- Alerts to tune or retire: [list]

### Synthetic and Deploy Gate Health

- Synthetic pass rate (7d): ?%
- Deploy gate failures this week: [N]
- Blocked deploys resolved: [describe]
- Synthetic tests added or updated: [describe]

### Action Items Carried From Last Week

| ID | Action | Owner | Due | Status |
|----|--------|-------|-----|--------|
|    |        |       |     |        |

### New Action Items

| ID | Action | Owner | Due |
|----|--------|-------|-----|
|    |        |       |     |
```

---

## Owner Rotation

Rotate facilitator weekly. Owner rotation:

1. Week 1: Engineering lead facilitates, SRE owner presents metrics
2. Week 2: SRE owner facilitates, Backend engineer presents metrics
3. Week 3: Backend engineer facilitates, Engineering lead presents metrics
4. Week 4: Repeat from Week 1

---

## Escalation Triggers

If any of the following are true, escalate the finding to a standing incident or CEO/board communication:

1. P0 SLO attainment < 99.5% for the week (50% of monthly budget consumed in one week)
2. Any Sev-1 incident that lasted > 1 hour
3. Fast-burn rate > 14x for P0 sustained > 2 hours in the past week
4. Any data integrity incident with > 10 affected users

---

## Meeting Notes Archive

Store meeting notes in: `docs/sre/weekly-reviews/YYYY-MM-DD.md`
