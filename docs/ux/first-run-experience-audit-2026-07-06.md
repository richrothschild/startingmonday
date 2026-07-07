# First-Run Experience Audit — Post-Landing-Page Flow

Date: 2026-07-06
Trigger: Carolyn Lee feedback — "the landing page works, then you lost me."
Scope: /signup → auth → /onboarding wizard → /dashboard/start → /dashboard/briefing
Evidence base: code review of the live flow (signup page, onboarding-form.tsx 1,436 lines, start page, briefing page, onboarding-flow.json, event instrumentation).

---

## 1. The actual flow a new user experiences

1. /signup — social sign-in (Google/Apple) or email+password, optional referrer name/company fields.
2. Email path: "check your email" wait state. OAuth path: provider consent → /auth/callback.
3. Callback sends the user to /dashboard/briefing by default.
4. Onboarding guard immediately redirects to /onboarding (double redirect on first login).
5. 7-step wizard (quick path 5 steps): name → role lane → situation → profile import → target companies → briefing time → first-value preview.
6. Redirect to /dashboard/start: a 6-task checklist (profile, company, prep brief, contact, briefing time, follow-up).
7. User finally reaches /dashboard/briefing — a dense, tenet-organized intelligence surface.

---

## 2. What is working (genuinely strong)

| Strength | Evidence |
|---|---|
| Branching by intent | Quick path (5 steps), advanced path (7), low-energy mode, passive-searcher path that auto-sets weekly frequency. Few products do this. |
| First-value moment inside onboarding | Step 6 streams a live intelligence preview for the user's first company — value before the dashboard, the single best moment in the flow. |
| Seeded defaults | Quick path auto-seeds target companies by persona; name pre-filled from profile; import fallback saves raw text rather than failing. |
| Instrumentation | onboarding_started / step_completed / nudge_shown (480s) / first_value_ready (≤600s target) / elapsed-seconds + manual-field-reduction on completion. This is top-decile telemetry. |
| Escape hatches | Skip, quick-start, manual mode when PDF import fails, "update anytime from profile" reassurance. |
| Privacy framing | Private-by-default messaging present at onboarding and signup. |

## 3. What is not working (ranked by likely drop-off impact)

1. **Two onboardings.** The wizard collects companies and briefing time; then /dashboard/start asks the user to "Add your first target company" and "Set up your daily briefing" again as checklist tasks. A user who just did those sees an apparently unfinished checklist for work already done. This is the most likely source of Carolyn's "you lost me" — the product appears to forget what you told it.
2. **Weak opening question.** Step 0 is "What do we call you?" — zero product value, and OAuth users' names are already known. The first screen after signup should restate the promise ("we find roles before they're posted — tell us where to look"), not administrivia.
3. **Double redirect on arrival.** callback → /dashboard/briefing → guard → /onboarding. The user glimpses or waits through a dashboard they can't use yet. Route new users straight to /onboarding from callback.
4. **No narrative thread.** Landing page sells "taking your place before the competition sees the opening." Onboarding never repeats that promise; each step explains its mechanics, not its contribution to the outcome. Steps feel like a form, not a build-up.
5. **Checklist fatigue at /dashboard/start.** Six tasks, several duplicative, presented as equal-weight. Best practice is ONE next action ("Generate your first prep brief for {company}") with the rest collapsed.
6. **Unverifiable claim in code.** The sr-only onboarding summary claims "improves signal relevance and prep brief quality by at least 25%" — the exact kind of unproven number Carolyn flagged, and it conflicts with the truthfulness contract in AGENTS.md.
7. **Briefing page as first destination is dense.** 800+ lines of tenet-organized content for a user whose account has one company and no history. First-session state should be a guided, mostly-empty state, not the full instrument panel.
8. **Email-confirmation dead end.** The "check your email" state offers no preview, no demo link, no expectation-setting on timing — a cold pause at peak motivation.

---

## 4. Devil's advocate

**Their case:**
1. "Carolyn is one person, n=1, who spent 20 minutes on the site. You're re-architecting on anecdote."
2. "Your instrumentation already targets ≤10 minutes to first value; if the events say most users finish, there is no problem."
3. "The two-surface design (wizard + checklist) is deliberate: wizard = setup, checklist = activation. Duplication is reinforcement, not confusion."
4. "Dense briefing = the product's differentiation. Dumbing down the first session hides exactly what justifies the price."
5. "Every hour on onboarding polish is an hour not spent on the proof artifact, which you decided is the #1 leverage item."

**Overcoming each objection:**
1. Anecdote vs. data: Carolyn's feedback matches the internal LANDING_PAGE_AUDIT_REPORT finding (continuation confuses). Two independent sources = signal, not anecdote. Resolution: pull the funnel numbers (already instrumented) before building; fix only steps with measured drop-off.
2. Completion ≠ comprehension. Users can finish a wizard and still not understand what the product will do for them. Add a one-question comprehension check ("What will Starting Monday do for you next?") or measure day-1 return rate, not just completion.
3. If duplication were reinforcement, checklist items would show as pre-completed with a checkmark ("Done in onboarding ✓"). They partially do (done flags) but the framing is "do these 6 things," not "2 done, 1 next." A framing fix, not a rebuild — cheap to test.
4. Density objection is answered by progressive disclosure, not removal: first session shows the one company's live signals + one action; the full panel unlocks as data accrues. Differentiation preserved, cognitive load staged.
5. Correct priority — which is why the recommendation list below is ordered by effort. Items 1-4 are copy/routing changes measured in hours, not weeks. They compound the proof work: proof gets people in the door, first-run keeps them.

