# Coach Conversion Epic

## Objective
Create an A+ coach buying motion for Starting Monday by aligning product workflow, pricing, proof, privacy posture, and messaging to what executive coaches need to buy.

This epic is built from current implementation in:
- [src/app/for-coaches/page.tsx](src/app/for-coaches/page.tsx)
- [src/app/for-coaches/faq/page.tsx](src/app/for-coaches/faq/page.tsx)
- [src/app/for-coaches/economics/page.tsx](src/app/for-coaches/economics/page.tsx)
- [src/app/(dashboard)/dashboard/coach/page.tsx](src/app/(dashboard)/dashboard/coach/page.tsx)
- [src/components/coach/client-data-view.tsx](src/components/coach/client-data-view.tsx)
- [src/app/api/coach/clients/route.ts](src/app/api/coach/clients/route.ts)
- [src/app/api/coach/client/[clientId]/scorecards/route.ts](src/app/api/coach/client/[clientId]/scorecards/route.ts)
- [src/app/api/coach/client/[clientId]/alerts/route.ts](src/app/api/coach/client/[clientId]/alerts/route.ts)
- [src/lib/coach-access.ts](src/lib/coach-access.ts)

---

## Council Scorecard (Current State vs A+)

Grading scale:
- A+: market-ready, low-friction, proof-backed, conversion-safe
- A: strong with minor gaps
- B: solid but leaves buying objections unresolved
- C: meaningful conversion risk

### 1) Clear ROI story in coach language
Current grade: B
Evidence:
- Strong positioning language exists in [src/app/for-coaches/page.tsx](src/app/for-coaches/page.tsx)
- ROI is discussed in [src/app/for-coaches/faq/page.tsx](src/app/for-coaches/faq/page.tsx)
- Economics page is referral/commission-heavy in [src/app/for-coaches/economics/page.tsx](src/app/for-coaches/economics/page.tsx)
Flagged (not A+):
- FAQ and economics copy need to remain aligned to the live coach buyer ladder as it evolves
- ROI framing mixes coach economics with referral economics instead of explicit coach practice outcomes
- No role-specific ROI calculator for solo coach vs boutique firm

### 2) Proof it improves coaching, not replaces it
Current grade: A-
Evidence:
- Repeated operating-layer framing in [src/app/for-coaches/page.tsx](src/app/for-coaches/page.tsx)
- Objection handling in [src/app/for-coaches/faq/page.tsx](src/app/for-coaches/faq/page.tsx)
Flagged (not A+):
- Proof is mostly aggregate pilot metrics, not named coach case studies with before-after session outcomes

### 3) Coach-specific workflow completeness
Current grade: A-
Sub-grades:
- Multi-client dashboard: A
  - Implemented in [src/app/(dashboard)/dashboard/coach/page.tsx](src/app/(dashboard)/dashboard/coach/page.tsx)
  - Backed by [src/app/api/coach/clients/route.ts](src/app/api/coach/clients/route.ts)
- Shared pipeline view: A
  - Implemented in [src/components/coach/client-data-view.tsx](src/components/coach/client-data-view.tsx)
  - Backed by [src/app/api/coach/client/[clientId]/companies/route.ts](src/app/api/coach/client/[clientId]/companies/route.ts)
- Signal alerts by client: A-
  - Alert preferences implemented in [src/components/coach/client-alert-preferences.tsx](src/components/coach/client-alert-preferences.tsx)
  - API in [src/app/api/coach/client/[clientId]/alerts/route.ts](src/app/api/coach/client/[clientId]/alerts/route.ts)
  - Missing visible proof of delivered alerts and alert outcome tracking
- Session prep snapshot: B+
  - Briefs tab exists in [src/components/coach/client-data-view.tsx](src/components/coach/client-data-view.tsx)
  - Missing explicit pre-session snapshot view with "what changed since last session"
- Progress markers over time: B
  - Scorecards exist via [src/app/api/coach/client/[clientId]/scorecards/route.ts](src/app/api/coach/client/[clientId]/scorecards/route.ts)
  - Missing trendlines and week-over-week coaching outcome markers

### 4) Risk-free starting motion
Current grade: A-
Evidence:
- 30-day free preview and no commitment language in [src/app/for-coaches/faq/page.tsx](src/app/for-coaches/faq/page.tsx)
- 15-minute preview framing in [src/app/for-coaches/page.tsx](src/app/for-coaches/page.tsx)
Flagged (not A+):
- Missing explicit 1-2 client pilot package and measurable 30-day success checklist

