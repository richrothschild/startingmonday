# Launch Week Incident Ownership And Response SLOs

## Incident Commander Rotation
- Primary IC: Engineering lead on duty
- Secondary IC: Reliability owner
- Communications lead: Product or GTM owner assigned per shift

## Ownership Matrix
- App/API availability: Web platform owner
- Worker pipeline and queues: Worker owner
- Data and Supabase operations: Data platform owner
- Billing and webhook paths: Payments owner

## Response SLOs
- Acknowledge Sev-1: <= 5 minutes
- Acknowledge Sev-2: <= 15 minutes
- First mitigation update Sev-1: <= 15 minutes
- First mitigation update Sev-2: <= 30 minutes
- Status updates while open: every 15 minutes (Sev-1), every 30 minutes (Sev-2)

## Escalation Triggers
- Synthetic failures for first-value flow or auth in production
- Readiness endpoint returns 503 for > 5 minutes
- Dead-letter queue growth sustained for > 30 minutes

## Launch-Week Daily Ritual
1. 09:00 UTC reliability standup with prior 24h incidents and action items.
2. Run load rehearsal or verify latest successful rehearsal output.
3. Run dead-letter coverage check.
4. Confirm on-call handoff notes before end of shift.

## Closeout Requirements
- Incident timeline captured
- Root cause documented
- Owner and due date assigned for every remediation
- Postmortem created for all Sev-1 incidents
