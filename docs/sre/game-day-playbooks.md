# Game Day Playbooks

Last updated: 2026-05-18

Reference: [Incident Severity Policy](./incident-severity-policy.md) | [On-Call Rotation](./on-call-rotation.md)

Game days are scheduled chaos engineering exercises. The goal is to exercise runbooks,
validate detection latency, confirm recovery steps work, and surface gaps before a real incident.

**Frequency:** Quarterly, or within 2 weeks of any major infrastructure change.
**Duration:** ~90 minutes per scenario, scheduled in advance.
**Record results:** Use the table in each scenario to log actual vs. expected outcomes.
**No blame:** All game days are blameless learning exercises.

---

## Scenario 1: Dependency Outage Simulation

### Objective

Verify that Starting Monday degrades gracefully (not catastrophically) when an external
dependency becomes unavailable, and that the on-call team detects and responds within SLO targets.

### Dependencies in Scope

| Dependency | What breaks without it |
|---|---|
| Supabase | All authenticated routes, database reads/writes |
| Stripe | Billing checkout, webhook processing, subscription status |
| Anthropic (Claude) | Prep brief generation, daily briefing, optimize endpoint |

### Prerequisites

1. Schedule during low-traffic window (weekday morning, <10 active users expected).
2. Inform the full engineering team at least 48 hours in advance.
3. Designate roles: **Chaos operator** (breaks things), **Observer** (watches dashboards), **Responder** (on-call engineer, normal on-call mode — not told specifics).
4. Ensure Sentry, PostHog, Railway logs, and `#prod-alerts` Slack are all visible to Observer.

### Execution Steps

#### Phase 1: Supabase Outage Simulation (30 min)

**Setup (Chaos operator):**
1. In Railway, set the environment variable `SUPABASE_OUTAGE_SIMULATION=true`.
   - This requires a code-side guard: add a short-circuit in `src/lib/supabase/server.ts`
     that throws a connection error when this variable is set. (See note below.)
   - _Alternative if code guard is not in place:_ Temporarily rotate the `SUPABASE_SERVICE_ROLE_KEY`
     to an invalid value in Railway environment settings.
2. Deploy the change (or env var update triggers Railway rebuild).

> **Important:** Do NOT use the Supabase dashboard pause feature — it takes too long to restore.
> Use env var rotation for fastest recovery.

**Observe:**
- [ ] Within 2 minutes: Does `#prod-alerts` receive a Sev-1 or error-spike alert?
- [ ] Within 5 minutes: Does the monitoring.yml workflow report failures?
- [ ] What HTTP status do users see at `/dashboard`? (Expected: redirect to login or 500, not silent hang)
- [ ] Does `/api/health` still respond? (It should — it does not hit Supabase)
- [ ] What does Railway's log stream show? (Expected: structured JSON error logs, not unhandled crashes)

**Respond (on-call engineer, working from alert):**
1. Acknowledge in `#prod-alerts`.
2. Check Sentry for error spike on `/api/*` routes.
3. Open runbook for auth failure (docs/sre/runbooks/auth-failure.md).
4. Identify that Supabase is the dependency from error messages.
5. Check https://status.supabase.com (dependency-health.yml should have already alerted if it's a real outage).
6. **Recovery action:** Restore the correct `SUPABASE_SERVICE_ROLE_KEY` (or remove the env var override).
7. Verify `/api/health` returns 200 and `/dashboard` loads.

**Record results:**

| Metric | Target | Actual |
|---|---|---|
| Time to first alert | ≤ 5 min | |
| Time to acknowledgement | ≤ 5 min from alert | |
| Time to root cause (Supabase) | ≤ 10 min | |
| Time to recovery | ≤ 30 min | |
| False negatives (missed alerts) | 0 | |

---

#### Phase 2: Stripe Outage Simulation (20 min)

**Setup (Chaos operator):**
1. In Railway, temporarily set `STRIPE_SECRET_KEY=sk_test_invalid_game_day_key`.
2. This will cause billing routes to fail with Stripe authentication errors.

**Observe:**
- [ ] Does `/api/billing/checkout` return a non-500 error (expected: 500 from Stripe auth failure)?
- [ ] Does the Synthetic-07 billing synthetic trigger an alert?
- [ ] Does `dependency-health.yml` catch a status.stripe.com incident (if simulating a real outage)?

**Recovery:** Restore correct `STRIPE_SECRET_KEY`.

**Record results:**

| Metric | Target | Actual |
|---|---|---|
| Billing degradation detected | ≤ 10 min | |
| Non-billing routes unaffected | Confirmed | |
| Recovery time | ≤ 15 min | |

---

#### Phase 3: Anthropic Outage Simulation (20 min)

**Setup (Chaos operator):**
1. In Railway, set `ANTHROPIC_API_KEY=sk-ant-invalid-game-day-key`.

**Observe:**
- [ ] Does `/api/optimize` degrade gracefully (expected: error response, not hang or 500 cascade)?
- [ ] Does `/api/intelligence/*` degrade gracefully?
- [ ] Do non-AI routes (`/dashboard`, `/api/contacts`, `/api/feedback/items`) remain fully functional?
   _This is the key isolation test — AI outage must not cascade._

**Recovery:** Restore correct `ANTHROPIC_API_KEY`.

**Record results:**

| Metric | Target | Actual |
|---|---|---|
| AI routes degrade gracefully | Yes (no 500 cascade) | |
| Non-AI routes unaffected | 100% | |
| Recovery time | ≤ 10 min | |

