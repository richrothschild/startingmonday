# Non-Executive Landing Remediation Backlog

## Purpose
This backlog integrates selected findings from [docs/Starting Monday marketing.docx](docs/Starting%20Monday%20marketing.docx) into a tightly scoped execution plan for reducing cognitive load, increasing urgency, clarifying workflow, improving proof quality, and removing executive-language mismatch on non-executive pages.

## Source Rationale Tags
- SM-1: Site complexity is too high for first-time visitors.
- SM-2: Workflow is unclear after signup and first interaction.
- SM-3: Statistics alone are weak; concrete stories are needed.
- SM-4: Copy reads for insiders and contains audience mismatch.
- SM-5: Why-now urgency must be explicit and operational.

## Included Non-Executive Page Scope
### Core templates and pages
- [src/components/LandingPage.tsx](src/components/LandingPage.tsx)
- [src/app/page.tsx](src/app/page.tsx)
- [src/app/for-executives/[lane]/page.tsx](src/app/for-executives/[lane]/page.tsx)
- [src/app/for-vp-technology/page.tsx](src/app/for-vp-technology/page.tsx)

### Additional non-executive route rollout
- [src/app/for-vp/page.tsx](src/app/for-vp/page.tsx)
- [src/app/for-coaches/page.tsx](src/app/for-coaches/page.tsx)
- [src/app/for-outplacement/page.tsx](src/app/for-outplacement/page.tsx)
- [src/app/for-search-firms/page.tsx](src/app/for-search-firms/page.tsx)
- [src/app/for-financial-advisors/page.tsx](src/app/for-financial-advisors/page.tsx)
- [src/app/for-media-partners/page.tsx](src/app/for-media-partners/page.tsx)
- [src/app/for-relocation/page.tsx](src/app/for-relocation/page.tsx)
- [src/app/for-cio-associations/page.tsx](src/app/for-cio-associations/page.tsx)

## Out of Scope for This Backlog
- SEO/GEO expansion pages (comparison, glossary, stats pages)
- Founder visibility program and podcast strategy
- Product feature ideation from the marketing document
- Pricing strategy changes

## Execution Rules
- Max 6 primary sections per page.
- Max 1 primary CTA plus 1 secondary CTA per viewport.
- Max 4 FAQ items.
- Every non-executive page must include a Why now section and a This week action block.
- Prohibited on non-executive pages unless explicitly comparative: C-suite, board-level mandate, executive-only language.

## P0 Tickets (Build First)

### P0-01 Template simplification and mode controls
- Goal: Reduce cognitive load in shared landing template.
- File scope: [src/components/LandingPage.tsx](src/components/LandingPage.tsx)
- Changes:
  - Add nonExecutiveMode rendering guard.
  - Hide executive-only matrix and differentiation blocks when nonExecutiveMode is active.
  - Collapse multi-proof stack into one compact proof module.
  - Reduce next-step chooser to single primary CTA and optional secondary CTA.
- Acceptance criteria:
  - Non-exec pages no longer render executive-only capability sections.
  - No more than 6 primary sections rendered for non-exec pages.
  - Hero, proof, and CTA are visible without heavy scroll.
- Source rationale: SM-1, SM-4.

### P0-02 Homepage clarity and urgency rewrite
- Goal: Improve immediate comprehension and action intent on homepage.
- File scope: [src/app/page.tsx](src/app/page.tsx)
- Changes:
  - Rewrite hero to outcome-first and action-first copy.
  - Replace broad executive framing with leadership-transition wording usable by non-exec users.
  - Reduce situations from 6 to 4 high-intent states.
  - Add why-now line above hero CTA.
- Suggested copy block:
  - Eyebrow: Better roles are often shaped before they are posted.
  - Headline line 1: Find the right role window early.
  - Headline line 2: Act with a weekly plan that gets replies.
  - Body preamble: Built for managers, directors, VPs, and senior operators in transition.
  - Body: Move from passive browsing to a disciplined search rhythm.
- Acceptance criteria:
  - First-screen message answers who, what, and why-now in under 10 seconds.
  - One primary CTA dominates visual hierarchy.
- Source rationale: SM-1, SM-4, SM-5.

### P0-03 Lane-page audience correction
- Goal: Remove executive-language mismatch on non-executive transition lanes.
- File scope: [src/app/for-executives/[lane]/page.tsx](src/app/for-executives/[lane]/page.tsx)
- Changes:
  - Rewrite lane title/description copy to manager-director-VP transition language.
  - Replace executive audience phrasing with recruiter and hiring-manager phrasing.
  - Keep lane-specific value but shorten body copy for scanability.
  - Simplify tutorial intro to one sentence and keep 3 assets.
