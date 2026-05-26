# EMI Engineering Board (Now, Next, Later)

Status: Active
Source: docs/development/emi-artifacts-implementation-tickets.md
Updated: 2026-05-25

One-week pull plan:

1. docs/development/emi-now-lane-one-week-pull-plan-2026-05-25.md

This board converts the EMI development ticket register into execution lanes with sequencing constraints and balanced owner workload.

Effort points used for balancing:

1. XS = 1
2. S = 2
3. M = 3
4. L = 5
5. XL = 8

## Now (Current Cycle)

Goal: Establish data trust, telemetry foundations, and core product loop surfaces.

### Lane A: Data Trust and Proof Infrastructure

1. DEV-EMI-401 (M, Data Engineering)
- Depends on: none
- Blocks: DEV-EMI-403, DEV-EMI-408, DEV-EMI-409

2. DEV-EMI-402 (S, Engineering)
- Depends on: DEV-EMI-401
- Blocks: DEV-EMI-409

3. DEV-EMI-408 (S, Data + Legal Ops)
- Depends on: DEV-EMI-401
- Blocks: DEV-EMI-505

4. DEV-EMI-103 (M, Engineering + Data)
- Depends on: none
- Blocks: DEV-EMI-105, DEV-EMI-205, DEV-EMI-409, DEV-EMI-505

5. DEV-EMI-204 (M, Engineering + SRE)
- Depends on: DEV-EMI-103
- Blocks: DEV-EMI-502

### Lane B: Core User Flow Runtime

6. DEV-EMI-101 (L, Product + Engineering)
- Depends on: DEV-EMI-103 schema alignment
- Blocks: DEV-EMI-102, DEV-EMI-105

7. DEV-EMI-102 (M, Product Design + Frontend)
- Depends on: DEV-EMI-101
- Blocks: none

8. DEV-EMI-201 (L, Product + Frontend)
- Depends on: DEV-EMI-101
- Blocks: DEV-EMI-202, DEV-EMI-203

9. DEV-EMI-202 (M, Product + Backend)
- Depends on: DEV-EMI-201
- Blocks: DEV-EMI-205

10. DEV-EMI-203 (M, Product + Backend)
- Depends on: DEV-EMI-201
- Blocks: DEV-EMI-205

### Lane C: Compliance and Runtime Governance

11. DEV-EMI-003 (M, Legal + Web)
- Depends on: none
- Blocks: procurement and partner launch consistency

12. DEV-EMI-502 (L, SRE + Engineering)
- Depends on: DEV-EMI-204
- Blocks: reliability sign-off for ongoing operation

## Next (Upcoming Cycle)

Goal: Operationalize GTM proof delivery, partner workflows, and weekly governance automation.

### Lane D: GTM and Narrative Operations

1. DEV-EMI-001 (M, Product Marketing + Frontend)
- Depends on: none

2. DEV-EMI-002 (M, Sales Ops)
- Depends on: DEV-EMI-001

3. DEV-EMI-004 (S, Founder Office + Content Ops)
- Depends on: DEV-EMI-001

4. DEV-EMI-005 (S, Revenue Ops)
- Depends on: DEV-EMI-001, DEV-EMI-002

5. DEV-EMI-104 (M, Marketing)
- Depends on: DEV-EMI-101, DEV-EMI-102

6. DEV-EMI-407 (M, Sales Ops)
- Depends on: DEV-EMI-403, DEV-EMI-404, DEV-EMI-405, DEV-EMI-406

### Lane E: Partner Enablement Runtime

7. DEV-EMI-301 (M, Product + Frontend)
- Depends on: DEV-EMI-201

8. DEV-EMI-304 (L, Product Design + Frontend)
- Depends on: DEV-EMI-301

9. DEV-EMI-303 (M, Revenue Ops + Data)
- Depends on: DEV-EMI-103

10. DEV-EMI-302 (S, Partnerships Ops)
- Depends on: DEV-EMI-303, DEV-EMI-304

11. DEV-EMI-305 (S, Partnerships)
- Depends on: DEV-EMI-302

12. DEV-EMI-306 (XS, Data)
- Depends on: DEV-EMI-305

### Lane F: KPI and Reporting Automation

13. DEV-EMI-105 (XS, Data)
- Depends on: DEV-EMI-103, DEV-EMI-101

14. DEV-EMI-205 (XS, Data)
- Depends on: DEV-EMI-202, DEV-EMI-203, DEV-EMI-103

15. DEV-EMI-409 (XS, Data)
- Depends on: DEV-EMI-401, DEV-EMI-402, DEV-EMI-103

