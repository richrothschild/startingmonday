# UI Review Plan from Notes (Plan-Mode Draft)

Date: 2026-06-04
Source notes: docs/UI Folder/UI Review Starting Monday.docx

## Decisions Locked (2026-06-04)

- Homepage primary CTA: Apply for confidential beta
- Executive URL: rename to /for-executives
- Coach prep worksheet: complete rewrite
- Execution tracker source of truth: Jira
- Next deliverable: recommendations only for now (no Jira backlog generation yet)

## 1. Top-Level Direction

Primary direction from notes:
- Simplify above-the-fold messaging across key pages.
- Reduce CTA count to one clear primary action per page context.
- Replace dense sections with BLUF-style summaries and progressive disclosure.
- Improve role-specific journey language (especially executive and coach paths).
- Add concise objection handling.
- Standardize footer and navigation consistency.

## 2. Priority Order (What to do first)

Priority 0 (Critical conversion impact)
1. Homepage: hero, CTA consolidation, BLUF conversion, interaction model for outcomes.
2. Executive page (/for-executives): positioning, naming clarity, executive-specific journey and CTA reduction.
3. Coaches page (/for-coaches): title, value framing, objection handling, section compression.

Priority 1 (Offer architecture + monetization UX)
4. Micro-products index: structure, pricing visibility, bundle placement, product taxonomy expansion.
5. Micro-product detail standard: unify component structure, checkout copy logic, and user journey.

Priority 2 (System coherence)
6. Global footer standard and back-home pattern across pages.
7. Article-link and Learn more architecture (shared components + content model).
8. Role-path IA cleanup and section ordering rules.

## 3. Page-by-Page Actions

## Homepage (/)

Required changes:
- Move pick-your-channel higher and clean layout.
- Keep one primary CTA in top fold.
- Rework hero statement and remove current private-career-infrastructure line.
- Replace at-a-glance block with BLUF + expandable Learn more with linked articles.
- Reframe What you get around timing, relationships, strategy leverage, and narrative adaptation.
- Convert four-outcomes list into interactive buttons (summary on click).
- Add concise objection handling section.
- Improve role-path organization.
- Remove Need details line.
- Update footer copy to no sale of user data, ever.

## Executive page (/for-executives)

Required changes:
- Replace /for-vp with /for-executives and update internal links/SEO metadata.
- Redo hero and above-the-fold to emphasize C-suite and board expectations.
- Merge or collapse why it matters and at-a-glance into BLUF-first model.
- Rebuild What you get as interactive, executive-specific outcomes.
- Reduce CTA count and tailor next-step behavior to executive journey stage.
- Expand role-path completeness.
- Remove Need details line.

## Coaches page (/for-coaches)

Required changes:
- Rename Coach partner preview to Executive Coaches.
- Reframe strategy line toward outcome language.
- Add BLUF at top and concise objection handling.
- Add clear better-than-alternatives and ease-of-use proof.
- Reduce and simplify CTA pattern (possibly one in header + one contextual primary).
- Replace From pressure to control with From chaos to control.
- Redesign long stacked sections into expandable button summaries.
- Rework More resources with stronger escalation path (chat/contact/help lane).

## Coach prep worksheet page

Required changes:
- Reassess tone and dignity of framing.
- Reposition as executive-grade coaching enablement worksheet.
- Align copy with professional workflow language, not novice framing.

## Micro-products index (/for-coaches/micro-products)

Required changes:
- Remove Small Products line.
- Reframe value proposition toward business outcomes.
- Show pricing clearly at card level.
- Place bundles after individual micro products.
- Add 10+ additional products mapped to channel pain points.
- Design cross-product data reuse to reduce re-entry.

## Micro-product detail pages (starting with executive-proof-library-builder)

Required changes:
- Create a standard page template for all micro products.
- Rewrite checkout copy blocks for urgency, outcomes, and trust.
- Redesign before you run the demo into BLUF + why this is different + objection handling.
- Add full account option in What you get.
- Add consistent footer and back-home link.

## 4. Plan-Mode Execution (Claude-style structure)

Phase A (1 week): Messaging + CTA architecture
- Output: finalized narrative map, CTA hierarchy, BLUF schema.
- Deliverables:
  - Message hierarchy by page and audience.
  - CTA policy: one primary action per viewport context.
  - Objection-handling microcopy library.

