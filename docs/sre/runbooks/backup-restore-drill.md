# Backup And Restore Drill

## Objective
Prove that data can be restored within launch-week recovery targets.

## Targets
- Recovery time objective (RTO): <= 60 minutes
- Recovery point objective (RPO): <= 15 minutes

## Preconditions
- Latest database backup available.
- Service role credentials verified.
- Dry-run environment available for restore validation.

## Drill Steps
1. Announce drill start in incident and engineering channels.
2. Record current timestamp and active deploy SHA.
3. Trigger backup snapshot (or verify most recent scheduled snapshot timestamp).
4. Restore snapshot to drill target environment.
5. Run smoke checks:
   - `/api/health` returns 200.
   - `/api/readiness` returns 200.
   - Auth login and dashboard load succeed.
6. Validate critical tables have expected row counts:
   - `users`
   - `companies`
   - `company_signals`
   - `scan_failures`
   - `heavy_job_queue`
7. Record measured RTO and RPO.
8. Announce drill completion and gaps.

## Evidence To Capture
- Backup timestamp
- Restore start and finish timestamps
- Smoke check outputs
- Row count snapshots for critical tables
- Follow-up action items

## Failure Handling
- If restore exceeds RTO or violates RPO, open a Sev-2 reliability incident.
- Pause launch until remediation owner and date are assigned.
