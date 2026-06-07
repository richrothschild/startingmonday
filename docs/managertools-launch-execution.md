# Manager Tools Newsletter Launch — Execution Plan
**Trigger:** Mark Horstman mention in Manager Tools newsletter (target: Tuesday, June 9, 2026 morning PT)  
**Goal:** Capture, identify, and convert Manager Tools referral traffic with zero leakage  
**Option C:** Vanity URL (auto-tags source) + "How did you hear about us?" field (fallback capture)

---

## 1. Vanity URL — `/managertools`

### What to build
A dedicated landing page at `startingmonday.app/managertools` that:
- Mirrors Mark's tone: warm, community-oriented, operating system framing
- Auto-tags all signups with `utm_source=managertools` or equivalent source parameter
- Does NOT open with a challenge frame ("you are behind") — opens with a welcome frame

### Recommended headline
> **"Built for executives who manage their search with discipline."**  
> *Starting Monday members from the Manager Tools community get 30 days free — no credit card, no employer visibility.*

### Recommended subheadline
> The same operating discipline you bring to your team, applied to your career transition.

### Page structure (in order)
1. **Headline + subheadline** (community welcome tone)
2. **3-line value prop** — clarity, timing, follow-through (mirrors Mark's exact language)
3. **Opportunity Timing Gap diagram** (already built — reuse from homepage)
4. **Pilot stats** — 81% reached first interview in 30 days · 27 executives · 9 days median outreach (from /for-cio)
5. **Single CTA button** — "Start your free 30-day trial →" → routes to `/signup?utm_source=managertools&utm_medium=newsletter&utm_campaign=horstman-june2026`
6. **Privacy reassurance** — one line: "Your search stays private. We never share your identity, targets, or activity."
7. **Footer** — standard

### What to tell Mark
> "Mark — here's the link for your newsletter: **startingmonday.app/managertools**  
> It goes to a page built specifically for your community — same tone as your mention, and it automatically identifies everyone who comes through so we can follow up with them as a group and close the feedback loop with you."

---

## 2. Signup Flow Modification — "How did you hear about us?"

### Where to add it
On the existing signup form (`/signup`), add a single optional dropdown or radio field:

**Label:** "How did you hear about Starting Monday?"  
**Options:**
- Manager Tools / Mark Horstman
- Executive coach referral
- LinkedIn
- Google / web search
- Colleague or peer
- Other (please specify)

### Behavior
- Field is **optional** — do not gate signup on it
- If user arrives via `/managertools` URL with UTM params, **pre-select "Manager Tools / Mark Horstman"** automatically and make the field read-only (confirms the source, reduces friction)
- Store source in user record at signup — attach to every analytics event for this cohort

### Why this matters
If Mark publishes the plain URL (`startingmonday.app`) rather than the vanity URL, or if someone types it manually after hearing the podcast/newsletter, the field catches them. Combined with the vanity URL, you get near-complete source attribution.

---

## 3. Post-Signup Flow for Manager Tools Cohort

### Immediate (triggered on signup where source = managertools)
- Welcome email subject: **"Welcome from the Manager Tools community"**
- Body tone: warm, feedback-seeking, matches Mark's framing
- Include: one-click link to generate their first prep brief for a target company
- Include: explicit ask — "We're collecting feedback from this cohort. Reply to this email with what's working and what isn't."

### Day 2 (conversion trigger — applies to all trials, critical for this cohort)
- Trigger: if user has added ≥1 target company → auto-generate sample prep brief and deliver via email
- Subject: **"Your first brief is ready — [Company Name]"**
- CTA: "Upgrade to Active to unlock all briefs → $199/month"

### Day 7 (feedback touchpoint — Manager Tools cohort only)
- Personal email from Rich (or appearing to be)
- Subject: **"One week in — what are you seeing?"**
- 3 questions max: What's useful? What's missing? Would you recommend this to another executive in transition?

### Day 30 (trial end)
- Conversion email: remind of trial end, surface the brief they generated, show upgrade path
- For non-converters: ask why — one-question survey

---

## 4. Analytics & Tracking Setup

### UTM parameters to use consistently
```
utm_source=managertools
utm_medium=newsletter
utm_campaign=horstman-june2026
```

### Events to instrument before launch
- [x] Landing page view (`/managertools`) — event: `managertools_landing_view`
- [x] CTA click → signup initiated — event: `signup_initiated` with `location` + campaign metadata
- [ ] Signup completed (with source captured)
- [ ] Target company added (Day 1 activation)
- [ ] First prep brief generated (aha moment)
- [ ] Upgrade to paid (conversion)
- [ ] Cancellation at trial end (churn)

### Dashboard to build (simple)
| Metric | Target | Actual |
|--------|--------|--------|
| Vanity URL visits | — | — |
| Trial signups (Manager Tools cohort) | 50+ | — |
| Day-1 activation (added target company) | >60% | — |
| First brief generated | >40% | — |
| Free → paid conversion at day 30 | >15% | — |
| Feedback responses | >20% | — |

---

## 5. Pre-Launch Checklist

### Must ship before newsletter drops
- [ ] `/managertools` landing page live and tested on mobile
- [ ] UTM params flowing through to signup and user record
- [ ] "How did you hear about us?" field added to `/signup`
- [ ] Manager Tools source auto-selects when arriving via vanity URL
- [ ] Welcome email (source = managertools) written and triggered
- [ ] Day-2 brief trigger confirmed working
- [ ] Pilot stats on landing page match /for-cio (81%, 27, 9 days)
- [ ] Remove or reframe "11 days" claim on /for-cio before traffic spike
- [ ] Confirm vanity URL with Mark — send him the link

### Nice to have (if time permits)
- [ ] Day-7 feedback email written
- [ ] Day-30 conversion email written
- [ ] Analytics dashboard configured
- [ ] Mobile experience QA on `/managertools` page

---

## 6. What to Tell Mark Before the Newsletter Drops

> "Mark — a few things before you send:
>
> 1. Here's the dedicated link for your community: **startingmonday.app/managertools** — it goes to a page built for your audience specifically.
> 2. Anyone who signs up through that link is automatically flagged as a Manager Tools member on our end — we'll treat them as a priority cohort and close the feedback loop with you.
> 3. If you're able to use this URL instead of the homepage, it helps us track the results and report back to you on how many of your members converted and what they said.
>
> Thank you for this — it means a lot."

---

## 7. Confirmed Decisions

| Decision | Value |
|---|---|
| Newsletter timing assumption | Tuesday, June 9, 2026, morning Pacific Time |
| Execution model | Single compressed launch sprint |
| Launch DRI | Rich |
| Day-2 brief trigger status | Net-new, launch-critical build |
| Day-7/day-30 comms timing | Acceptable to deliver in Sprint 2 |
| KPI thresholds | Initial hypotheses (not hard go/no-go gates) |
| Vanity URL in newsletter body | Confirmed (`startingmonday.app/managertools`) |
| Launch monitoring mode | Live monitoring + Slack posting for full first week |
| Traffic planning envelope | Expected: handful of signups; Prepared capacity: up to 1,000 |
| Send-day monitoring window | 6:00 AM - 5:00 PM PT |
| Slack alerting duration | 10 days, starting Tuesday (newsletter send day) |
| High-volume alert mode | Switch from per-user alerts to 4-hour cohort summaries |

## 8. Remaining Clarifications

No open clarifications. Execution-ready.

---

## 9. Launch Epic + Sprint Plan

## Epic
**Epic name:** Manager Tools Cohort Launch Readiness  
**Objective:** Ensure every Manager Tools visitor can be attributed, activated, supported, and converted with no major UX or analytics leakage before newsletter traffic lands.  
**Success window:** From pre-send build window through day-30 trial conversion window.  
**DRI:** Rich

### Epic outcomes (must achieve)
- Attribution coverage for Manager Tools cohort is reliable (`utm_source` + fallback form field).
- Launch path from landing page → signup → first value is friction-tested on desktop and mobile.
- Cohort communications (welcome, day-2, day-7, day-30) are live or queued with clear ownership.
- Daily launch dashboard is visible to team and updated during first 14 days after send.
- Live week-1 operational monitoring is active with Slack updates and incident ownership.
- System and workflow readiness supports up to 1,000 launch signups without material data or automation loss.
- Slack new-user alerting remains reliable for 10 days starting send day, with controlled-noise summary mode under high volume.

### Epic KPIs (initial hypotheses)
- 95%+ of Manager Tools signups have source attribution captured.
- 60%+ day-1 activation (target company added).
- 40%+ first brief generated in trial period.
- 15%+ day-30 free-to-paid conversion.

---

## 10. Sprint Plan (Compressed)

### Sprint 0 (Now -> Newsletter Send) — Single Launch Sprint
**Goal:** Ship everything required to capture and activate Manager Tools users before traffic lands.

**Scope**
1. Ship `/managertools` page with approved copy, pilot stats, and vanity-link CTA.
2. Implement signup source field and auto-select/read-only behavior for vanity URL traffic.
3. Persist source to user record and attach source to key events.
4. Validate end-to-end event pipeline and cohort tagging in analytics.
5. Build and ship day-2 brief trigger (launch-critical net-new) with retries and observability.
6. Create live monitoring plan (send day 6:00 AM-5:00 PM PT, Slack channel, escalation path, posting cadence).
7. Run launch-load readiness checks for up to 1,000 signups (event ingestion, queue/cron throughput, email provider limits, dashboard latency).
8. Implement Slack new-user alerting for 10 days starting Tuesday, including volume-aware summary mode.
9. QA desktop + mobile for `/managertools`, `/signup`, and first session flow.
10. Confirm final link and send message package to Mark.

**Exit criteria**
- [ ] Vanity page live in production.
- [ ] Source attribution visible in user record for test signups.
- [ ] All critical launch events firing in analytics.
- [ ] Mobile QA pass with no P0/P1 issues.
- [ ] Day-2 trigger verified in production-like test path.
- [ ] Mark confirmation received on URL usage.
- [ ] Week-1 monitoring rota finalized and Slack posting playbook approved.
- [ ] 1,000-signup readiness checklist passes with documented rollback/mitigation steps.
- [ ] Slack alerting runbook covers both per-user alerts and 4-hour summary mode.
- [ ] 10-day alert schedule is configured (Tuesday through +9 days).

### Sprint 1 (Post-Launch, Weeks 1-2) — Activation Reliability
**Goal:** Stabilize first-value performance after send and protect conversion momentum.

**Scope**
1. Monitor day-2 trigger reliability and replay any failed cohorts.
2. Add onboarding nudges for users without target company by +24h.
3. Tighten funnel instrumentation and drop-off reporting.
4. Run daily launch standup on funnel + incidents.
5. Post live monitoring updates to Slack throughout week 1 (hourly during send-day window, then 3x daily).
6. Keep Slack new-user alerting active through day 10; if volume exceeds threshold, switch to 4-hour rollup summaries.

**Exit criteria**
- [ ] Day-2 trigger reliability ≥99% over rolling 7 days.
- [ ] Funnel dashboard shows conversion by step for Manager Tools users.
- [ ] Runbook exists for failed trigger recovery.
- [ ] Week-1 Slack updates complete with incident timeline + resolution notes.
- [ ] Day-10 alerting report exported with total signups, attribution quality, and incident summary.

### Sprint 2 (Post-Launch, Weeks 3-4) — Conversion + Feedback Loop
**Goal:** Convert qualified users and capture actionable product feedback.

**Scope**
1. Launch day-7 feedback email and structured response capture.
2. Launch day-30 conversion and non-converter survey email.
3. Add lightweight in-app prompt to request friction feedback after first brief.
4. Segment cohort by activation state and tailor email messaging.
5. Prepare Mark feedback packet: volume, activation, conversion, anonymized themes.

**Exit criteria**
- [ ] Day-7 and day-30 workflows live and monitored.
- [ ] Feedback responses tied to user source and activation state.
- [ ] Conversion reporting includes cohort-specific breakdown.
- [ ] Mark update packet draft ready for review.

### Optional Sprint 3 (Decision Sprint)
Run only if cohort volume supports statistically meaningful decisions.

---

## 11. Suggested Work Breakdown by Owner

### Product/Engineering (Rich + eng support)
- Landing page, signup attribution, event instrumentation, automation reliability.

### Growth/Content
- Cohort-specific copy, Mark message package, day-7/day-30 comms, conversion narrative.

### Ops/Analytics
- Dashboard setup, daily launch monitoring, QA checklist execution, issue triage.
- Slack launch reporting cadence ownership and incident broadcast discipline.

---

## 12. Risk Register (Pre-Mention)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mark uses homepage URL instead of vanity URL | Medium | High | Keep signup source field live; include vanity URL in all pre-send communications |
| Day-2 automation fails under spike | Medium | High | Add retries, dead-letter queue check, manual replay runbook |
| Attribution not written to user profile | Low | High | Pre-launch test matrix with synthetic signups + dashboard verification |
| Mobile signup friction reduces conversion | Medium | Medium | Mobile QA pass + fast follow bug triage owner during week 1 |
| Messaging mismatch with Manager Tools tone | Low | Medium | Final copy review against Mark's framing before send |
| Traffic spike approaches 1,000 signups and overwhelms workflows | Low | High | Pre-launch throughput test, email/provider quota verification, queue backpressure alerts, manual fallback runbook |
| Slack alert fatigue obscures important issues | Medium | Medium | Use per-user alerts at low volume, auto-switch to 4-hour summary mode at high volume, keep incident-only immediate alerts |

---

## 13. Slack Alerting Policy (Operational)

### Window
- Start: Tuesday (send day), 6:00 AM PT.
- End: Day 10 at 11:59 PM PT.

### Default mode (normal volume)
- Post one Slack alert per new signup with: timestamp, source, activation status, and direct admin link.

### High-volume mode
- Condition: >=25 signups/hour sustained for 2 consecutive hours.
- Behavior: stop per-user posts; publish rollup summary every 4 hours.
- Rollup includes: new signup count, source breakdown, activation count, errors/incidents, top actions needed.

### Incident override
- Regardless of mode, publish immediate Slack alerts for P0/P1 failures (signup failure spikes, attribution drops, trigger failures, email delivery failures).

## 14. Monitoring Env Vars + Threshold Math

### Environment variables used by launch monitoring routes
- `MANAGERTOOLS_LAUNCH_START_DATE` (default: `2026-06-09`)
	- Used by all three cron routes to define campaign day 0.
	- Launch window starts at `T00:00:00-07:00` on this date.
- `MANAGERTOOLS_ALERT_WINDOW_DAYS` (default: `10`)
	- Number of days routes remain active for launch monitoring.
	- Outside this window, routes return a structured `outside_campaign_window` skip payload.
- `MANAGERTOOLS_ALERT_THRESHOLD_PER_HOUR` (default: `25`)
	- High-volume threshold base for Slack mode switching.

### High-volume threshold formula
- Per-hour threshold: `THRESHOLD_PER_HOUR`
- Two-hour switch threshold: `HIGH_VOLUME_MIN_SIGNUPS = THRESHOLD_PER_HOUR * 2`
- Default switch point: `50` signups in trailing 2 hours.

### Route behavior by mode
- `/api/cron/managertools-signup-alerts`
	- If trailing 2h signups >= threshold: returns `mode: summary_only` and suppresses per-user Slack messages.
	- Otherwise: posts per-user Slack messages for the latest closed 15-minute window.
- `/api/cron/managertools-signup-summary`
	- Runs only when trailing 2h signups >= threshold.
	- Posts 4-hour rollup summary with total, activation, trialing, and paid counts.
- `/api/cron/managertools-day2-brief`
	- Processes source `managertools` users in age band 24-72h and dedupes via `user_events` event `managertools_day2_brief_sent`.
- `/api/cron/managertools-lifecycle`
	- Handles cohort lifecycle emails (welcome, day-7 feedback, day-30 conversion) for source `managertools`.
	- Dedupe events: `managertools_welcome_sent`, `managertools_day7_feedback_sent`, `managertools_day30_conversion_sent`.
	- Default lifecycle campaign window: `MANAGERTOOLS_LIFECYCLE_WINDOW_DAYS` (default `45`).

### Dry-run support for safe validation
- `managertools-day2-brief`: `?dry_run=1`
- `managertools-signup-alerts`: `?dry_run=1`
- `managertools-signup-summary`: `?dry_run=1`
- `managertools-lifecycle`: `?dry_run=1`

Dry-run behavior:
- No Slack messages are sent.
- No email is sent.
- No database mutation side-effects are written for notification actions.
- Response includes `dryRun: true` plus candidate or summary preview payloads for operator verification.
