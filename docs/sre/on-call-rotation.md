# On-Call Rotation and Escalation Runbook

Last updated: 2026-05-18

Reference: [Incident Severity Policy](./incident-severity-policy.md)

---

## Overview

This document defines the on-call rotation schedule, handoff procedure, pager configuration,
and escalation paths for Starting Monday's production reliability on-call.

---

## Rotation Schedule

| Role | Scope | Rotation Cadence | Who |
|---|---|---|---|
| **Primary on-call** | All Sev-1 and Sev-2 pages; first responder | 1 week, Mon 09:00 UTC handoff | See schedule below |
| **Secondary on-call** | Backup if primary is unresponsive; co-responder for Sev-1 | Same week, same handoff | See schedule below |
| **Escalation (Engineering Lead)** | Unresolved Sev-1 after 15 min; data corruption; rollback decisions | Permanent, no rotation | Founder / Head of Engineering |
| **Comms Partner** | Customer-facing updates for Sev-1 events lasting > 30 min | Permanent | Product / Growth lead |

### Current Schedule (update weekly)

| Week | Primary | Secondary |
|---|---|---|
| 2026-05-18 | Engineer A | Engineer B |
| 2026-05-25 | Engineer B | Engineer A |
| 2026-06-01 | Engineer A | Engineer B |

> **How to update:** Edit this table in a PR each Thursday before the new on-call week starts (Monday 09:00 UTC).

---

## On-Call Hours

- **Response window:** 24×7 for Sev-1. Business hours (09:00–18:00 local time) for Sev-2 and Sev-3.
- **Out-of-hours escalation:** Sev-2 that becomes Sev-1 out of hours pages primary directly; primary can choose to page secondary or handle solo.

---

## Pager Configuration

### Slack Alerts (Current System)

All production alerts route to `#prod-alerts` via the GitHub Actions monitoring workflows.
Sev-1 alerts are distinguished by the prefix `Sev-1 ALERT` in the message title.

**Required Slack notification settings for on-call week:**
1. Enable mobile push notifications for the `#prod-alerts` channel.
2. Set Do Not Disturb to OFF for the duration of your on-call week.
3. Pin the channel to the top of your Slack sidebar.

### Optional: PagerDuty / Opsgenie Integration

If the team grows beyond 4 engineers or on-call fatigue becomes a concern:
1. Create a PagerDuty service pointing to a PagerDuty integration webhook.
2. Replace the `curl` Slack calls in `fast-burn-alert.yml`, `production-synthetics.yml`,
   and `monitoring.yml` with a PagerDuty Events v2 POST.
3. Configure PagerDuty escalation policy to match the timings in the severity policy.

---

## Handoff Process

### Thursday Before Handoff (Outgoing Primary)

1. **Complete the weekly reliability review** (template: [weekly-reliability-review.md](./weekly-reliability-review.md)).
2. **Check open incidents:** Confirm all active incidents are in a known state (mitigated or monitored).
3. **Update on-call schedule table** above in this document; open PR for review.
4. **Brief the incoming primary** in a 15-minute handoff call or async Slack thread covering:
   - Any degradation in progress or recently mitigated
   - Upcoming deployments or risky changes planned for the week
   - Any known flaky alerts or scheduled maintenance (add `[SCHEDULED]` to Slack if applicable)
   - Current SLO attainment (from `npm run slo:report` output)

### Monday 09:00 UTC (Incoming Primary)

1. Merge the schedule PR.
2. Confirm Slack notifications are configured (see above).
3. Run `npm run integrity:check` to verify the database is clean entering your shift.
4. Acknowledge the handoff in `#prod-alerts`: _"On-call handoff: @IncomingPrimary is now primary, @IncomingSecondary is secondary for the week of [date]."_

---

## Escalation Path (Step-by-Step)

### Sev-1

```
Alert fires in #prod-alerts
        │
        ▼ (≤5 min)
Primary acknowledges in #prod-alerts: "Acknowledged. Investigating."
        │
        ▼ (≤10 min)
Primary assigns Incident Commander role (themselves or secondary)
        │
        ├── If primary is unavailable or unresponsive after 5 min:
        │   Secondary pages/DMs primary directly, then takes over
        │
        ▼ (≤15 min)
Mitigation action started. Status update in #prod-alerts.
        │
        ├── If NOT mitigated by 15 min:
        │   Secondary pages Engineering Lead with:
        │   - Brief description: "Sev-1: [component] is down. Primary is [working on X]. Need decision on [rollback/escalate]."
        │
        ▼ (every 15 min)
Rolling updates in #prod-alerts: "Update [HH:MM]: [status + next action]"
        │
        ▼ (≤30 min)
Recovery confirmed. Post-incident note in #prod-alerts.
        │
        ▼ (within 72 hours)
Blameless postmortem drafted (template: runbooks/postmortem-template.md)
```

### Sev-2

```
Alert fires in #prod-alerts
        │
        ▼ (≤10 min)
Primary acknowledges and begins investigation
        │
        ▼ (≤30 min)
Mitigation started. Updates every 30 min.
        │
        ├── If severity increases to Sev-1, follow Sev-1 path above
        │
        ▼ (≤4 hours)
Recovery confirmed. Note in #prod-alerts.
        │
        ▼ (within 1 week)
Root cause summary posted to #engineering or relevant channel
```

---

## Response Templates

### Sev-1 Acknowledgement
```
🔴 Sev-1 Acknowledged — [HH:MM UTC]
Incident: [brief description]
IC: @username
Status: Investigating
Next update: [HH:MM UTC]
```

### Recovery Confirmation
```
✅ Sev-1 Resolved — [HH:MM UTC]
What happened: [1-sentence summary]
Duration: [X min]
Fix applied: [what was done]
Postmortem: Due [date, 72h from now]
```

### Escalation to Engineering Lead
```
⚠️ Escalating Sev-1 — [HH:MM UTC]
@engineeringlead — Sev-1 for [component] has been active [X min] without full mitigation.
Current state: [what's been tried]
Decision needed: [rollback? hotfix? DNS change?]
```

---

## Runbook Index

| Component | Runbook |
|---|---|
| Auth failure | [runbooks/auth-failure.md](./runbooks/auth-failure.md) |
| Feedback submission failure | [runbooks/feedback-failure.md](./runbooks/feedback-failure.md) |
| Billing / Stripe webhook degradation | [runbooks/billing-webhook-degradation.md](./runbooks/billing-webhook-degradation.md) |
| Follow-up lifecycle drift | [runbooks/follow-up-lifecycle-drift.md](./runbooks/follow-up-lifecycle-drift.md) |
| Postmortem template | [runbooks/postmortem-template.md](./runbooks/postmortem-template.md) |

---

## On-Call Health

Signs to watch for fatigue or unsustainable load:
- Primary handling > 3 Sev-1 incidents per week
- Average time-to-mitigate exceeding SLO targets for two consecutive weeks
- On-call engineer requesting swap mid-week

If any of these occur, raise in the weekly reliability review as an escalation trigger.
See [weekly-reliability-review.md](./weekly-reliability-review.md) — Section: Escalation Triggers.
