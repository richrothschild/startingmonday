# Dashboard Modernization Plan
**Align briefing dashboard with home page luxury standards + core tenets**

---

## Strategic Alignment

### Standards Family

This plan is now the strategic anchor for a reusable dashboard build system. The sibling standards documents are:

- [dashboard-page-architecture-standard.md](dashboard-page-architecture-standard.md)
- [dashboard-copy-and-tone-standard.md](dashboard-copy-and-tone-standard.md)
- [dashboard-instrumentation-standard.md](dashboard-instrumentation-standard.md)
- [templates/dashboard-page-template.md](templates/dashboard-page-template.md)
- [governance/dashboard-pr-checklist.md](governance/dashboard-pr-checklist.md)

Use these as required references for all new dashboard pages and major refactors.

### How Every Development Effort Incorporates This Plan

Every dashboard effort should include these checks before merge:

1. Architecture check: section order and hierarchy align with [dashboard-page-architecture-standard.md](dashboard-page-architecture-standard.md).
2. Copy check: labels, CTA text, and tone align with [dashboard-copy-and-tone-standard.md](dashboard-copy-and-tone-standard.md).
3. Instrumentation check: page view, primary CTA, and support actions are tracked per [dashboard-instrumentation-standard.md](dashboard-instrumentation-standard.md).
4. DoD check: PR description includes a short statement confirming compliance with all three standards docs.
5. Delivery check: implementation follows [templates/dashboard-page-template.md](templates/dashboard-page-template.md) and includes [governance/dashboard-pr-checklist.md](governance/dashboard-pr-checklist.md).

### Current State
The briefing dashboard shows:
- **Layout:** Functional but dense (stats row, metrics pills, sections)
- **Visual Language:** Inconsistent with home page (lacks premium restraint, high whitespace)
- **Information Hierarchy:** Same weight for all sections (accountability, recovery flags, today actions)
- **Tenets Alignment:** Implicit, not explicit — none of the three tenets shape the narrative

### Target State
Dashboard should feel like a **continuation of the home page experience**: 
- Premium, composed, clear
- Actionable against the three core tenets
- High signal-to-noise ratio
- Executive-grade confidence (not startup busyness)

### Three Tenets as Dashboard Pillars
1. **Find roles first** → Early signal window, company focus, role matching
2. **Talk to the right people** → Relationship momentum, contact prioritization, next steps
3. **Follow a clear plan** → Weekly cadence visibility, today's actions, momentum scoring

---

## Briefing Page Principles And Requirements

### Product Positioning For This Page
The briefing page should not read like a task list. It should read like a private advisory brief for a senior operator.

The framing standard is:
- **Position first**: tell the user whether they are well-positioned, steady, or need one corrective move.
- **One best move**: narrow the day to one high-leverage action.
- **Explain the why**: connect the move to odds, timing, or relationship quality.
- **Optional depth**: offer more context without forcing homework.

### Behavioral Principles
1. **Lower felt effort**
   - Replace workload framing with outcome framing.
   - Avoid labels that imply backlog, debt, or punishment.
   - Prompt only one primary action above the fold.

2. **Support autonomy**
   - Present a recommended move, not a command.
   - Offer a small set of optional support paths: explain, email, save, learn more.
   - Let the user keep control of timing and follow-through.

3. **Make progress ambient**
   - Progress should feel like position awareness, not gamification.
   - Use restrained state labels such as `Building`, `Steady`, and `Watch`.
   - No streaks, trophies, confetti, points, or celebratory widgets.

4. **Pair insight with action**
   - Every signal, match, or follow-up recommendation should answer: `Why now?` and `What next?`
   - Data without interpretation should stay below the fold.

5. **Use concierge support patterns**
   - Help should feel like an advisor standing by.
   - Prefer a short note, email summary, or one-paragraph explainer before sending the user to a long article.

### Above-The-Fold Component Requirements

#### 1. Briefing Hero
Purpose: establish confidence, date context, and the tone of the day.

Required content:
- Greeting line
- Today date
- One sentence of framing focused on position, not effort

Content rules:
- Do not say `what to act on first today`.
- Do not mention counts in the hero sentence.
- Tone should feel like a chief-of-staff brief, not a coach or project manager.

Example pattern:
- `Good morning, Richard.`
- `Monday, June 22, 2026`
- `Your search is in a strong position. One relationship move today keeps the week pointed in the right direction.`