---

### Post-Scenario Review (20 min)

1. **What worked well?** (Detection, runbook accuracy, communication)
2. **What was slow or missed?** (Alert delay, unclear runbook steps, missing monitoring)
3. **Action items:** Open GitHub issues for gaps found. Tag with `reliability` and assign to next sprint.
4. **Update this playbook** if steps proved inaccurate.

---

## Scenario 2: Data Integrity Drift Simulation

### Objective

Confirm that the data integrity monitoring (R2.7) detects drift, the runbook leads to correct
repair SQL, and the repair is applied safely (preview-first).

### Scope

Simulated drift: closed contacts with pending follow_ups, invalid follow_up status values.

### Prerequisites

1. Schedule during low-traffic window.
2. Identify a **test user** account (not a real customer) to inject drift under.
3. Designate: **Chaos operator**, **Observer**, **Responder** (works from alert + runbook).
4. Have access to the Supabase SQL editor (Table Editor > SQL Editor) or psql.

### Execution Steps

#### Phase 1: Inject Closed-Contact Drift (30 min)

**Setup (Chaos operator, via Supabase SQL Editor):**

```sql
-- Step 1: Find a test-user contact to mutate
-- Replace 'test-user-id' with actual test account user_id
SELECT id, name, status FROM contacts WHERE user_id = 'test-user-id' LIMIT 5;

-- Step 2: Record the contact_id for cleanup
-- Step 3: Create a synthetic pending follow_up for a contact, then close the contact

-- Insert a pending follow_up (note: use a real contact_id from step 1)
INSERT INTO follow_ups (contact_id, user_id, due_date, status, note)
VALUES ('<contact_id>', 'test-user-id', NOW() + INTERVAL '7 days', 'pending', '[GAME-DAY] synthetic drift');

-- Close the contact (creating the drift condition)
UPDATE contacts SET status = 'closed' WHERE id = '<contact_id>' AND user_id = 'test-user-id';
```

**Trigger the detector:**
```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/check-data-integrity.mjs
```

**Observe:**
- [ ] Does `check-data-integrity.mjs` exit 1?
- [ ] Does it report `closed_contact_drift: 1` anomaly?
- [ ] Is the affected row identified correctly (contact_id, user_id)?
- [ ] If running in CI (nightly-audit.yml), does the Slack alert fire?

**Respond (on-call engineer, working from runbook):**
1. Open [runbooks/follow-up-lifecycle-drift.md](./runbooks/follow-up-lifecycle-drift.md).
2. Run the diagnostic SQL to identify scope.
3. Run the **preview SQL** (SELECT, not UPDATE) first.
4. Confirm preview output matches expectation.
5. Execute the repair SQL to cancel the orphaned follow_up.
6. Re-run `check-data-integrity.mjs` — confirm exit 0.

**Record results:**

| Metric | Target | Actual |
|---|---|---|
| Drift detected by script | Yes, exit 1 | |
| Correct anomaly identified | closed_contact_drift | |
| Runbook led to correct repair SQL | Yes | |
| Preview-before-repair step followed | Yes | |
| Post-repair clean check passes | exit 0 | |

---

#### Phase 2: Invalid Status Drift (20 min)

**Setup (Chaos operator):**

```sql
-- Insert a follow_up with an invalid status value (bypasses app-layer validation)
INSERT INTO follow_ups (contact_id, user_id, due_date, status, note)
VALUES ('<contact_id>', 'test-user-id', NOW(), 'done', '[GAME-DAY] invalid status');
-- Note: 'done' is NOT in the allowed set (pending, completed, cancelled, snoozed)
-- The DB check constraint may reject this — if so, that's a pass; no further action needed
```

**Observe:**
- [ ] If the insert succeeds: does `check-data-integrity.mjs` catch `invalid_follow_up_status`?
- [ ] If the insert fails with a constraint error: the DB constraint is working correctly — log as pass.

**Cleanup (Chaos operator):**

```sql
-- Remove the injected drift records
DELETE FROM follow_ups WHERE note LIKE '[GAME-DAY]%' AND user_id = 'test-user-id';
UPDATE contacts SET status = 'active' WHERE id = '<contact_id>' AND user_id = 'test-user-id';
```

**Record results:**

| Metric | Target | Actual |
|---|---|---|
| DB constraint rejects invalid status OR script detects it | Yes | |
| Cleanup SQL completes without error | Yes | |

---

### Post-Scenario Review (20 min)

1. **Was the runbook accurate?** (SQL queries returned expected results, steps were clear)
2. **Were the detection queries fast enough?** (Should complete in <5s for typical database size)
3. **Action items:** Open GitHub issues for any runbook gaps or missing check coverage.
4. **Confirm cleanup is complete:** Run `npm run integrity:check` after review — must exit 0.

---

## Game Day Calendar

| Date | Scenario | Participants | Lead | Status |
|---|---|---|---|---|
| 2026-06-15 | Dependency Outage | Full engineering team | Engineer A | Planned |
| 2026-07-15 | Data Integrity Drift | Full engineering team | Engineer B | Planned |
| 2026-09-15 | Dependency Outage | Full engineering team | On-call primary | Planned |
| 2026-10-15 | Data Integrity Drift | Full engineering team | On-call primary | Planned |

---

## Lessons Learned Log

| Date | Scenario | Finding | Action Item | Status |
|---|---|---|---|---|
| — | — | — | — | — |
