# Dashboard Experience Remediation — Tickets, Wireframe, and Plan

Date: 2026-07-10
Source audits: Page Experience Audit of /dashboard (localhost, demo user) + production screenshot analysis (startingmonday.app/dashboard, live account). Both audits in chat record 2026-07-10.
Owner: main agent (implementation) · Auditor: Page Experience Auditor (this doc is analysis/spec only)

---

## TICKET DASH-F1 — Dashboard footer + back-to-top (ready to build)

### Why
The dashboard is ~7 viewports tall in production and ends abruptly after Pattern Alerts — no footer, no return affordance, no colophon. Luxury editorial sites (NYT, The New Yorker, Vogue) always close the page with structure. This is also the cheapest luxury win on the page.

### Scope
1. New component `src/components/DashboardFooter.tsx` (server component, no client JS needed for the footer itself).
2. New client component `src/components/BackToTop.tsx` (floating button, scroll-aware).
3. Mount both in `src/app/(dashboard)/layout.tsx` — footer after `{children}` inside `.nav-content-spacer`, BackToTop alongside `CommandPalette`.

### Footer spec (dark-shell colophon, NOT the marketing SiteFooter)
Do not reuse `src/components/SiteFooter.tsx` (it is `bg-slate-900` marketing chrome with acquisition links like "Free Profile Grade" — wrong register for a signed-in executive). Build a dashboard variant:

- Container: `<footer>` with `border-t border-white/10`, transparent bg over the slate-950 canvas, `px-4 sm:px-6 py-10`, inner `max-w-6xl mx-auto` (match main content width used by the dashboard page).
- Row 1 — wordmark: `STARTING MONDAY` in the existing header treatment (white + orange-500 "MONDAY"), uppercase, tracking-[0.14em], text-[13px].
- Row 2 — three link columns (grid `grid-cols-2 sm:grid-cols-3`, text-[12px] text-slate-400, hover:text-slate-200):
  - Product: Briefing (/dashboard/briefing), Signals (/dashboard/signals), Contacts (/dashboard/contacts), Calendar (/dashboard/calendar), Weekly plan (/dashboard/plan)
  - Account: Profile (/dashboard/profile), Settings (/settings), Help (/dashboard/help)
  - Company: Privacy (/privacy), Terms (/terms), Security (/security)
- Row 3 — trust line (text-[11px] text-slate-500): "Private by default. We do not share your data with recruiters, employers, or third parties." (exact string already used on /login — keep verbatim for voice consistency).
- Row 4 — `© {new Date().getFullYear()} Starting Monday. All rights reserved.` + inline "Back to top ↑" anchor link (`href="#top"`; add `id="top"` to the layout wrapper or scroll via JS).
- Mobile: footer needs `pb-24` (or equivalent) so the fixed `BottomNav` (56px+ tall) does not cover the last row.
- No orange CTAs in the footer. Zero. It is a colophon, not a conversion surface.

### Back-to-top button spec
- Client component; listens to scroll (`requestAnimationFrame`-throttled or IntersectionObserver on a top sentinel).
- Appears only after ~2 viewport-heights of scroll (`window.scrollY > window.innerHeight * 2`).
- Position: `fixed bottom-20 right-4 z-40` on mobile (above BottomNav), `sm:bottom-6 sm:right-6`.
- Style: ghost dark-shell — `rounded-full border border-white/15 bg-slate-950/80 backdrop-blur px-3 py-2 text-[12px] text-slate-200 hover:border-white/35`. NOT orange, NOT white (the existing "Need help?" pill is `bg-white` — do not copy it; see DASH-P1-03).
- Content: `↑ Top` with `aria-label="Back to top"`.
- Click: `window.scrollTo({ top: 0, behavior: 'smooth' })`; respect `prefers-reduced-motion` (instant scroll).
- Must not overlap the "Need help?" pill (bottom-right) — place BackToTop above it or move Need-help left; verify at 390×844 and 1512×960.