#### 2. Weekly Pulse Card
Purpose: provide the single clearest view of forward motion without making the search feel like labor.

Placement:
- Directly below the hero
- Above the metrics row
- Collapsed by default on mobile only if vertical space becomes a problem

Required elements:
- State label: `Building`, `Steady`, or `Watch`
- One-line interpretation of the week
- Restrained visual indicator: slim bar, arc, or band
- One primary CTA
- One secondary explainer CTA
- One optional support CTA

Allowed support CTAs:
- `Why this matters now`
- `Email me this plan`
- `Save as today’s note`
- `See the supporting signal`

Prohibited elements:
- Percent-to-goal rings labeled as completion
- Streak counters
- Awards, badges, medals, fireworks, progress celebrations
- Language like `crush`, `win the day`, `stay on fire`

#### 3. Metrics Row
Purpose: keep counts visible, but subordinate to interpretation.

Rules:
- Metrics must be reframed with outcome meaning.
- No more than four metrics visible.
- Counts should use neutral or positive labels.
- `Due Today` should be renamed to something lower-friction such as `Follow-through`, `Moves Ready`, or `Priority Moves`.

Recommended hierarchy:
- Primary pulse card provides meaning.
- Metrics row provides evidence.

#### 4. View Mode Control
Purpose: allow focused vs full mode without interrupting flow.

Rules:
- Keep available but visually demoted.
- Do not style as a key decision area.
- On mobile, convert to a compact segmented control or menu.

#### 5. Section Navigation
Purpose: preserve scannability while removing dashboard clutter.

Rules:
- Replace the current full `Jump to section` block with a smaller utility control.
- Default to hidden or collapsed after first use.
- Rename sections in plain language.

Preferred labels:
- `What matters now`
- `Signals to review`
- `People to reach`
- `Keep momentum`

Avoid:
- `Accountability`
- `Recovery flags`
- `Today actions`

### Briefing Body Requirements

#### Signals Section
Goal: reinforce `Find roles first`.

Requirements:
- Each item must include company, signal type, short summary, and one sentence on search relevance.
- CTA should point to a follow-through action, not just a destination page.
- Signal cards should visually feel like intelligence, not alerts.

Preferred CTA pattern:
- `Review signal and choose the next move`

#### People Section
Goal: reinforce `Talk to the right people`.

Requirements:
- Match insights should emphasize who to reach and why this company matters now.
- Copy should favor relationship positioning over application volume.
- At least one line should translate fit into conversational leverage.

#### Momentum Section
Goal: reinforce `Follow a clear plan`.

Requirements:
- Rename `Today, Do This` to `Best next moves` or `Keep momentum`.
- Show at most three items in full mode and one item in focused mode.
- Each item should be phrased as a low-friction next step.

Preferred pattern:
- `Send the update to Dana before noon while the signal is still fresh.`

#### Watch State Section
Goal: acknowledge drift without shame.

Requirements:
- Rename `Recovery flags` to `Watch points` or `Keep momentum`.
- State what is slipping, why it matters, and one corrective move.
- Avoid red-heavy visual treatment unless there is real urgency.

### Tone Rules
- Calm, direct, senior-to-senior
- Confident without hype
- Strategic rather than motivational
- Helpful rather than corrective

Use more of:
- `position`
- `timing`
- `next move`
- `keep momentum`
- `window`
- `follow-through`
- `supporting context`

Use less of:
- `due`
- `recovery`
- `accountability`
- `do this`
- `urgent` unless factually necessary

### Support Mechanisms
The page should include one lightweight support path that reduces resistance when the user is unsure what to do next.

Priority order:
1. Inline explainer: `Why this matters now`
2. Deliverable: `Email me this plan`
3. Personal workspace action: `Save as today's note`
4. Educational depth: `Read the 2-minute briefing note`

Rules:
- Educational content should be optional and short.
- Support content should be contextual to the move being recommended.
- If an article is offered, it should feel like a field note, not a blog detour.

### Success Metrics For This Page

#### Experience
- Time to first clear action under 10 seconds
- Pulse-card interaction rate
- `Why this matters now` open rate
- `Email me this plan` send rate

#### Behavior
- Primary CTA click-through rate
- 24-hour completion rate for the recommended action
- Signal-to-outreach lag
- Weekly momentum recovery rate for users in `Watch`

#### Perception
- Self-reported clarity
- Self-reported manageability
- Self-reported confidence after reading the briefing

