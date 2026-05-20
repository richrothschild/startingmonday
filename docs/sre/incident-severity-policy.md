# Incident Severity Policy (Team Size: 3-8 Engineers)

Last updated: 2026-05-18

## Team Operating Model

Assumed team size and structure:

1. 1 primary on-call engineer
2. 1 secondary on-call engineer
3. 1 engineering lead/founder as escalation point
4. optional product/comms partner for customer updates

## Severity Levels

### Sev-1 (Critical Outage)

Definition:

1. P0 workflow unavailable for a meaningful share of users
2. Login/signup/billing or core dashboard transaction is broadly broken
3. Data corruption risk is confirmed or highly likely

Response targets:

1. Acknowledge in <= 5 minutes
2. Incident commander assigned in <= 10 minutes
3. Mitigation started in <= 15 minutes
4. Recovery target <= 30 minutes
5. Updates every 15 minutes

Escalation:

1. Primary pages secondary immediately
2. Secondary pages engineering lead/founder if unresolved in 15 minutes

### Sev-2 (Major Degradation)

Definition:

1. P0 workflow degraded but not fully down
2. Significant error/latency increase with user-visible impact
3. Important data inconsistency with bounded scope

Response targets:

1. Acknowledge in <= 10 minutes
2. Mitigation started in <= 30 minutes
3. Recovery target <= 4 hours
4. Updates every 30 minutes

Escalation:

1. Primary handles and engages secondary if unresolved in 30 minutes
2. Escalate to engineering lead at 60 minutes

### Sev-3 (Localized Incident)

Definition:

1. Affects a non-critical route or small user cohort
2. Workaround exists
3. No immediate data-loss risk

Response targets:

1. Acknowledge in <= 30 minutes
2. Mitigation by end of business day
3. Updates hourly until stabilized

### Sev-4 (Warning / Informational)

Definition:

1. Trend that may become incident
2. Non-user-impacting failures in background jobs
3. Alert noise requiring tuning

Response targets:

1. Triage within one business day
2. Fix or tuning within 5 business days

## Incident Roles

### Incident Commander

1. Owns prioritization and incident timeline
2. Approves rollback vs hotfix decisions
3. Ensures updates follow policy cadence

### Ops Driver

1. Executes diagnostics and mitigations
2. Runs checklists from relevant runbook

### Communications Owner

1. Maintains stakeholder updates
2. Produces customer-facing status text when needed

## Mandatory Procedures

1. Create incident channel/ticket for Sev-1 and Sev-2
2. Link all relevant alerts, dashboards, logs, and deploy SHAs
3. For Sev-1 and Sev-2, complete blameless postmortem in <= 48 hours
4. Track postmortem actions in backlog with owners and due dates

## Incident Exit Criteria

1. Affected synthetic checks pass in 2 consecutive runs
2. Alert conditions clear for >= 15 minutes
3. No unresolved data reconciliation items
4. Customer update posted if users were impacted
