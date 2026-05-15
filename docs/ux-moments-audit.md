# Starting Monday — UX Moments Audit

For each key moment in the product, score three dimensions:
- **Dopamine (1-10):** Does this moment create a positive feeling? 10 = strong reward, 1 = flat or negative.
- **Cognitive Load (1-10):** How much thinking does the user have to do? 1 = effortless, 10 = overwhelming.
- **Friction to Next Step (1-10):** How hard is it to take the next action from here? 1 = obvious and easy, 10 = unclear or costly.

**Target state for an elite product:**
- Dopamine: >= 7 at key activation moments; >= 5 throughout
- Cognitive Load: <= 3 at acquisition and first login; <= 5 elsewhere
- Friction: <= 2 at every moment where we want action

Scores are current-state assessments. Target column shows the goal. Delta column shows the gap.

---

## Acquisition Moments

| Moment | Dopamine | Cognitive Load | Friction | Target D | Target CL | Target F | Priority |
|--------|----------|---------------|---------|----------|-----------|---------|---------|
| Homepage hero: "The role was never posted. You found it anyway." | 7 | 2 | 3 | 8 | 2 | 2 | Medium |
| Homepage subline (competitive alternative framing) | 5 | 3 | 3 | 7 | 2 | 2 | High — naming the alternative (spreadsheet + LinkedIn) not done yet |
| SITUATIONS card selection | 7 | 3 | 2 | 8 | 2 | 2 | Low — working well |
| Privacy policy visibility for Arc 2 users | 3 | 5 | 8 | 6 | 2 | 1 | CRITICAL — known conversion blocker |
| Signup form | 5 | 3 | 3 | 6 | 2 | 2 | Low |
| Pricing page: Monitor / Active / Executive | 5 | 5 | 4 | 7 | 3 | 3 | Medium — Executive tier value unclear |
| Pricing page: Executive tier value statement | 4 | 4 | 4 | 8 | 2 | 2 | High — needs transformation language |

---

## Onboarding Moments

| Moment | Dopamine | Cognitive Load | Friction | Target D | Target CL | Target F | Priority |
|--------|----------|---------------|---------|----------|-----------|---------|---------|
| Onboarding step 1: name + persona | 5 | 3 | 2 | 6 | 2 | 2 | Low |
| Onboarding step: target companies input | 6 | 4 | 3 | 7 | 3 | 2 | Low |
| Onboarding step: employment status / timeline | 5 | 4 | 3 | 6 | 3 | 2 | Low |
| Onboarding completion → /dashboard/start | 6 | 3 | 3 | 8 | 2 | 2 | Medium — could celebrate completion more |

---

## First Dashboard (Path-Specific)

| Moment | Dopamine | Cognitive Load | Friction | Target D | Target CL | Target F | Priority |
|--------|----------|---------------|---------|----------|-----------|---------|---------|
| Campaign path first dashboard (pipeline visible) | 6 | 5 | 3 | 7 | 4 | 2 | Medium |
| Nurture path first dashboard (between_roles + immediately) | 3 | 7 | 6 | 6 | 3 | 2 | CRITICAL — anxious user sees full pipeline with no acknowledgment |
| Watcher path first dashboard (employed, not searching) | 4 | 5 | 5 | 6 | 3 | 2 | High — should feel like intelligence, not job search |
| Burned-out executive first dashboard | 2 | 8 | 7 | 6 | 2 | 1 | CRITICAL — one action only |
| Empty state: no companies | 2 | 6 | 4 | 6 | 2 | 1 | High — needs single clear action + "why this matters" |
| Empty state: no contacts | 2 | 6 | 5 | 6 | 2 | 1 | High |
| Empty state: no signals | 2 | 4 | 5 | 5 | 2 | 2 | Medium — at least it's self-explanatory |

---

## Core Product Moments