- Suggested copy blocks:
  - Leadership lane eyebrow: Promotions are won on scope clarity and timing.
  - Technical leadership eyebrow: Technical depth wins only when business impact is clear.
  - Delivery leadership eyebrow: Delivery leaders are selected on execution judgment under constraint.
- Acceptance criteria:
  - Zero executive-only language in non-exec lane hero and FAQ copy.
  - Each lane has one clear value proposition and one urgency statement.
- Source rationale: SM-1, SM-4, SM-5.

### P0-04 VP Technology page rewrite for clarity and action
- Goal: Clarify VP-level value and create immediate action pressure.
- File scope: [src/app/for-vp-technology/page.tsx](src/app/for-vp-technology/page.tsx)
- Changes:
  - Replace long-form hero paragraph with concise outcome-plus-urgency statement.
  - Rewrite steps into three short operational actions.
  - Add This week action block under hero CTA.
  - Rewrite FAQ answers to VP-hiring criteria language and remove executive overreach.
- Suggested copy block:
  - Eyebrow: Most VP Technology openings are shaped before posting.
  - Headline line 1: Win the right VP mandate.
  - Headline line 2: Move before the shortlist hardens.
  - Body: Track org changes, prioritize warm-path outreach, and show measurable scope impact in every conversation.
- Acceptance criteria:
  - Page communicates workflow in 3 clear steps.
  - Primary CTA is unambiguous and tied to immediate next action.
- Source rationale: SM-1, SM-2, SM-4, SM-5.

## P1 Tickets (Rollout Across Remaining Non-Executive Pages)

### P1-01 Non-exec language and section pass across for-* pages
- Goal: Apply same clarity and language rules across all non-exec landing routes.
- File scope: all routes listed in Included Non-Executive Page Scope.
- Changes:
  - Add role-appropriate vocabulary pass.
  - Enforce section and CTA limits.
  - Add why-now and this-week action blocks.
- Acceptance criteria:
  - All non-exec pages pass vocabulary lint and section budget checks.
- Source rationale: SM-1, SM-4, SM-5.

### P1-02 Workflow clarity modules
- Goal: Standardize what happens next across non-exec pages.
- File scope: shared and route-level page copy.
- Changes:
  - Add 3-step workflow module to each non-exec page.
  - Include explicit first-week expectations.
- Acceptance criteria:
  - Users can describe first week workflow after one read.
- Source rationale: SM-2.

### P1-03 Proof stories module
- Goal: Replace proof overreliance on aggregate metrics.
- File scope: shared proof area and route-level content blocks.
- Changes:
  - Add 2 to 3 short role-specific stories per page type.
  - Keep one metric strip plus one story module; remove proof redundancy.
- Acceptance criteria:
  - Each non-exec page includes at least one role-matched story with context and outcome.
- Source rationale: SM-3.

## P2 Tickets (Measurement and Guardrails)

### P2-01 Instrument clarity and urgency metrics
- Goal: Validate that simplification improves user behavior.
- File scope: CTA event points and section telemetry.
- Changes:
  - Track hero CTA click-through by route.
  - Track drop-off before proof and before next-step block.
  - Track time to first interaction.
- Acceptance criteria:
  - Dashboard compares pre and post metrics for P0 pages.
- Source rationale: SM-1, SM-5.

### P2-02 Copy governance checklist in PR workflow
- Goal: Prevent regression to high-load and mismatched copy.
- File scope: PR template and editorial checklist docs.
- Changes:
  - Add checklist gates for role-language fit, workflow clarity, and urgency presence.
  - Add reject criteria for insider jargon and CTA overload.
- Acceptance criteria:
  - Every related PR includes completed checklist.
- Source rationale: SM-1, SM-2, SM-4, SM-5.

## Implementation Sequence
1. Complete P0-01 through P0-04 in one sprint.
2. Execute P1-01 through P1-03 for remaining non-exec routes.
3. Enable P2-01 and P2-02 to prevent regressions.

## Definition of Done
- Non-executive pages no longer contain audience-mismatched executive language.
- Users can state who it is for, how it helps, and why act now from first screen.
- Workflow is visible as a 3-step path with first-week actions.
- Proof includes role-specific stories, not metrics alone.
- All pages comply with section, CTA, and FAQ limits.