### Build Order
1. Rewrite hero and section labels
2. Add the Weekly Pulse card
3. Reframe metrics row language
4. Rename and restyle the watch section
5. Add the explainer and email/note support actions

### Live Briefing Copy Set

#### Hero
- Brand line: `Starting Monday`
- Greeting: `Good morning, {FirstName}.`
- Framing line, building state: `{FirstName}, your search is in a strong position this week.`
- Framing line, steady state: `Your search is holding a good line this week.`
- Framing line, watch state: `This week needs one corrective move, not a bigger push.`

#### Weekly Pulse Card
- Eyebrow: `This week's position`
- State labels: `Building` | `Steady` | `Watch`

Building examples:
- `A timely follow-through with {ContactName} keeps the relationship side of the search moving without adding noise.`
- `{CompanyName} moved. Your timing improved.`
- `You have at least one role that looks directionally right. A quick review now protects momentum later in the week.`

Steady examples:
- `One clean follow-through with {ContactName} is enough to keep the week pointed forward.`
- `Review one new development now so the rest of the week stays easier to manage.`

Watch examples:
- `A small, well-chosen action today is enough to settle the search back into rhythm.`
- `One corrective move is usually more effective than trying to catch up everywhere at once.`

Primary CTA labels:
- `Open the next move`
- `Review the signal`
- `Open the company view`
- `Keep momentum moving`
- `Handle the top follow-through`

Secondary support labels:
- `Why this matters now`
- `Email me this plan`
- Future option: `Save as today's note`

#### Navigation And Section Labels
- `Jump to section`
- `Weekly pulse`
- `What matters now`
- `Keep momentum`
- `Best next moves`
- `Signals to review`
- `People to reach`

Avoid these labels:
- `Accountability`
- `Recovery flags`
- `Today, do this`
- `Due today`

#### Metrics Row
- `Companies`
- `Signals`
- `Matches`
- `Priority moves`

Future reframed variants if more context is added:
- `Companies in view`
- `Signals worth review`
- `Roles worth a closer look`
- `Moves ready`

#### Advisory Copy Blocks
- `Stay early on timing, move one relationship forward, and keep the week easy to manage. The goal is not more activity. The goal is better positioning.`

#### Empty State
- Title: `Nothing urgent is pulling at the search today.`
- Body: `No new matches, relationship follow-through, or company signals need attention right now. Add a company or return to the dashboard when you want the next move queued up.`
- CTAs: `Add a company` and `Back to dashboard`

### Engineering Checklist

#### Weekly Pulse Slice
- [x] Add a pulse-state helper driven by existing briefing data
- [x] Add a new pulse card between hero and metrics row
- [x] Add three pulse states: `Building`, `Steady`, `Watch`
- [x] Add one primary CTA routed through existing action logging
- [x] Add one inline explainer using a details disclosure
- [x] Add one lightweight support path with `Email me this plan`
- [x] Avoid inline styles for the meter

#### Briefing Copy Refactor
- [x] Replace the hero framing sentence
- [x] Rename `Due Today` to `Priority Moves`
- [x] Rename `Accountability` to `What matters now`
- [x] Rename `Recovery Flags` to `Keep Momentum`
- [x] Rename `Overnight Changes` to `Signals To Review`
- [x] Rename `Today, Do This` to `Best Next Moves`
- [x] Add `Weekly pulse` to jump navigation

#### Next UI Tasks
- [x] Style the pulse card for mobile compression and tablet balance
- [x] Add analytics for the explainer open interaction
- [x] Add analytics for the email-plan click path
- [x] Decide whether the support action should become `Save as today's note`
- [ ] Replace the jump section utility with a more compact or dismissible control
- [ ] Add a calmer visual treatment for watch-state cards than the current red-first treatment

#### Data And Logic Follow-Ups
- [ ] Improve pulse-state logic using 7-day deltas instead of count heuristics
- [ ] Use event history to distinguish building momentum from one-off activity
- [ ] Add company or contact deep links when the recommendation points to a specific entity
- [x] Add a true note-save action if product wants in-workspace capture

#### Validation Checklist
- [ ] Validate the briefing page in both `focused` and `full` modes
- [ ] Run a narrow type/lint check if a project command exists for the route slice
- [ ] Review mobile layout at 390px width
- [ ] Review desktop spacing against the home-page visual standard
- [ ] Confirm the pulse copy never implies gamification or scorekeeping

---

## Visual & Layout Standards