| Moment | Dopamine | Cognitive Load | Friction | Target D | Target CL | Target F | Priority |
|--------|----------|---------------|---------|----------|-----------|---------|---------|
| First signal alert received | 8 | 2 | 2 | 9 | 2 | 1 | Low — this is the activation moment hypothesis |
| First prep brief generated | 8 | 2 | 2 | 9 | 2 | 1 | Low — strong moment if reached |
| Company discovery (Discover page) | 6 | 3 | 3 | 7 | 2 | 1 | Medium — good page, not surfaced proactively |
| Company suggestion on dashboard (Build 1 pending) | — | — | — | 8 | 2 | 1 | CRITICAL — doesn't exist yet |
| Contact suggestion on dashboard (Build 1 pending) | — | — | — | 7 | 2 | 1 | CRITICAL — doesn't exist yet |
| Conversation timing suggestion (Build 1 pending) | — | — | — | 8 | 2 | 1 | CRITICAL — doesn't exist yet |
| Adding a contact → confirmation | 5 | 2 | 2 | 7 | 1 | 1 | Medium — variable reward missing |
| Advancing a company stage | 5 | 2 | 2 | 7 | 1 | 1 | Medium — variable reward missing |
| Running a strategy brief | 7 | 2 | 2 | 8 | 2 | 1 | Low |
| Stall nudge (in-app) | 5 | 3 | 2 | 7 | 2 | 1 | Medium — works but could be warmer |
| Stall nudge (email) | 5 | 3 | 3 | 7 | 2 | 2 | Medium |
| Weekly goal widget | 5 | 3 | 2 | 7 | 2 | 2 | Low |

---

## Placed Moment (Arc 9)

| Moment | Dopamine | Cognitive Load | Friction | Target D | Target CL | Target F | Priority |
|--------|----------|---------------|---------|----------|-----------|---------|---------|
| Placed page: congratulations | 7 | 2 | 3 | 9 | 1 | 1 | High — highest trust moment, highest referral potential |
| Placed page: Switch to Monitor offer | 6 | 3 | 3 | 7 | 2 | 2 | Medium |
| Placed page: refer a peer (pending) | — | — | — | 8 | 1 | 1 | CRITICAL — referral flywheel starts here |

---

## What This Audit Tells Us

**Three moments are broken:**
1. Nurture path first dashboard — cognitive load 7, friction 6. A person who just lost their job is being asked to build a pipeline. Fix: one warm card, one action.
2. Privacy visibility for Arc 2 — friction 8. Employed executives can't find the answer to "will my employer see this." Fix: plain-language section, visible before paywall.
3. Empty states — cognitive load 6, friction 4-5. No single clear action, no "why this matters." Fix: each empty state gets one primary action + one sentence of context.

**Three moments are strong but underused:**
1. First signal alert — dopamine 8, but users have to wait for a signal to fire. The activation moment depends on something we control (scanner cadence). Run the scanner within 24 hours of signup for new users.
2. First brief generated — dopamine 8, but users have to navigate to it. Surface a "Generate your first brief" prompt on the first dashboard.
3. Placed page — dopamine 7, highest trust moment, but the referral ask doesn't exist yet. This is the highest-LTV moment in the product and it's not being used.

**One pattern across all broken moments:**
The product asks for action before acknowledging emotional state. The nurture path user is scared. The empty state user is uncertain. The placed user is relieved and proud. The product should name the emotion before asking for the action.

---

## Variable Reward Opportunities (Nir Eyal)

These are moments where a small copy addition creates a reward loop without UI changes:

| Action | Current response | Proposed copy addition |
|--------|-----------------|----------------------|
| Contact added | Silent (just appears in list) | Brief banner: "Contact added. Your search is more connected than it was 60 seconds ago." |
| Company stage advanced | Silent | Brief banner: "Stage updated. Progress like this is what separates campaigns from wishes." |
| First brief generated | Brief appears | Add: "This is what it looks like to walk in as a peer." |
| Company added from Discover | Card turns green | Add: "Added. You now have a reason to have a conversation." |

---

*Updated: May 2026. Re-audit quarterly or after any major UX change.*
