# Page Experience Audit - /dashboard and /dashboard/contacts - 2026-07-11

## Scope and method
Live-rendered audit only, using the current browser session against http://localhost:3000.

- Routes inspected: /dashboard and /dashboard/contacts
- Viewports: desktop render and mobile 390x844
- Hidden tiers: dashboard collapsed disclosures expanded and re-audited on desktop and mobile
- Chrome: shared footer and mobile bottom nav checked on both routes
- Evidence sources: live DOM snapshots, viewport measurements, screenshots, and console events from the same run
- Auth state: authenticated dashboard shell was already present in the live session

## Pass 1 - Surface (fluency + load)
1. P3: I did not find broken sentences, duplicate copy blocks, or glyph fallback issues on either route. The dashboard and contacts copy are consistent and readable, and the first element on both routes is value-oriented rather than a warning banner.

2. P3: The mobile dashboard action stack now places the first real action card within the initial viewport. On 390x844, the first action card begins at y 581.5, comfortably before the fold, so the earlier spacing problem is resolved.

## Pass 2 - Deep structure (data + truthfulness + semantics)
1. P2: The dashboard live session logged a real fetch failure tied to the profile path. Evidence from the browser event stream: `dashboard_profile_error` with `TypeError: fetch failed` and `userId: 00000000-0000-0000-0000-000000000000`. Even though the route still rendered, this is a trust risk because profile-backed surfaces can silently degrade.

2. P3: I did not verify any cross-panel number mismatches. The dashboard's 0 signals / 0 overdue follow-ups / 0 companies story is internally consistent, and the contacts route's 0 network health / 0/5 covered types / Missing Recruiter state also reconciles.

3. P3: Page titles and main headings are semantically correct on both routes. I did not find a double-suffixed title, heading-order break, or label/destination mismatch in the verified DOM.

## Pass 3 - Hidden state, mobile, coherence
1. P3: The contacts route emits unused preload warnings in the live console. Evidence from the browser event stream includes four warnings such as "The resource ... was preloaded using link preload but not used within a few seconds from the window's load event" for fonts and a CSS chunk. This is low severity, but it is real hygiene debt.

2. P3: The shared chrome is coherent across both routes. The desktop footer link sets match, and the mobile bottom nav is the same five-item set on dashboard and contacts. I did not find a cross-page chrome mismatch or horizontal overflow in the verified mobile viewport.

3. P3: Dashboard hidden disclosures expand cleanly and do not introduce contradictory copy. The expanded panels for campaign health, profile setup, and weekly performance stay internally consistent after opening on both desktop and mobile.

## Persona council verdicts
1. Ambitious VP IT: Works: the dashboard gives me a concrete next move, and the contact import path makes the relationship network feel actionable. Must change: the profile fetch failure still needs a hardening pass.

2. Sitting CIO: Works: the route shows me operating state and summary counts without noise, which is useful for quiet monitoring. Must change: the profile fetch failure makes me wonder how much of the intelligence surface is actually complete.

3. Displaced technology executive: Works: the dashboard and contacts pages tell me exactly where to start. Must change: I need the profile-backed surfaces to fail more gracefully.

4. PE-backed transformation operator: Works: the hidden dashboard panels expose cadence, decision timing, and setup structure when I need depth. Must change: the live fetch error suggests some of the deeper profile logic is still brittle.

5. Burned-out technology executive: Works: the copy stays calm and specific, and there is a clear next action instead of a pile of choices. Must change: the low-level fetch failure could still erode confidence if it recurs.

6. Executive recruiter: Works: the contacts route presents a straightforward network model and an import path that could support sourcing workflows. Must change: the preload warnings and dashboard fetch failure signal that the plumbing still needs tightening before this feels production-grade.

## Grade table
| Axis | Grade | Held back by |
|---|---|---|
| Cognitive fluency | A- | Clean copy and hierarchy, but the dashboard still has a trust-side profile failure |
| Cognitive load | A- | The mobile action stack is now within the initial viewport |
| Trust integrity | B | Live `dashboard_profile_error` fetch failure, even though displayed counts reconcile |
| Hidden-tier consistency | A- | Expanded dashboard modules stay coherent; contacts and chrome behave consistently |

## Prioritized fixes
1. P2 safe surgical patch: harden the dashboard profile fetch path so `dashboard_profile_error` stops logging in the live session and profile-backed panels fail gracefully instead of partially degrading.

2. P3 safe surgical patch: remove or retune the unused preload hints on contacts so the font/CSS preload warnings stop appearing in the console.

3. P3 backlog item: keep the shared footer and mobile nav composition as-is unless a broader shell change is planned; the current cross-page chrome is consistent and verified.