### Home Page Principles to Apply
| Principle | Current Dashboard | Fix |
|-----------|-------------------|-----|
| **Whitespace** | Compact sections, minimal padding | Increase px-4→px-6, py-14→py-16 between sections |
| **Visual Hierarchy** | All metrics equally prominent | Lead with one hero stat; demote others |
| **Typography** | Mix of sizes/weights | Adopt home page: bold h2 (28–36px), measured body (15–16px) |
| **Color Restraint** | Muted, lacks accent hierarchy | One orange accent for primary action, emerald for positive trend |
| **Border & Depth** | Flat cards with minimal borders | Add subtle border-white/10, bg-white/5 depth |
| **Proof Framing** | Generic metric labels | Label with intent: "Teams landing within 30d" vs "users" |
| **Motion** | Minimal state transitions | Restrained reveal animations (opacity, subtle scale) |

---

## Phase 1: Hero Section Redesign

### Current Briefing Header
```
"Good morning, Richard."
Monday, June 22, 2026
Here is what changed overnight and what to act on first today.
```

### Proposed Hero
```
BRIEFING HEADER
Good morning, Richard — here's your move for today.

[One Primary Stat Card]
┌─────────────────────┐
│ FIND ROLES FIRST    │
│ 5 new signals       │
│ 3 companies signaling │
│ See details →       │
└─────────────────────┘

[Three Stat Pills Below]
25 COMPANIES WATCHED  |  0 MATCHES YET  |  3 DUE TODAY

[Monday, June 22, 2026]
```

### Design Details
- **Hero block:** Dark gradient background (slate-950 with subtle radial overlay), max-w-4xl center
- **Primary stat:** Card with orange accent border left, large numeric + qualifier
- **Supporting stats:** Smaller pills, muted text, right-aligned or horizontal grid
- **Spacing:** Increase top padding (pt-20 → pt-24), increase gap between blocks (gap-6 → gap-8)
- **Typography:** Hero headline 24–28px semibold; "Good morning" in smaller warm gray

---

## Phase 2: Reorganize Dashboard Sections by Tenet

### Section 1: FIND ROLES FIRST (Primary Focus)
**Purpose:** Show role discovery momentum and signal windows opening

**Components:**
1. **Top Section:** "Signals arriving this week"
   - Grid: [Company card + signal label + timeline]
   - Example: "Cisco | Exec departure flagged | Now hiring CTO"
   - CTA: "View full signal" or "Add to outreach queue"
   
2. **Recent Scans:** "Career page updates"
   - Last scan date per company
   - New job count (highlight if >0)
   - Confidence % if relevant
   
3. **Match Readiness:** "Companies ready for outreach"
   - Show companies with fit_score > 7 + recent signals
   - "Add to warm outreach queue" action

**Layout:** Single column, max-w-3xl, generous spacing (py-12 between blocks)

---

### Section 2: TALK TO THE RIGHT PEOPLE (Secondary Focus)
**Purpose:** Relationship momentum and prioritization for next actions

**Components:**
1. **Warm Relationships Warming:** "Contacts moving this week"
   - Contact name + company + last interaction + next step
   - Heat indicator: cold → warm → hot
   - Action: "Schedule call" or "Send update"
   
2. **Follow-Up Due:** "Actions due this week"
   - Sorted by due date (nearest first)
   - Include context (who, what, when)
   - "Mark done" quick action
   
3. **Relationship Gap:** "Companies without a warm intro"
   - Suggest which 2–3 companies need focus this week
   - Show "How to find warm path" guidance link

**Layout:** Two-column grid (contact focus + gaps), split at lg breakpoint

---

### Section 3: FOLLOW A CLEAR PLAN (Accountability)
**Purpose:** Weekly rhythm, progress tracking, momentum maintenance

**Components:**
1. **This Week's Plan:** "Your search velocity"
   - Visual progress bar: outreach / calls / intros / offers
   - Weekly goal vs actual (filled/remaining)
   - Momentum trend: +↑ / = / -↓ vs last week
   
2. **Momentum Score Trend:** "4-week rolling momentum"
   - Line chart or simple gauge
   - "Healthy", "Declining", or "Watch" label
   - Comment: "You're in the optimal action zone"
   
3. **Recovery Flags:** "Stalls to avoid"
   - If no calls in 7d, no new signals, or no moves: flag
   - "Get momentum back" with specific 24h action suggestion
   - Example: "Schedule 2 more follow-up calls today"

**Layout:** Three equal-width cards, horizontal scroll on mobile