### 5) Pricing that matches coaching economics
Current grade: C+
Evidence:
- Current client plan pricing in [src/app/for-coaches/economics/page.tsx](src/app/for-coaches/economics/page.tsx)
- FAQ placeholder ($X) in [src/app/for-coaches/faq/page.tsx](src/app/for-coaches/faq/page.tsx)
Flagged (not A+):
- No coach plan published at 99 plus 39 per client or flat 249 for small books
- Pricing narrative emphasizes referral commission over coach purchase decision

### 6) Social proof from peers
Current grade: C
Evidence:
- Aggregate pilot metrics present in [src/app/for-coaches/page.tsx](src/app/for-coaches/page.tsx)
Flagged (not A+):
- No named transition coach testimonials
- No role-based quotes (solo coach, boutique, outplacement-adjacent)

### 7) Strong privacy posture
Current grade: B+
Evidence:
- Access controls and logging implemented in [src/lib/coach-access.ts](src/lib/coach-access.ts)
- Client-controlled permission language in [src/app/for-coaches/faq/page.tsx](src/app/for-coaches/faq/page.tsx)
- Controls surfaced in coach UI [src/app/(dashboard)/dashboard/coach/[clientId]/page.tsx](src/app/(dashboard)/dashboard/coach/[clientId]/page.tsx)
Flagged (not A+):
- Coach page does not lead with explicit no recruiter-side data sharing commitment as a top-line trust statement
- Security claims are broad; trust pack for coach buyers is not packaged as downloadable proof artifacts

### 8) Fast time to first value
Current grade: A-
Evidence:
- 15-minute preview framing in [src/app/for-coaches/page.tsx](src/app/for-coaches/page.tsx)
- Practical first-week motions documented in execution rhythm on [src/app/for-coaches/page.tsx](src/app/for-coaches/page.tsx)
Flagged (not A+):
- Missing explicit first-session-week KPI proof block (for example first signal action completed, first prep brief reviewed, first stalled client diagnosed)

---

## Non-A+ Flags (Must Fix)

1. Pricing clarity and coach economics are not A+.
2. Named coach social proof is not A+.
3. Session prep snapshot and progress markers over time are not A+.
4. Privacy trust packaging is not A+.
5. Risk-free pilot framing is not A+.
6. ROI calculator precision by coach model is not A+.

---

## Messaging Framework (Voss + Cialdini + Horstman)

### Voss layer (decision friction reduction)
Use in headline and sales copy:
- Tactical empathy: "You already do the hard coaching work."
- Labeling pain: "It sounds like too much paid time goes to context rebuild."
- Accusation audit: "This might feel like one more tool to manage."
- No-oriented close: "Would it be unreasonable to run this with two clients for 30 days before deciding?"

### Cialdini layer (conversion authority)
Apply in page structure:
- Authority: publish method notes and named practitioners
- Social proof: named coach quotes, not anonymous metrics
- Reciprocity: free pilot with implementation support
- Commitment consistency: 30-day scorecard with weekly check-ins
- Unity: "Built with transition coaches, not for generic job search"

### Horstman layer (managerial clarity)
Apply in workflow and onboarding:
- Clear role boundaries: platform handles signal and operating cadence, coach handles judgment and strategy
- Weekly cadence: Monday pipeline review, daily signal decision, pre-session prep brief review
- Accountability markers: visible weekly progress by client, not just static snapshots

---

## Epic Plan

Epic name: Coach A+ Conversion Motion
Epic horizon: 6 sprints
Sprint length: 2 weeks
Primary KPI: Coach preview to paid conversion rate
Secondary KPIs: Week-1 activation, 30-day retained paid coach accounts, client seat expansion per coach

### Sprint 1: Pricing and ROI Clarity
Goal: Remove pricing ambiguity and make coach economics obvious.
Deliverables:
1. Publish coach plan options on coach pages:
   - 99 per coach + 39 per client
   - 249 flat for up to defined seat count
2. Remove placeholder pricing language from FAQ.
3. Add coach ROI calculator by practice model:
   - Solo coach
   - Small firm (3-5 active transitions)
   - Boutique team (10+)
Acceptance:
- No pricing placeholders remain.
- Coach can calculate break-even in under 60 seconds.
Grade target:
- Pricing criterion from C+ to A+.

