# Production Feedback Loop

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: weekly
Source of truth: yes


Starting Monday runs a three-signal feedback loop from production into the improvement queue. The loop closes weekly. Nothing waits for a sprint cycle.

---

## Signal 1: Brief quality ratings

**Source:** `briefs.user_rating` (-1/+1) and `briefs.rating_feedback` (free text)  
**Where it surfaces:** Negative ratings trigger a PostHog event `brief_rated_negative` with `has_feedback`, `brief_type`, and `brief_id`.  
**Weekly action:** Pull negative ratings with feedback from the last 7 days. Read each feedback entry. If a prompt issue is identifiable, open a prompt fix in the next week's work. If the failure is systemic (wrong framing for a role type, missing objection category), update the prompt template in `src/app/api/prep/[id]/questions/route.ts`.

**Threshold:** Two or more negative ratings on the same brief section pattern = prompt issue, not user issue. Fix it.

---

## Signal 2: SLO breach alerts

**Source:** `tests/e2e/slo.spec.ts` — prep brief TTFC SLO (P95 < 10s)  
**Where it surfaces:** CI failure on staging branch. GitHub Actions email notification to repo owner.  
**Immediate action:** Check Anthropic status page. Check Railway staging service logs for cold start latency. If persistent, open an incident.  
**Weekly action:** Review Playwright run history on staging. If TTFC is trending toward the SLO ceiling (8-9s median), investigate prompt length, context payload size, and model selection.

---

## Signal 3: Conversion funnel drop-offs

**Source:** PostHog — `cta_clicked`, `situation_selected`, `signup_completed`, `profile_grade_submitted`, `pricing_cta_clicked`  
**Where it surfaces:** PostHog funnel analysis. Build a saved funnel: `situation_selected` → `signup_completed`. Monitor weekly.  
**Weekly action:** If `situation_selected` to `signup_completed` conversion drops more than 5 percentage points week-over-week, review the signup page copy for that situation ID. If profile grade submissions drop, check the email gate (may be friction) or the `/api/optimize` error rate.

---

## Cadence

| When | What |
|------|------|
| Monday morning | Pull brief feedback from last 7 days. Flag prompt fixes. |
| Monday morning | Check PostHog funnel for week-over-week conversion changes. |
| On CI failure | Investigate SLO breach immediately. |
| Monthly | Review optimize_leads table for email patterns (are leads converting to signups?). |

---

## Escalation

If a production issue cannot be reproduced on staging within 2 hours, it goes to an immediate rollback. Railway supports instant rollback to the previous deploy from the dashboard. Do not debug in production for more than 30 minutes without rolling back.