### Acceptance criteria
- [ ] Footer renders on every /dashboard/* route (mounted in layout, not per page).
- [ ] Footer last row fully visible on mobile with BottomNav present (390×844).
- [ ] Back-to-top hidden at page load, visible after 2 viewports, returns to top, keyboard-focusable.
- [ ] No new `bg-white` opaque surfaces; passes `npm run ux:luxury:static`.
- [ ] No layout shift (footer is static flow content, button is fixed).

Estimated size: S (2 components + 1 layout edit).

---

## SPEC DASH-W1 — Editorial-lede restructure (wireframe level)

### Design intent
The dashboard currently runs five competing "what do I do now?" systems (Start here, Today's three actions, Next best action, Quick actions/Power views, Weekly plan) at equal visual volume. The editorial model (NYT front page / New Yorker issue / Vogue feature well) ranks stories: one lede, a river of departments, one index, one colophon.

### Lede selection rule (deterministic, no LLM)
Priority order — first match wins:
1. Interviewing-stage company with a due/overdue action or fresh signal → lede = that company + its next action (production today: City of San Jose + Greg Nelson warm path).
2. Overdue follow-up (oldest first) → lede = that follow-up.
3. Freshest high-relevance signal on a tracked company → lede = signal + suggested angle.
4. Fallback: weekly plan's next uncommitted move.

### Wireframe (desktop ≥1024px)

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER (unchanged shell; nav trimmed — see DASH-P2-11)             │
├────────────────────────────────────────────────────────────────────┤
│ masthead                                                           │
│   THIS WEEK'S OPERATING RHYTHM            (eyebrow, orange, caps)  │
│   Good morning, Richard.                  (serif display, 32px)    │
│   Friday, July 10, 2026                   (slate-400, 13px)        │
├────────────────────────────────────────────────────────────────────┤
│ THE LEDE (one card, full width, largest type block on page)        │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ TODAY'S LEAD                              INTERVIEWING (chip)  │ │
│ │ City of San Jose                          (serif, 24px)        │ │
│ │ Greg Nelson (Recruiter) is your warm path. Restructuring       │ │
│ │ signal Jul 3: $5.5B budget, org restructuring under way —      │ │
│ │ concrete reason to re-engage while it is fresh.  (full text,   │ │
│ │ never truncated)                                               │ │
│ │ [ Draft the outreach ]   Prep brief · Company page  (1 orange  │ │
│ │                          CTA max; rest are quiet links)        │ │
│ └────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────┤
│ TODAY  (the ONLY action system; absorbs "Today's three actions",   │
│         "Next best action", and the three "Start here" cards)     │
│   ── thin rule ──                                                  │
│   2. Generate prep for City of San Jose            25 min  [Open] │
│   3. Review the freshest market signals            15 min  [Open] │
│   (action 1 = the lede; list shows remaining 2; notes/reflection  │
│    collapsed behind a single "Add note" affordance)               │
├──────────────────────────────┬─────────────────────────────────────┤
│ PIPELINE (dept.)             │ SIGNALS (dept.)                     │
│ ── rule ──                   │ ── rule ──                          │
│ Top 5 by fit, stage chips    │ 3 freshest pattern alerts,          │
│ "View all 25 →" to full      │ deduped per company+pattern,        │
│ table (moves off front page  │ entity-filtered (no sports/test)    │
│ or into collapsed tier)      │ "All signals →"                     │
├──────────────────────────────┴─────────────────────────────────────┤
│ RELATIONSHIPS (dept.)   Warm paths first; contact stats one line   │
├────────────────────────────────────────────────────────────────────┤
│ THE WEEK (dept.)        Weekly plan one-liner + momentum, ONE      │
│                         score vocabulary (absorbs health/momentum) │
├────────────────────────────────────────────────────────────────────┤
│ INDEX (single strip)    Quick actions + Power views merge into one │
│                         row of quiet text links, or ⌘K only        │
├────────────────────────────────────────────────────────────────────┤
│ FOOTER (DASH-F1)        wordmark · columns · trust line · © · Top ↑│
└────────────────────────────────────────────────────────────────────┘
```

Mobile (≤640px): masthead → lede → TODAY list → departments stack in same order; INDEX collapses into ⌘K/BottomNav; footer above BottomNav.

### Typography & surface rules (Vogue/NYT discipline)
- Exactly three text scales below the masthead: department label (11px caps, orange-300), headline (serif 18–24px), body (13–14px slate-200/300).
- Departments separated by `border-t border-white/10` rules + label — not nested cards. Cards reserved for the lede and action rows only.
- One orange CTA per viewport maximum. Everything else: quiet links or ghost buttons.
- Zero-state cards do not render (a "0 follow-ups due now" card is not a story; NYT doesn't print "No news in Sports today").
- Nothing truncates mid-sentence; long signal text wraps or links to the company page.

### What gets deleted/demoted (explicit)
- "Start here" 3-card row → deleted (its counts move into department headers; its intent lives in the lede).
- "Next best action" cream card → deleted (lede replaces it).
- Quick actions (7) + Power views (7) → merged into INDEX strip or ⌘K.
- "Today at a glance" stat cards → become one-line department headers (e.g., "PIPELINE — 25 companies · 12 of 25 scanned · 8 signals this week").
- Full 25-row table → top 5 + "View all"; collapsed tiers stay but inherit dark-shell palette (see plan).

Estimated size: L (page.tsx recomposition + section component edits). Ship behind a flag or on staging first; re-audit after (fixes create new contradictions — lessons bank).

---

## PLAN — Fix every issue (both audits, prioritized)

### Phase 0 — Data integrity & trust (P0) — do first, independent of layout
| # | Issue | Fix | Type | Evidence |
|---|---|---|---|---|
| 0.1 | Test data in production pipeline ("SLO Test Co 1779771948837", second test row) | Delete test rows from production account; add guard: block company names matching `/test/i` + timestamp pattern in non-staging envs, or scope test fixtures to demo user | surgical + guard | prod screenshot 5 |
| 0.2 | "Acme" fixture in production Pattern Alerts | Purge fixture-derived signals for real users; assert signal source ≠ sample in production signal queries | surgical | prod screenshots 6–7 |
| 0.3 | Entity conflation: local demo "Arcadia" (health data) shows Arcadia Biosciences filings; production "Green Bay Packers" GM promotion rendered as C-suite opening | Signal pipeline: verify CIK/entity binding on company↔filing match; add entity-type filter (municipal/sports/nonprofit "general manager" ≠ exec opening); surface match-confidence and suppress low-confidence alerts | design + surgical | local DOM ref e303; prod screenshot 7 |
| 0.4 | "Scanner status: 12/12 scanned" while Companies = 25 | Fix denominator query or relabel "12 of 25 scanned" | surgical | prod screenshot 1 |

### Phase 1 — Standards violations users consciously notice (P1)
| # | Issue | Fix | Type |
|---|---|---|---|
| 1.1 | 11 opaque `bg-white border-slate-200` cards inside "Profile and intelligence modules" tier (dark canvas) | Convert to dark-shell tokens (`bg-white/5 border-white/15`, light text) in `src/app/(dashboard)/dashboard/dashboard-profile-intelligence-section.tsx` lines 90, 173, 177, 187, 204, 222, 236, 249 | surgical |
| 1.2 | Cream "Next best action" card on dark canvas | Recolor now (surgical); deleted later by DASH-W1 | surgical |
| 1.3 | "Need help?" pill is opaque `bg-white` | Ghost dark-shell restyle (align with BackToTop style) | surgical |
| 1.4 | Raw enum badge `PATTERN_ALERT` on warm-path card | Label map: PATTERN_ALERT → "Pattern alert" (badge dictionary where warm paths render) | surgical |
| 1.5 | Clock-blind greeting ("Good evening" at 3:24 PM local) | `dashboard-greeting-block.tsx`: use viewer's resolved browser timezone (already computed in fallback path) instead of `briefing_timezone`; render date the same way | surgical |
| 1.6 | Duplicate Waystar narrative ×3 (2 pattern alerts + 1 company signal) | Dedupe: suppress same company+pattern within N days; don't repeat across Pattern Alerts and Company Signals modules | surgical |
| 1.7 | Three contradictory health verdicts ("Steady start" / "24/100 Needs cadence" / "Momentum 30 · below target") | One score vocabulary with scoped sub-scores; single narrator (feeds DASH-W1 "THE WEEK" dept.) | design |
| 1.8 | Five competing do-now systems | DASH-W1 lede restructure (above) | design |
| 1.9 | Third-person copy leak ("aligning with the VP's target sectors") in Opportunity Radar | Fix generation prompt/template to second person; add lint for "the VP's/the executive's" in user-facing generated copy | surgical |

### Phase 2 — Structure, navigation, truth-of-label (P2)
| # | Issue | Fix | Type |
|---|---|---|---|
| 2.1 | Header nav 10–11 items (budget ≤8) | Consolidate: Chat/Outreach/Help under ⌘K or a single "More" affordance; Admin stays staff-only | design |
| 2.2 | 5–6 differently-labeled CTAs to /dashboard/briefing (also 5× calendar, 5× signals) | After DASH-W1: header + one contextual CTA max per route | design (falls out of W1) |
| 2.3 | "3 follow-ups due now" labeling 62–67-day-overdue items | Label "overdue" when past due; humanized age | surgical |
| 2.4 | Data rot: "has been 8 days since intro call" frozen in stored task text | Strip relative-time phrases at task creation; render age dynamically | surgical |
| 2.5 | Tenet card "Companies" self-links to /dashboard (dead end); mobile nav uses /dashboard?focus=pipeline | Point both at `?focus=pipeline` anchor behavior | surgical |
| 2.6 | "Full profile ?" literal `?` where arrow belongs | `dashboard-profile-intelligence-section.tsx` line 154 → "Full profile →" | surgical |
| 2.7 | Unprompted inputs ×5 (3 notes, reflection, search) | Collapse behind "Add note" affordances (part of DASH-W1 TODAY block) | design |
| 2.8 | Unexplained "1 Active" stat in intel tier duplicating/contradicting top metrics | Name it ("1 active conversation") or remove the duplicate stat row | design |
| 2.9 | Footer + back-to-top missing | TICKET DASH-F1 | surgical |
| 2.10 | Sector data leaks: 8x8 "Manufacturing", Stripe "-", "Apple Computer" | Render "—" for empty sector; enrichment pass to re-derive sector; user-editable inline | surgical + backlog |
| 2.11 | Action copy: "Work Greg Nelson at City of San Jose" + mid-sentence "…" truncation | Template rewrite ("Re-engage Greg Nelson…"); never truncate the reason — wrap or link | surgical |

### Phase 3 — Polish & hygiene (P3)
| # | Issue | Fix |
|---|---|---|
| 3.1 | "Roles forming: A role window may be forming." redundancy | Rewrite: "Roles forming: new leverage for your live City of San Jose process." (production already has the better copy — unify) |
| 3.2 | "--" double hyphen in seeded task text | Em dash |
| 3.3 | 3 unused font preload console warnings | Fix `as`/usage or remove preloads |
| 3.4 | "Medium momentum" verdict at 0-of-3 complete | Neutral until first completion ("Day not started") |

### Sequencing & verification
1. Phase 0 ships first (independent, highest trust impact). Verify: reconcile displayed counts vs. independent DB query; production spot-check.
2. Phase 1 surgical items (1.1–1.6, 1.9) ship as one palette/copy PR. Gates: `npm run ux:luxury:static`, `npm run ux:rubric:pages`, `npm run ux:cognitive:all-pages`.
3. DASH-F1 (footer/back-to-top) ships in parallel — no dependency on W1.
4. DASH-W1 + design-decision items (1.7, 1.8, 2.1, 2.2, 2.7, 2.8) as one staging-first restructure PR.
5. Re-run full three-pass audit on staging after W1 (fixes create new contradictions — lessons bank), then promote via the staging→main PR flow.

### Success criteria (re-audit targets)
| Axis | Now | Target |
|---|---|---|
| Cognitive fluency | C-/C+ | A- (no test data, no enums, no contradictions, no truncation) |
| Cognitive load | D | B+ (1 do-now system, ≤8 nav, ≤2 CTAs/route, ≤1 open input) |
| Trust integrity | C- | A- (entity-verified signals, one health verdict, reconciled counts) |
| Hidden-tier consistency | D | A- (zero opaque light surfaces, tiers pass same gates as page) |
| Luxury rubric | ~16/25 | ≥23/25 |