Phase B (1-2 weeks): Core page redesign
- Output: redesigned homepage, executive page, coaches page.
- Deliverables:
  - Updated above-the-fold sections.
  - Interactive outcomes component.
  - Progressive Learn more architecture tied to article links.

Phase C (1 week): Product surface redesign
- Output: micro-products index + detail template standard.
- Deliverables:
  - New index IA with price and bundle order.
  - Standard detail-page component kit.
  - Copy standards for checkout and proof sections.

Phase D (ongoing): QA + instrumentation
- Output: measurable improvements and confidence before wider rollout.
- Deliverables:
  - Event tracking for CTA clicks, section expands, and scroll depth.
  - A/B test candidates for hero, BLUF, and CTA text.
  - Mobile-first pass and accessibility checks.

## 5. Delivery Artifacts You Should Create

- UI copy deck per page (final approved language).
- Component inventory (new, reused, deprecated).
- Interaction specs for:
  - expandable BLUF sections
  - outcome buttons
  - Learn more panels
- Analytics plan with success metrics:
  - primary CTA click-through
  - section expansion rate
  - bounce reduction above fold
  - conversion to demo/beta action

## 6. Should you use cmux?

Short answer: no, not for this.

Reason:
- cmux is a Go connection multiplexer for network services.
- It does not help organize UI planning, UX reviews, or front-end implementation workflow.

Use instead:
- Project organization: Linear or Jira for execution tracking.
- Design system and handoff: Figma + FigJam.
- Copy and information architecture: Notion or Coda.
- UI implementation planning: GitHub Projects or Jira board with epics/stories.

## 7. UI/UX Tools Recommended

Research and validation:
- Maze or Lyssna for rapid usability tests.
- Hotjar or FullStory for session behavior and friction analysis.

Design and prototyping:
- Figma (components, variants, prototypes).
- Stark plugin for accessibility checks.

Build-time quality:
- Storybook for component states and visual review.
- Chromatic or Percy for visual regression.
- Lighthouse CI for performance and best-practices tracking.

Content and consistency:
- Writer or Grammarly Business style checks.
- Internal copy checklist for BLUF + CTA policy.

## 7.1 Tool Stack Recommendation for Your Goals

Use this stack as the default operating model:
- Planning and execution: Jira
- Design and flow planning: Figma + FigJam
- Frontend implementation quality: Storybook + Chromatic
- Behavior validation: Hotjar
- Performance guardrails: Lighthouse CI

Why this fits your goals:
- You need fast, role-specific page iteration with low regression risk.
- You need measurable conversion movement, not just visual polish.
- You need one clear planning authority (Jira) while design and implementation run in parallel.

Not recommended for this work:
- cmux (network multiplexer, not a UI planning or UX execution tool)

## 7.2 BLUF Reveal Pattern Options (with recommendation)

Accordion expansion in-page:
- Best for: content-heavy pages where users scan several sections quickly.
- Pros: low cognitive overhead, SEO-friendly if server-rendered, easy to compare sections.
- Risks: can become visually long if too many panels are expanded.

Inline reveal under each section:
- Best for: lightweight summaries tied to specific cards or buttons.
- Pros: tight context and minimal motion, feels fast and focused.
- Risks: harder to maintain consistency if each block grows differently.

Modal pop-up:
- Best for: deep detail that should not interrupt the base layout.
- Pros: strong focus and clear separation from primary content.
- Risks: weaker scanability, more friction on mobile, often overused for simple copy.

Recommended default for your notes:
- Accordion expansion in-page for homepage, /for-executives, and /for-coaches BLUF sections.
- Inline reveal for short outcome-card summaries.
- Avoid modals unless content requires multi-step context.

## 8. Risks to Watch

- Over-rotating to brevity and losing trust context.
- Too many custom interactions without a component standard.
- Role-specific pages drifting away from one coherent brand voice.
- Adding many micro-products before standardizing template quality.

## 9. Recommended Immediate Next Steps

1. Apply single-CTA rule now: Apply for confidential beta as top-fold primary action.
2. Rename route to /for-executives and align nav/internal linking.
3. Implement BLUF as accordion-first plus inline summaries for outcome cards.
4. Complete full rewrite of coach prep worksheet with executive-grade tone.
5. Set up Jira epic structure for UI pivot execution (when you want backlog generation).
