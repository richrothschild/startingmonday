# Luxury-Modern Elevation — Phase 0 Kickoff (2026-07-11)

**Epic ID:** EPIC-LUX-001  
**Phase:** 0 (Foundation & Alignment)  
**Owner:** Product + Design + Engineering + Growth  
**Duration:** 2 weeks (2026-07-11 to 2026-07-25)  
**Status:** Kickoff  

---

## Phase 0 Mission
Establish design direction, copy principles, metrics baseline, and detailed brief for Phase 1 page rollout (homepage + 4 channel pages).

---

## Workstream A: Design Direction & Premium System

### A1: Luxury-Modern Token Set
**Owner:** Design Lead  
**Due:** 2026-07-18  
**Status:** Not started

**Deliverables:**
1. Typography system
   - Headlines: Serif luxury stack (Georgia/Garamond fallback)
   - Body: Clean modern sans (current system to remain, optimize kerning/leading)
   - Sizing scale: 11px, 13px, 14px, 16px, 18px, 20px, 24px, 28px, 34px, 44px
   - Line height targets: Headlines 1.1, Body copy 1.6, UI 1.5

2. Color palette
   - Luxury accent: Warm gold/copper (current orange refine: target #d4a574 or #c17f3b)
   - Trust neutrals: Slate/charcoal with increased depth (current white/slate but add dark-slate-900 for depth)
   - Trust green: Elevated (current emerald-500 to emerald-400 for contrast)
   - Premium surfaces: Off-white with subtle texture (not pure white)
   - Elevation shadows: Soft, diffuse (8px blur, 12px blur, 16px blur — deeper than current)

3. Spacing scale (Tailwind)
   - Maintain 0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48 (current)
   - Add section spacers: 60px, 80px, 100px (gaps between hero, trust, proof, CTA)

4. Surface patterns
   - Gradient backgrounds: Subtle radial (current dark radial to be deepened)
   - Backdrop blur: 12px (increase from 8px for premium feel)
   - Border treatment: 1px / 0.5px only (remove thicker borders on premium surfaces)
   - Rounded corners: 8px / 12px / 16px (eliminate current square corners on cards)

5. Motion tokens
   - Transitions: ease-in-out 300ms standard (add easing library)
   - Hover states: +10% scale, +5% opacity
   - Focus rings: 2px solid gold with 2px offset

**Reference:**
- Baseline: Current Tailwind config in `tailwind.config.ts`
- Benchmarks: Atlassian, Notion, Lucid visual systems

**Approval Gate:** Design council + Product lead sign-off

---

### A2: Premium Component Library
**Owner:** Design + Engineering  
**Due:** 2026-07-21  
**Status:** Not started

**Core Components (Figma + React):**

1. **HeroBlock** (new component)
   - Structure: Background gradient + overlay + content slot
   - Typography: Serif headline (H1, 28-44px), subheader (14-16px), lead paragraph (16px, max 3 sentences)
   - CTA placement: Single primary + optional secondary below fold
   - Mobile: Stack vertically, headline 28px, full width
   - Accessibility: Color contrast A-level, alt text for images

2. **TrustRail** (new component)
   - Three-column grid (desktop) / stacked (mobile)
   - Columns: Security/Privacy | Transparency/Data | Control/Deletion
   - Icon + headline + 1-line description
   - Link to detailed policy page
   - Integration: Mounted in first viewport or immediately below hero
   - Spacing: 24px gaps, 16px internal padding

3. **EvidencePanel** (new component)
   - Metric display: 3-column stat block (desktop)
   - Per-stat: Large number (44px) + label (13px uppercase) + source attribution (11px muted)
   - Source format: "[Source] • [Date]" with link to evidence
   - Visual: Subtle background color (emerald-50 or slate-50), 8px radius
   - Optional: Add comparison arrow (e.g., "+20% vs competitor")

4. **CTARail** (enhance existing)
   - Structure: Primary button + secondary link (desktop) / stacked (mobile)
   - Primary: Gold/orange background with white text, 14px font, 12px h-padding, 8px v-padding
   - Secondary: Outline style with slate border, gold text on hover
   - Hover: Scale +2%, shadow +4px, transition 200ms
   - Remove: Overly large padding (reduce from 16px to 12px horizontal)

5. **ProofCard** (enhance)
   - Add source badge: "From [company]" in top-right
   - Add date: "Published [MM/DD/YYYY]"
   - Standardize spacing: 16px padding, 8px radius
   - Testimonials: Add avatar + name + title (if available)

**File Structure (React):**
```
src/components/premium/
├── HeroBlock.tsx
├── TrustRail.tsx
├── EvidencePanel.tsx
├── CTARail.tsx
└── ProofCard.tsx

tailwind-premium.css (custom keyframes + globals)
```

**Approval Gate:** Design QA + accessibility review

---

## Workstream B: Messaging & Copy Architecture

### B1: Executive-Grade Headline System
**Owner:** Product + Growth  
**Due:** 2026-07-19  
**Status:** Not started

**Hero Headline Formula: Authority + Mechanism + Outcome**

Template:
```
[Authority claim]. [Mechanism — how it works]. [Outcome — what you get].
```

Examples:
- **Homepage:** "Built for executives running private campaigns. Signal-first infrastructure reveals roles before they're posted. Move earlier and negotiate from strength."
- **For Executives:** "Run a private, signal-first campaign. Move before the role is posted. Show up at peer depth."
- **For Coaches:** "Accelerate your client placements. Tap early signals and prepare your best clients before competition sees the role. Close rates 3x higher."
- **For Outplacement:** "Modernize your placement workflow. Our signal system finds roles your team didn't know existed. Cut placement time by 40%."

**Requirements:**
- Max 3 sentences
- Avg sentence length: 16-20 words (not more than 24)
- Specificity: Include 1 metric or timeframe (e.g., "before they're posted", "3x higher")
- Tone: Confident, direct, authority-driven (not salesy)
- Test: Comprehension >= 82% in validation panel

**Approval Gate:** Copy council + CEO sign-off

---

### B2: Standardized Proof-First Copy Modules
**Owner:** Growth + Content  
**Due:** 2026-07-21  
**Status:** Not started

**Pattern: Proof Module Structure**

```
[Headline: "Why executives choose us" or "Built for X outcome"]
[Supporting stat or claim with source: "3x faster role discovery than manual search (source: Q2 2026 pilot)"]
[Trust element: Privacy promise, control guarantee, or transparency note]
```

**For Each Key Entry Page:**

1. **Homepage:** Proof of speed (signal discovery time) + trust (data privacy) + authority (user count/testimonial)
2. **For Executives:** Proof of results (placement rates/salary outcomes) + trust (confidentiality guarantee) + authority (executive backgrounds)
3. **For Coaches:** Proof of efficiency (placement time reduction) + trust (transparent pricing) + authority (coach testimonials)
4. **For Outplacement:** Proof of scale (placements per quarter) + trust (firm partnerships) + authority (industry credentials)
5. **For Search Firms:** Proof of reach (candidate pool size) + trust (compliance & confidentiality) + authority (firm partnerships)

**Approval Gate:** Rubric council review (>= A- clarity score)

---

## Workstream C: Metrics Baseline & Instrumentation

### C1: Baseline Metrics Capture
**Owner:** Analytics Lead  
**Due:** 2026-07-15  
**Status:** Not started

**Current State Metrics (30-day rolling):**

| Metric | Current Baseline | Target (Phase 1) | Measurement Method |
|--------|------------------|------------------|-------------------|
| Perceived luxury score (council) | 5/10 | 8/10 | UX council rubric (5 evaluators) |
| Modern polish score (UI) | 6/10 | 8.5/10 | UI rubric (design team) |
| First-10-second comprehension | 62% | 82% | Synthetic user panel (20 users) |
| Trust confidence | 6.5/10 | 8.5/10 | Post-visit survey (200 respondents) |
| Entry-to-signup conversion | [baseline %] | +20% lift | GA4 event tracking |
| Bounce rate | [baseline %] | -15% reduction | GA4 behavior analysis |
| Mobile perceived quality | [baseline] | +2.0 lift | Council mobile audit |

**Data Collection Plan:**

1. Pull current GA4 data for all entry pages:
   - Homepage, /for-executives, /for-coaches, /for-outplacement, /for-search-firms
   - Metrics: Entry users, exit rate, time-on-page, scroll depth, CTA clicks, conversion path

2. Run council rubric (today):
   - 5 evaluators score current state on luxury/polish/trust
   - Average score = baseline

3. Synthetic user study (by 2026-07-14):
   - 20 representative users
   - Test headline comprehension (show headline, ask "What does this company do?" → score clarity)
   - Measure trust via Likert scale

4. Set up event tracking (by 2026-07-15):
   - Tag all phase 1 pages with `source=emi-phase-1-redesign`
   - Tag all CTA clicks with `cta-type=primary|secondary`, `page-location=hero|mid|footer`
   - Create dashboard in GA4 to track entry → signup funnel

**Approval Gate:** Analytics lead sign-off on instrumentation

---

### C2: Phase 1 Success Dashboard
**Owner:** Analytics Lead  
**Due:** 2026-07-22  
**Status:** Not started

**Dashboard Layout (GA4 + Looker):**

1. **Primary KPIs (Big Numbers)**
   - Conversion rate (entry → signup)
   - Bounce rate
   - Avg time-on-page

2. **Secondary KPIs**
   - Scroll depth to proof modules
   - CTA click-through rate by placement
   - Trust rail exposure (% who scroll to see it)

3. **Traffic & Segment Breakdown**
   - Traffic by channel (organic, direct, referral, paid)
   - Device breakdown (desktop, mobile, tablet)
   - Entry page breakdown (home, /for-executives, etc.)

4. **Cohort Comparison**
   - Phase 1 redesigned pages vs control pages (same funnel endpoint)
   - Week-over-week trending

**Auto-Alerts:**
- Conversion drops > 10% → Slack alert to #growth
- Bounce rate increases > 5% → Slack alert to #product
- CTA click-through < 5% → Review CTA placement

---

## Workstream D: Detailed Brief for Phase 1 Pages

### D1: Page-by-Page Redesign Specification
**Owner:** Product + Design  
**Due:** 2026-07-23  
**Status:** Not started

**For each of 5 pages (Homepage, /for-executives, /for-coaches, /for-outplacement, /for-search-firms):**

1. **Current State Screenshot + Analysis**
   - What's working (conversion paths, trust elements)
   - What's weak (dense copy, weak visual hierarchy, unclear CTAs)

2. **Redesigned Wireframe (Figma)**
   - Hero section layout (use HeroBlock component)
   - Trust section placement (TrustRail component)
   - Proof/evidence section (EvidencePanel component)
   - CTA placement (primary + secondary)
   - Scroll path (estimated scroll depth to proof, CTA, footer)

3. **Copy Specification**
   - Hero headline (Authority + Mechanism + Outcome)
   - 2-3 supporting benefit bullets
   - Trust callout (privacy/control/transparency)
   - Proof module copy (metric + source)
   - CTA text (primary + secondary)

4. **Component Usage List**
   - Which premium components used
   - Token overrides (if any)
   - Mobile behavior

5. **Success Criteria**
   - Design rubric score target (luxury/polish)
   - Expected scroll depth to proof (e.g., "85% see trust rail in first viewport")
   - CTA click-through target (e.g., "8%+ primary CTA rate")

**Template File:** `/docs/lux/page-redesign-spec-template.md`

**Approval Gate:** Design + Product sign-off before engineering starts

---

## Phase 0 Deliverables Checklist

### By 2026-07-18
- [ ] Premium token set finalized (color, typography, spacing, motion)
- [ ] Hero headline formulas approved for all 5 pages
- [ ] Baseline metrics captured (council rubric + GA4 setup)

### By 2026-07-21
- [ ] 5 core premium components designed + built in React
- [ ] Proof-first copy modules drafted for all 5 pages
- [ ] GA4 event instrumentation live and tested

### By 2026-07-23
- [ ] Figma redesign mocks for all 5 pages (homepage + 4 channels)
- [ ] Copy brief finalized for all 5 pages
- [ ] Success dashboard live and aligned with team

### By 2026-07-25
- [ ] Leadership sign-off: Design direction approved
- [ ] Leadership sign-off: Copy principles locked in
- [ ] Leadership sign-off: Metrics baseline confirmed
- [ ] Detailed brief ready for Phase 1 engineering kickoff

---

## Phase 0 Go/No-Go Criteria

**Phase 1 can start if ALL of the following are met:**

- [ ] All 5 premium components coded and in component library
- [ ] Figma mocks for all 5 pages approved by design council
- [ ] Hero headlines tested at >= 82% comprehension
- [ ] Baseline metrics captured for all KPIs
- [ ] GA4 instrumentation live and reporting correctly
- [ ] CTAail and ProofCard components working on current pages (smoketest)
- [ ] Design tokens integrated into Tailwind config
- [ ] Design system Figma file shared with engineering team
- [ ] Product + Design + Engineering alignment on Phase 1 sprint schedule

**Go/No-Go Decision Authority:** Product Lead + Design Lead + Engineering Lead  
**Target Decision Date:** 2026-07-25

---

## Phase 1 Readiness (Preview)

**Kick-off:** 2026-07-26  
**Duration:** 4 weeks  
**Pages:** Homepage, /for-executives, /for-coaches, /for-outplacement, /for-search-firms  

**Success Criteria:**
- Visual quality score >= 8/10 (council audit)
- No conversion regression (hold-out A/B test)
- All pages launched behind feature flag by 2026-08-23

---

## Immediate Next Steps (This Week)

1. **Today (2026-07-11):** Schedule design kickoff with Design Lead + Product Lead (60min)
2. **By EOD Friday (2026-07-12):** 
   - Gather current GA4 baseline for all entry pages
   - Schedule council rubric evaluation session
3. **Monday (2026-07-15):**
   - Analytics lead to share baseline dashboard
   - Design lead to share typography + color direction options
4. **By Wed (2026-07-17):** First draft of 5 hero headlines for team review
5. **By EOD Thu (2026-07-18):** Phase 0 Workstream A & B complete, ready for integration

---

## Resources & Links

- **Benchmark Design Systems:**
  - Atlassian Design System: https://atlassian.design/
  - Notion: https://notion.so (homepage visual inspection)
  - Lucid visual review: https://www.lucidchart.com/

- **Current Codebase:**
  - Tailwind config: `tailwind.config.ts`
  - Component library: `src/components/`
  - Current token values: Check CSS custom properties

- **Collaboration:**
  - Figma workspace: [Design team link]
  - GA4 project: Starting Monday workspace
  - Slack: #growth, #product, #design, #engineering