### Sprint 2: Social Proof and Trust Pack
Goal: Add persuasive authority and peer proof.
Deliverables:
1. Add 5 named transition coach testimonials with role context.
2. Add 3 mini case studies with before-after coaching workflow metrics.
3. Publish coach trust pack page with:
   - Permission model
   - Access logging model
   - No recruiter-side data-sharing statement
Acceptance:
- Coach page has named social proof above fold or immediately after primary value statement.
- Trust pack downloadable or linkable.
Grade target:
- Social proof from C to A+.
- Privacy posture from B+ to A.

### Sprint 3: Coach Workflow Product Surface Upgrade
Goal: Make workflow visibly coach-native.
Deliverables:
1. Add pre-session snapshot module in coach client view:
   - Signals since last session
   - Pipeline changes since last session
   - Briefs reviewed since last session
2. Add progress-over-time trend module:
   - Weekly momentum trend
   - Overdue trend
   - Signal response trend
Acceptance:
- Coach can prep for session in under 2 minutes from one screen.
Grade target:
- Session prep snapshot from B+ to A+.
- Progress markers from B to A+.

### Sprint 4: Pilot Motion and Risk Reversal
Goal: Turn "free preview" into measurable pilot decision framework.
Deliverables:
1. Explicit 30-day pilot package for 1-2 client seats.
2. Success checklist with hard pass/fail metrics:
   - First signal action in week 1
   - First prep brief used before high-stakes conversation
   - Reduction in session context rebuild time
3. End-of-pilot decision page and recommended next step.
Acceptance:
- Every preview runs with explicit success criteria.
Grade target:
- Risk-free motion from A- to A+.

### Sprint 5: Conversion Messaging Optimization
Goal: Increase coach trial starts and reduce objection leakage.
Deliverables:
1. Rewrite hero and objection section using Voss sequence.
2. Add Cialdini structure blocks in order:
   - Authority
   - Social proof
   - Reciprocity
   - Commitment
3. Add Horstman-style cadence visual for weekly operating system.
Acceptance:
- A/B test shows improved click-through from coach page to preview request.
Grade target:
- Content/positioning/messages to A+.

### Sprint 6: Instrumentation and Performance Review
Goal: Prove first-week value and scale what converts.
Deliverables:
1. Funnel instrumentation:
   - Landing to preview request
   - Preview request to pilot start
   - Pilot start to paid conversion
2. Week-1 value telemetry dashboard:
   - Time to first signal action
   - Time to first prep brief review
   - Time to first coach-visible client update
3. Monthly coach council review process.
Acceptance:
- Weekly KPI report auto-generated.
- Top 3 conversion blockers visible with owner.
Grade target:
- Fast time-to-value from A- to A+.
- Sustained A+ governance.

---

## Backlog (Prioritized)

P0
1. Replace all coach pricing placeholders and publish coach plan options.
2. Add named coach proof block on coach landing page.
3. Add explicit pilot success scorecard and 30-day decision framework.

## Named-proof placeholder model

When permissions are available, upgrade aggregate proof with three coach-case-study formats:

1. Solo coach case
- buyer type: independent executive coach
- baseline pain: too much session time lost to context rebuild
- visible change: prep brief use, faster first signal action, clearer weekly momentum

2. Boutique firm case
- buyer type: small multi-client practice
- baseline pain: inconsistent prep quality across active clients
- visible change: shared operating rhythm, clearer progress visibility, reduced admin drag

3. Sponsor or outplacement-adjacent case
- buyer type: program or sponsored transition workflow
- baseline pain: weak visibility between counselor or coach touchpoints
- visible change: stronger client accountability and sponsor-readable progress markers

P1
1. Add pre-session snapshot component in coach workspace.
2. Add trendlines for progress-over-time markers.
3. Publish coach trust pack and no recruiter-side sharing statement.

P2
1. Add segment-specific ROI calculators.
2. Expand case study library by coach type.
3. Add automated coach onboarding checklist.

---

## A+ Exit Criteria

The epic is complete only when all coach buying criteria are A+:
1. Clear ROI story in coach language: A+
2. Improves coaching, does not replace it: A+
3. Coach-specific workflow (all five required elements): A+
4. Risk-free starting motion: A+
5. Pricing matched to coaching economics: A+
6. Social proof from peers: A+
7. Strong privacy posture: A+
8. Fast time to first value: A+

If any criterion is below A+, the epic remains open.