16. DEV-EMI-503 (S, PMO + Operations)
- Depends on: none

## Later (Subsequent Cycle)

Goal: Scale benchmark publishing and epic-level automation.

### Lane G: Proof Asset Data Feeds and Publishing

1. DEV-EMI-403 (M, Content Ops)
- Depends on: DEV-EMI-401

2. DEV-EMI-404 (S, Data)
- Depends on: DEV-EMI-401, DEV-EMI-103

3. DEV-EMI-405 (S, Data)
- Depends on: DEV-EMI-401, DEV-EMI-103

4. DEV-EMI-406 (S, Data + Partnerships Analytics)
- Depends on: DEV-EMI-401, DEV-EMI-103, DEV-EMI-305

### Lane H: Governance Dashboards and Closure Automation

5. DEV-EMI-501 (M, GTM Ops + Data)
- Depends on: DEV-EMI-002, DEV-EMI-103

6. DEV-EMI-504 (S, PMO + Data)
- Depends on: DEV-EMI-105, DEV-EMI-205, DEV-EMI-306, DEV-EMI-409

7. DEV-EMI-505 (S, PMO + Data)
- Depends on: DEV-EMI-408, DEV-EMI-409, DEV-EMI-504

## Dependency Sequences (Critical Paths)

1. Data trust path:
DEV-EMI-401 -> DEV-EMI-402 -> DEV-EMI-409 -> DEV-EMI-505

2. Assessment path:
DEV-EMI-103 -> DEV-EMI-101 -> DEV-EMI-102 -> DEV-EMI-105

3. Daily loop path:
DEV-EMI-201 -> DEV-EMI-202 and DEV-EMI-203 -> DEV-EMI-205

4. Partner enablement path:
DEV-EMI-301 -> DEV-EMI-304 -> DEV-EMI-302 -> DEV-EMI-305 -> DEV-EMI-306

5. Proof to GTM path:
DEV-EMI-401 -> DEV-EMI-403 and DEV-EMI-404 and DEV-EMI-405 and DEV-EMI-406 -> DEV-EMI-407

## Owner Workload Balancing

### Now lane workload (target <= 10 points per primary owner role)

| Owner group | Tickets | Points | Balance note |
| --- | --- | --- | --- |
| Product + Engineering | DEV-EMI-101, DEV-EMI-201 | 10 | At capacity; do not add in-cycle scope |
| Engineering + Data/SRE | DEV-EMI-103, DEV-EMI-204, DEV-EMI-402, DEV-EMI-502 | 13 | Over target; split DEV-EMI-502 into parallel sub-owners |
| Product Design + Frontend | DEV-EMI-102 | 3 | Has available capacity |
| Product + Backend | DEV-EMI-202, DEV-EMI-203 | 6 | Balanced |
| Data Engineering + Legal | DEV-EMI-401, DEV-EMI-408 | 5 | Balanced |
| Legal + Web | DEV-EMI-003 | 3 | Balanced |

### Next lane workload (target <= 10 points per primary owner role)

| Owner group | Tickets | Points | Balance note |
| --- | --- | --- | --- |
| GTM and Sales Ops | DEV-EMI-002, DEV-EMI-407 | 6 | Balanced |
| Product Marketing + Content | DEV-EMI-001, DEV-EMI-004, DEV-EMI-104 | 8 | Balanced |
| Partner and Revenue Ops | DEV-EMI-302, DEV-EMI-303, DEV-EMI-305 | 7 | Balanced |
| Product Design + Frontend | DEV-EMI-304, DEV-EMI-301 | 8 | Balanced |
| Data | DEV-EMI-105, DEV-EMI-205, DEV-EMI-306, DEV-EMI-409 | 4 | Under target and suitable for fast automation work |
| PMO + Ops | DEV-EMI-503 | 2 | Balanced |

### Later lane workload (target <= 10 points per primary owner role)

| Owner group | Tickets | Points | Balance note |
| --- | --- | --- | --- |
| Data + Analytics | DEV-EMI-404, DEV-EMI-405, DEV-EMI-406 | 6 | Balanced |
| Content Ops | DEV-EMI-403 | 3 | Balanced |
| GTM Ops + Data | DEV-EMI-501 | 3 | Balanced |
| PMO + Data | DEV-EMI-504, DEV-EMI-505 | 4 | Balanced |

## Execution Rules

1. Do not start Next tickets that depend on incomplete Now critical-path tickets.
2. Keep owner load within target by moving non-critical tasks to Later when Now exceeds capacity.
3. Recompute board weekly during Friday operating cadence.
