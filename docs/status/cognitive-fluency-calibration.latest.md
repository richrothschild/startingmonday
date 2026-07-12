# Cognitive Fluency Calibration Dispatch

Generated: 2026-07-12T20:52:17.039Z
Channel: reliability---service
Source cognitive report: 2026-07-12T20:52:16.565Z
Candidates selected: 8

## Selected Routes

- /dashboard/admin/coach-outreach [dashboard] severity=28
  Reason: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/admin/linkedin-company-launch [dashboard] severity=28
  Reason: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/coach [dashboard] severity=28
  Reason: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/placed [dashboard] severity=28
  Reason: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/plan [dashboard] severity=28
  Reason: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/post-search [dashboard] severity=25
  Reason: load gate failed (B+ vs required A-); 2 deterministic issue(s)
- /dashboard/signals [dashboard] severity=28
  Reason: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/start [dashboard] severity=40
  Reason: load gate failed (B+ vs required A-); fluency gate failed (B+ vs required A-); 2 deterministic issue(s)

## Auditor Prompt

```text
Run the Page Experience Auditor on the following routes with three-pass analysis and prioritized fixes:
/dashboard/admin/coach-outreach, /dashboard/admin/linkedin-company-launch, /dashboard/coach, /dashboard/placed, /dashboard/plan, /dashboard/post-search, /dashboard/signals, /dashboard/start

Deterministic evidence:
- /dashboard/admin/coach-outreach: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/admin/linkedin-company-launch: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/coach: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/placed: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/plan: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/post-search: load gate failed (B+ vs required A-); 2 deterministic issue(s)
- /dashboard/signals: fluency gate failed (B+ vs required A-); 1 deterministic issue(s)
- /dashboard/start: load gate failed (B+ vs required A-); fluency gate failed (B+ vs required A-); 2 deterministic issue(s)

Focus on cognitive fluency, cognitive load, trust integrity spillover, and route-specific remediation actions.
```

