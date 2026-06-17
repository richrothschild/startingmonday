# Onboarding and Time-to-Value Analysis

**Purpose:** Identify friction points in new-user onboarding for all five Starting Monday personas and recommend improvements that reduce time to first value.
**Date:** 2026-06-17
**Owner:** Product

---

## Summary

Starting Monday serves five distinct buyer types with fundamentally different activation patterns. Executives need to see signals within minutes. Coaches need to trust the workflow before referring clients. Outplacement firms need a 30-day evidence window before committing. Search firms need a single compelling output artifact (the brief) before any other conversation. White-label partners need a configured, branded environment as fast as possible.

The largest opportunities are: (1) reducing the steps between signup and first meaningful signal for executives, (2) making the coach preview self-serve and instantly convincing, and (3) reducing the perceived pilot commitment for outplacement buyers.

---

## Persona-by-Persona Analysis

### 1. Executives

**Current path to first value:**
Signup > choose mode > build target list > configure notifications > first signal arrives (24-48 hours)

**Time to first value:** 24-48 hours to first signal, 9 days median to first qualified outreach (pilot data)

**Friction points:**
- Target list setup requires the user to already know which companies they are targeting. First-time users often do not have a list ready, so they skip this step and the platform feels empty.
- The mode selection (Active vs Intelligence) is early in the flow but poorly framed. Users do not know what changes between the modes.
- The daily briefing is opt-in but is the highest-value activation habit. Many users never turn it on.
- The prep brief feature requires an interview or call context to feel useful. Until users have an actual conversation scheduled, prep briefs feel premature.

**Recommended improvements:**
1. **Starter company list:** On the target list setup screen, pre-suggest 10-15 companies based on the user's role type and most recent employer. Let users confirm or swap, so the list is never empty on day 1.
2. **Mode explainer:** A two-sentence tooltip on Active vs Intelligence, with a concrete example of how daily briefing volume differs, before the user makes the selection.
3. **Auto-enable daily briefing:** Make it opt-out rather than opt-in. Users who do not want it can turn it off; users who forgot to turn it on miss their highest-value touchpoint.
4. **"First signal" celebration moment:** When the first meaningful signal arrives (e.g., executive departure at a target company), surface a prominent notification with an explicit suggested action: "This company recently lost their CTO. This is often a 90-day window for a successor search. Here is a suggested outreach approach."
5. **Persona path pre-selection:** Add a 2-question intake during signup (current title, target title). Use this to pre-select the persona and surface role-specific guidance immediately.

---

### 2. Executive Coaches

**Current path to first value:**
Visit /for-coaches > request preview > preview call or async review > apply to partner program > refer first client > client activates > session snapshot available

**Time to first value:** 10 minutes (preview comprehension), 2-7 days (first client active), 2-4 weeks (session quality change visible)