---

## 5. What elite AI users ask in this situation

1. "What does the funnel data say?" — Where exactly do users drop between signup and first prep brief? (You have the events; query before building.)
2. "What is the time-to-first-value, measured, p50 and p90?" — Not the target (600s), the actual.
3. "What is the ONE aha moment, and how many clicks to reach it?" — Here: the streaming intel preview. It should be reachable in ≤3 interactions.
4. "What happens if the user does nothing?" — Does the day-1 email/briefing still deliver value with a half-finished setup? (Passive path suggests yes; verify.)
5. "Can I watch 5 session replays?" — Instrument or record real first sessions rather than reasoning from code.
6. "What's the smallest experiment that would falsify 'onboarding is fine'?" — e.g., A/B the checklist framing; measure day-1 return.
7. "Which step would we delete if forced to delete one?" — forces ranking of marginal value per step (candidate: Step 0 name).

## 6. What world-class UX experts would say

- **Nielsen (heuristics):** Violations of #1 visibility of system status (double redirect, silent gate), #6 recognition over recall (checklist doesn't acknowledge wizard answers), #8 aesthetic/minimalist (6-task list, dense first briefing).
- **Krug (Don't Make Me Think):** Every step must answer "why am I being asked this?" Steps 2-3 explain mechanics but not payoff. Add one line per step tying it to the promise.
- **Fogg / behavior design:** Motivation is highest in the 60 seconds after signup; spend it on the ability-building action (add target company), not the low-signal action (name).
- **Julie Zhuo-style product framing:** The first session should be designed backwards from the "wow" (live signal on a company they care about), with everything non-essential pushed after the wow.
- **Growth practice (Reforge-style):** Setup ≠ activation ≠ habit. The current flow blends setup and activation surfaces; separate them: wizard = minimal setup to reach the wow; checklist = habit-forming loop framed as progress already made.

## 7. Rubrics, metrics, and industry-standard methods that apply

| Framework | Application here |
|---|---|
| **Google HEART** | Happiness (post-onboarding CSAT/SEQ), Engagement (day-1 briefing open), Adoption (activation = first prep brief), Retention (week-1 return), Task success (wizard completion by path). |
| **Time-to-First-Value (TTFV)** | Already instrumented (first_value_ready). Publish p50/p90 internally; top products hit <5 min. |
| **Activation rate** | Define one activation event (first prep brief generated) and track signup→activation. B2B SaaS benchmark: 20-40%; top 1%: >60%. |
| **SEQ (Single Ease Question)** | One 1-7 rating after wizard completion; industry mean 5.5. |
| **SUS** | 10-item survey for pilot users (Carolyn's cohort); >80.3 = top 10%, >85 = top 1% territory. |
| **Nielsen heuristic evaluation** | Formal pass on the 5 surfaces with 2+ evaluators; catalogued above informally. |
| **PURE method (Sauro)** | Expert-rated effort score per step of the flow; targets ≤2 avg. |
| **Funnel cohort analysis** | signup → confirm → wizard step-N → complete → first brief → day-7 return, split by path (quick/advanced/low-energy/passive) and channel. |
| **5-second test + first-click test** | For the /dashboard/start page: do users know what to do first? |

## 8. How to be sure the process is top 1%

Top 1% is a measured claim, not a design opinion. The bar:

1. **Define the activation metric** (first prep brief within 24h of signup) and instrument the full funnel (mostly done).
2. **Establish baseline this week** from existing events — no new code needed.
3. **Set benchmark targets:** wizard completion >80% (started→finished), TTFV p50 <5 min, signup→activation >60%, day-7 return >40%, SUS >85, SEQ >6.
4. **Run the fixes in impact order** (see below), one variant at a time, and only keep changes that move a named metric.
5. **Quarterly external validation:** 5 moderated first-session tests with real executives (Carolyn's clients are the ideal panel — this doubles as the design-partner pilot).
6. **Publish the scorecard internally** the same way the backtest scorecard works: wins and misses side by side. Top-1% teams are distinguished by measuring themselves honestly, not by any specific pattern.

## 9. Recommended fixes, ordered by leverage-per-effort

| # | Fix | Effort | Metric it moves |
|---|---|---|---|
| 1 | Checklist acknowledges wizard work: "2 of 6 done — next: generate your first prep brief" with one highlighted action | Hours | Activation rate |
| 2 | Route first-login callback directly to /onboarding (skip briefing bounce) | Hours | TTFV, perceived speed |
| 3 | Replace Step 0 with promise restatement + company-first question; collect name inline later (prefill from OAuth) | Hours | Wizard completion |
| 4 | Add one "why this matters" line per wizard step tying it to the shortlist promise | Hours | Completion, comprehension |
| 5 | Remove/replace the unverified "25%" claim with an honest, provable statement | Minutes | Trust (Carolyn test) |
| 6 | Email-confirm screen: add expected timing + link to /demo while waiting | Hours | Confirm-rate |
| 7 | First-session briefing: guided empty state (one company, one signal, one action) with full panel unlocking after day 2 | Days | Day-7 return |
| 8 | Post-wizard SEQ prompt (1 question) | Hours | Measurement foundation |

---

*Prepared as an inventory-grounded audit; funnel numbers should be pulled from `user_events` before implementing items 7+ per the verification-first contract.*
