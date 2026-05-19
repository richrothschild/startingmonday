# Runbook Templates

Last updated: 2026-05-18

## Template 1: Service/Route Incident Runbook

Title: [Service or Route] Incident Runbook
Owner: [Team/Person]
Tier: [P0/P1/P2]
Last Verified: [Date]

### 1) Trigger Conditions

1. Alert names that invoke this runbook
2. Severity mapping
3. Known false-positive patterns

### 2) Impact Assessment

1. Affected user journeys
2. Estimated user count affected
3. Data integrity risk (none, possible, confirmed)

### 3) Immediate Actions (First 10 Minutes)

1. Acknowledge alert and open incident channel
2. Assign Incident Commander and Comms owner
3. Execute health checks and canary checks
4. If deploy-related, identify last deploy SHA and compare timestamps

### 4) Diagnostics Checklist

1. Dashboard queries to run
2. Logs to inspect (filters and correlation keys)
3. Traces to inspect
4. DB checks to run
5. Dependency status checks

### 5) Mitigations

1. Rollback deploy
2. Disable feature flag
3. Route traffic away from failing path
4. Activate fallback behavior
5. Manual operational workaround

### 6) Recovery Validation

1. Alert clear conditions
2. Synthetic checks to re-run
3. User-facing validation checklist
4. Data reconciliation checks

### 7) Communication Template

1. Internal update every 15 minutes for Sev-1/Sev-2
2. Customer status update template
3. Final resolution statement

### 8) Follow-up Actions

1. Postmortem owner and due date
2. Preventive action items
3. Test coverage updates required

## Template 2: Data Integrity Runbook

Title: [Data Integrity Issue]
Owner: [Team/Person]

### 1) Integrity Signal

1. What metric/query detected the issue
2. Confidence level and sample evidence

### 2) Scope Query

1. SQL to count affected records
2. SQL to identify earliest affected timestamp
3. SQL to identify likely source deployment/job

### 3) Containment

1. Pause offending worker/job/endpoint
2. Disable write path if needed
3. Preserve audit evidence

### 4) Repair Plan

1. Backfill/reconciliation script
2. Dry-run checks and expected count
3. Apply mode and verification checks

### 5) Verification

1. Before vs after counts
2. Spot checks on user-visible objects
3. Regression test added and linked

## Template 3: Dependency Outage Runbook

Title: [Dependency Name] Degradation
Owner: [Team/Person]

### 1) Detection

1. Which alerts indicate dependency issues
2. Vendor status page links

### 2) Degraded Mode

1. Feature degradation behavior and UX copy
2. Retry strategy and backoff values
3. Queueing/delay policy

### 3) Restoration

1. Safe replay procedure for queued work
2. Duplicate prevention checks
3. Data consistency verification

## Minimum Runbook Quality Standard

1. Executable by an engineer not familiar with the subsystem
2. Includes exact dashboard/log query instructions
3. Includes one rollback path and one fallback path
4. Verified quarterly in incident simulation drills