**Friction points:**
- The coach preview currently requires a human-mediated step (a call or email thread). This creates drop-off between intent and action.
- The partner application form (at /partners) asks for practice details that feel like commitment before value is established. Coaches abandon at this step.
- Trust boundary framing is critical for coaches (they want to know the platform won't undermine their authority) but is buried in the trust pack rather than visible in the first 3 minutes.
- First client setup requires the coach to explain the platform to the client, which they cannot do confidently until they have used it themselves.

**Recommended improvements:**
1. **Self-serve interactive preview:** Replace the preview-request CTA with a 5-screen interactive flow that simulates what the coach sees before a session, including a sample session snapshot, a sample confidence trend chart, and a sample portfolio risk view. No call required.
2. **Lead with the trust boundary:** On /for-coaches, the very first content block below the headline should be the 3-sentence trust statement: what you see, what your client controls, and what recruiters never see.
3. **Lighter partner enrollment:** Change the partner application to a one-field form (email) that triggers an auto-responder with the referral link immediately. Capture more profile data in a follow-up email after trust is established.
4. **"Send to your first client" one-click:** Once a coach is enrolled, give them a single-click personalized invite link they can forward. The link explains the platform from the client's perspective, not the coach's.
5. **Week-2 check-in automation:** On day 14, send a coach a summary of their client's first two weeks of activity with one comparison: "Your client arrived prepared to 3 of 3 sessions vs. the 1-in-3 baseline without the platform." Make the ROI visible before they would otherwise notice it.

---

### 3. Outplacement Firms

**Current path to first value:**
Visit /for-outplacement > review features + pilot evidence > trust pack review > internal decision > pilot cohort scoped > counselors trained > week-1 activation > week-4 scorecard > rollout decision

**Time to first value:** 4-6 weeks (first scorecard evidence), 90 days (full rollout decision)

**Friction points:**
- The sales cycle is long by nature (B2B enterprise), but the internal champion often loses momentum waiting for procurement and legal review before the first pilot even starts.
- Counselors are skeptical because they fear added admin work. Their objection needs to be addressed before the pilot starts, not after.
- The pilot scorecard is clear (week 1-4 milestones) but the decision point at week 4 is not tied to a specific business outcome the practice leader cares about (placement rates, counselor capacity, sponsor renewal rates).
- Cohort setup requires the partner lead to manually configure everything. There is no guided onboarding wizard.

**Recommended improvements:**
1. **Lead with the counselor workflow, not the executive workflow.** On /for-outplacement, the first feature description should be: "What your counselors see before each session." This addresses the #1 adoption risk (counselor skepticism) before the internal champion has to.
2. **Self-service pilot calculator:** A simple 3-field form on the site (cohort size, current first-interview rate, sessions per counselor per week) that outputs: estimated improvement in first-interview rate, estimated hours saved per counselor, and revenue-per-placement impact. This gives the internal champion a business case to bring to the CFO.
3. **Guided cohort setup wizard:** Replace the open dashboard with a 5-step wizard for first-time cohort setup: cohort name, track selection, counselor assignment, participant invite, and scorecard baseline. One screen at a time with progress indicators.
4. **Counselor-first onboarding path:** Create a separate 20-minute onboarding flow specifically for counselors (not program leads). It should simulate one full session cycle using sample data before they interact with a real participant.
5. **Tie the week-4 decision to a specific metric:** Change the pilot scorecard CTA from "decide at week 4" to "at week 4, if activation is above 80% and first-interview rate is up by 15%+, here is the business case for full rollout." Eliminate the need for the champion to construct the argument themselves.

---

### 4. Executive Search Firms

**Current path to first value:**
Visit /search-firms > review firm value > see sample brief > request firm account > run first brief > invite first candidate

**Time to first value:** Under 1 hour (first brief generated), under 1 week (first candidate using platform)

**Friction points:**
- The sample CFO brief at /search-firms/sample-cfo-brief is compelling but static. Delivery leads want to know: "What would a brief look like for my actual current mandate?" They cannot test it without setting up an account first.
- Partner (firm leader) and delivery lead (consultant) have very different needs but land on the same page. Partners care about firm-level differentiation; delivery leads care about saving prep time on the next candidate call.
- Candidate invitation requires the search professional to explain the platform to the candidate. This adds a step and shifts the communication burden to the firm.

**Recommended improvements:**
1. **Try-before-you-commit brief generator:** Add a single-page tool at /search-firms/try that lets a visitor input role type, target company, and candidate background and receive a sample brief without an account. This proves the output quality in 3 minutes and removes the account-creation barrier for initial evaluation.
2. **Split landing page CTAs by role:** Add two explicit entry points on /search-firms: "I am a partner evaluating this for our firm" (leads to ROI evidence and comparison table) and "I have a search right now and want a better brief" (leads directly to account creation and brief generation).
3. **Candidate invitation template:** Provide a copy-paste email template that a search professional can send to a candidate, written from the candidate's perspective (what they get, why it helps them, no login friction). Removes the explanation burden from the firm.
4. **Post-brief activation nudge:** After a brief is generated, surface a one-click action: "Send this brief to your candidate." Captures the natural next step before the user leaves the browser tab.

---

### 5. White-Label Partners

**Current path to first value:**
Contact account lead > tier selection > branding configuration > cohort setup > participant invitations > first cohort active

**Time to first value:** 1 business day (branded environment live), 1 week (first cohort active)

**Friction points:**
- White-label setup currently requires human coordination with a Starting Monday account lead. This creates a 24-48 hour lag between intent and the ability to start configuring.
- Branding configuration (logo, colors, emails) is done through a settings page but there is no live preview of what the participant experience looks like. Partners are unsure if the branding looks right until a participant logs in.
- First-cohort setup overlaps with branding setup, creating confusion about sequencing (do I finish branding before I invite participants?).
- Role assignment for the partner's own team (firm admin, program manager, counselor) is not part of the default setup flow, so teams often operate with incorrect permissions for the first few weeks.

**Recommended improvements:**
1. **Self-serve tier selection and activation:** Allow partners to select their tier, enter billing, and activate without requiring a call. Gate advanced configuration (custom milestones, governance packs) behind the human onboarding, but let the basic environment activate immediately.
2. **Live branding preview:** On the branding settings screen, show a real-time preview of the participant-facing dashboard (including logo placement, primary color on navigation, and accent color on CTAs) as the partner edits settings. Eliminates the "does it look right?" uncertainty.
3. **Sequenced setup guide:** Add a visible setup checklist with 5 steps, ordered correctly: Branding > Track selection > Role assignment > Cohort creation > Participant invitations. Mark steps as complete and prevent skipping steps that have dependencies.
4. **Default role assignment:** During setup, require the partner to assign at least one firm admin and one program manager before the environment activates. This prevents the all-too-common situation where only one person has access.

---

## Universal Improvements (All Personas)

### In-product
1. **Progress indicator on signup.** Show new users how far they are from "useful." For executives: "Set up your target list to start receiving signals." For coaches: "Invite your first client to activate the session snapshot."
2. **Empty state coaching.** Every empty state (no companies in your list, no clients yet, no briefs generated) should have a single, specific, action-oriented call to action - not a generic "get started" message.
3. **First value notification.** The first time a meaningful event occurs for each persona (executive: first signal, coach: client takes action, outplacement: first participant activates), send a mobile push and email notification that names the specific event and suggests the next action.
4. **Value recap at day 7.** On day 7, send a personalized summary to each user: what they set up, what happened, and what to do next. Make "week 1 done" feel like a real milestone.

### Marketing site
1. **Persona-specific home page variation.** When a visitor arrives from a Google search for "executive coach tools" vs "outplacement software," serve a dynamically tailored hero headline and feature emphasis. The platform already has the persona routing infrastructure.
2. **Video walkthroughs.** Each persona landing page should have a 90-second screen recording showing the exact 3-click path from signup to first value moment. Text-based feature descriptions require interpretation; video requires none.
3. **Social proof placement.** Move the pilot evidence numbers (81% first-interview rate, 9-day median to first outreach) above the fold on every persona page. They are currently visible but not prominent enough to serve as the first thing a skeptical visitor sees.

---

## Priority Matrix

| Improvement | Persona | Effort | Impact | Priority |
|-------------|---------|--------|--------|----------|
| Auto-enable daily briefing | Executives | Low | High | 1 |
| Self-serve interactive preview | Coaches | Medium | High | 2 |
| Try-before-you-commit brief generator | Search firms | Medium | High | 3 |
| Starter company list on setup | Executives | Medium | High | 4 |
| Live branding preview | White label | Low | High | 5 |
| Counselor-first onboarding path | Outplacement | Medium | High | 6 |
| Guided cohort setup wizard | Outplacement | Medium | Medium | 7 |
| Lighter partner enrollment | Coaches | Low | Medium | 8 |
| Self-serve pilot calculator | Outplacement | Medium | Medium | 9 |
| Week-2 coach check-in automation | Coaches | Low | Medium | 10 |

This matrix should be reviewed monthly against actual activation and conversion metrics so priorities stay tied to measured outcomes.