---

## Phase 3: Reduce Cognitive Load

### Current Issues
- Too many jump-to sections (6+ options)
- Stats presented without clear hierarchy
- No leading insight or "what matters today"

### Fix
1. **Collapse "Jump to Section" into a single, dismissible card**
   - Show only if first visit or explicitly opened
   - Buttons: Metrics | View mode | Accountability | Recovery flags
   - After dismissal, remember preference (localStorage)

2. **Lead with ONE insight per day**
   - Example: "5 signals this week — your highest week yet. Start here → [link to signals]"
   - Or: "You're trending -12 momentum points. Action plan: [2–3 specific steps]"
   - Rotate insight type (signal, relationship, momentum, recovery)

3. **Demote secondary info**
   - "Today actions" becomes a sidebar or collapsible subsection
   - View mode options (Focused vs Full) stays available but hidden

---

## Phase 4: Visual Polish Passes

### Typography Updates
- **Hero:** 24–28px, semibold, leading-tight
- **Section headers:** 16–18px, semibold, uppercase tracking (0.1em), orange accent overline
- **Card titles:** 14px semibold, white/95
- **Body text:** 14–15px, slate-200/90, leading-relaxed
- **Stats:** 14–16px for label, 24–28px for number (semibold, white)
- **CTA text:** 12–13px semibold, uppercase tracking

### Color System
- **Backgrounds:** slate-950, slate-900/80, slate-950/64
- **Borders:** white/10 (cards), white/5 (subtle dividers)
- **Accents:** 
  - Primary (signal/discovery): orange-500, orange-200 for labels
  - Secondary (trend positive): emerald-200, emerald-100
  - Warning (momentum decline): amber-200, amber-100
- **Text:** white/95 (primary), slate-200/90 (secondary), slate-400 (tertiary)

### Spacing Refinements
- **Section top/bottom padding:** py-16–py-20 (up from py-12–py-14)
- **Card padding:** p-6–p-8 (up from p-4–p-5)
- **Between cards:** gap-6–gap-8
- **Within card:** gap-4–gap-6

### Depth & Borders
- Card border: `border border-white/10`
- Card background: `bg-white/5` or `bg-slate-900/40`
- Subtle shadow on cards: `shadow-lg` with `shadow-slate-950/20`
- Rounded corners: `rounded-xl` or `rounded-2xl` (consistent with home page)

---

## Phase 5: Interactive Refinements

### Micro-interactions
- **Stat hover:** Background lightens (white/8 → white/12), text brightness increases
- **Card collapse/expand:** Smooth height animation (duration-300)
- **CTA buttons:** 
  - Primary: bg-orange-500 → bg-orange-600, shadow depth increases on hover
  - Secondary: border-slate-500 → border-slate-300, text-slate-300 → text-white
- **Trend indicator:** Up ↑ scales +5%, down ↓ scales -5% on pulse

### Information Reveal
- Lazy-load secondary sections below fold (signals, relationships, momentum)
- Skeleton loaders with pulse animation during load
- "Load more" for large result sets (contacts, signals, companies)

---

## Phase 6: Alignment with Home Page Proof Framing

### Current Stats
- "25 companies" ← generic count
- "5 signals" ← undefined type/value
- "3 due today" ← lacks context

### Reframed (Proof-Oriented)
- "25 companies monitored" → "Tracking high-potential transitions across your sector"
- "5 signals this week" → **"5 signals arriving now — 2 executive moves, 2 funding rounds, 1 expansion"**
- "3 due today" → "3 follow-ups due | This week's outreach on track"

**Pattern:** Add **outcome or implication** to each stat, not just the number.

---

## Phase 7: Content Copy Refinements

### Tone Alignment with Home Page
**Home page:** "A calmer executive search feels better and performs better."  
**Dashboard should reflect:** Clear, composed, actionable, confident.

**Example Updates:**
- ❌ "Overnight changes show you what shifted. Today's actions show you who to contact first and what to do before the day gets away from you."
- ✅ "Your move for today: 3 follow-ups due, 2 new signals in your target sector, and one warm relationship ready to move forward."

- ❌ "Recovery flags"
- ✅ "Momentum watch" or "Keep this moving"

- ❌ "Three regulatory deadlines (DORA, CMMC Phase 2) are forcing immediate technology leadership upgrades..."
- ✅ "Regulatory momentum: DORA, CMMC Phase 2 driving 47+ open CIO/CISO roles this Q. Competitive window: 8–12 weeks."

---

## Phase 8: Mobile-First Responsive Design

### Breakpoints & Adaptations
| Screen | Dashboard Layout |
|--------|-----------------|
| **Mobile (sm)** | Single column, full width, collapsed sections, horizontal scroll for stats |
| **Tablet (md)** | Single column, wider cards (max-w-2xl), card grid 1–2 cols |
| **Desktop (lg)** | Two-column grid (left: Signals/Roles; right: Relationships/Momentum), max-w-6xl |

### Mobile-Specific Details
- Reduce heading sizes by ~2–4px
- Collapse "View mode" pill selector into dropdown
- Stack stat pills vertically, full width
- Sidebar (recovery flags, help) becomes bottom drawer/modal

---

## Implementation Phases (Prioritized)

### Phase 1a: Hero & Stat Redesign (**Week 1**)
- New briefing header with primary stat card
- Reorganize stat pills with proof-oriented copy
- Apply typography + spacing standards
- **Effort:** 2–3d (design + component updates)

### Phase 1b: Section Reorganization (**Week 1–2**)
- Split dashboard into three tenet-based sections
- Stub out new components: SignalsSection, RelationshipsSection, MomentumSection
- Retain current data queries, just restructure presentation
- **Effort:** 3–4d

### Phase 2: Polish & Refinement (**Week 2–3**)
- Color system application (accents, depth)
- Micro-interactions (hover states, reveal animations)
- Mobile responsiveness audit
- **Effort:** 2–3d

### Phase 3: Content Audit (**Week 3**)
- Review all copy against "calm, composed, clear" voice
- Update stat labels with outcome framing
- Test with one user (internal)
- **Effort:** 1–2d

---

## Success Metrics

### UX Metrics
- **Cognitive load reduction:** Fewer than 3 sections visible above fold (vs. 6+ today)
- **Task clarity:** "What should I do in the next hour?" answerable in <10 seconds
- **Engagement:** Average dashboard session duration (track via analytics)

### Design Alignment
- **Visual consistency:** All typography, colors, spacing match home page design system
- **Whitespace ratio:** Increase from ~30% to ~45%
- **Button/CTA count:** Reduce visible actions from 8+ to 3–4 primary

### Content Alignment
- **Tenet prevalence:** Each section clearly tied to one tenet (explicit, not implicit)
- **Proof density:** Each stat includes outcome implication, not just number

---

## Design System Checklist

- [ ] Create Tailwind utility classes for dashboard typography scale
- [ ] Add dashboard color tokens (accents: orange, emerald, amber; depths: slate variants)
- [ ] Document spacing grid (py-16, py-20, gap-6, gap-8, etc.)
- [ ] Create reusable card component with border/depth standards
- [ ] Build stat card template (number + label + trend + context)
- [ ] Test all combinations on 390px, 768px, 1024px, 1440px breakpoints

---

## Dependency Tree

```
Phase 1a (Hero redesign)
├─ Type system + color tokens
├─ New BriefingHeader component
└─ Stat card component

Phase 1b (Section reorganization)
├─ SignalsSection (build from BriefingSection)
├─ RelationshipsSection (new)
└─ MomentumSection (new, repurpose existing)

Phase 2 (Polish)
├─ Apply color system to all sections
├─ Add micro-interactions
└─ Mobile responsiveness

Phase 3 (Content audit)
├─ Copy review
├─ Stat label updates
└─ User testing
```

---

## Handoff Notes

- **Component locations:** `src/app/(dashboard)/dashboard/` 
- **Existing sections to refactor:** 
  - DashboardPipelineSection → RelationshipsSection
  - DashboardDisclosureSection → MomentumSection
  - DashboardStatusBanners → Flatten into hero or recovery section
- **New components to create:** SignalsSection, BriefingHeader, StatCard
- **Data dependencies:** Existing queries (companies, signals, follow_ups, profile) remain unchanged
- **Testing:** Run Playwright luxury test on final desktop + mobile designs

---

## Why This Matters

The dashboard is your daily workspace. It should:
1. **Feel premium** (match home page luxury standards)
2. **Guide strategy** (three tenets as narrative structure)
3. **Reduce friction** (clear, composed, actionable in 10 seconds)
4. **Build confidence** (proof framing shows progress toward goals)

Currently, it feels functional but busy. This plan transforms it into a **disciplined, composed operating dashboard** that scales with your search as it matures.
