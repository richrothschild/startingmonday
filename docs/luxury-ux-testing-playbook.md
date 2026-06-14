# Luxury UX Testing Playbook

Date: 2026-06-14

## Standard Workflow

### 1) During design

Run a quick luxury pass on the page you are editing:

```bash
LUXURY_TEST_BASE_URL=http://localhost:3000 npm run ux:luxury:design
```

What this checks now:
- First-click clarity for key tasks on for-coaches.
- Readability and premium-density baseline.
- Accessibility basics (single H1, heading-level continuity, keyboard disclosure).

### 2) During testing

Run the full luxury suite (desktop + mobile):

```bash
LUXURY_TEST_BASE_URL=http://localhost:3000 npm run test:e2e:luxury
```

What this adds:
- Mobile premium scan behavior.
- Disclosure interaction checks on touch layouts.

### 3) During commit

Pre-commit now runs a staged static luxury gate automatically:

```bash
npm run ux:luxury:static:staged
```

The static gate currently enforces:
- Tiny-text drift guard on changed `src/app/**/page.tsx` files.
- Repeated CTA label guard (prevents choice overload from duplicate labels).
- Uppercase micro-label noise guard (keeps tiny uppercase usage occasional).
- Comparison editorial structure guard (requires key takeaway + disclosure control on comparison sections).

### Tiered Enforcement (Phase 2)

Luxury static enforcement now supports route tiers so quality can ratchet up without blocking unrelated dashboard work.

- Tier 1: `public-premium` (default, blocking)
	- Core premium public routes (home, pricing, demo, and `for-*` route family).
- Tier 2: `public-all` (optional ratchet)
	- All other public page routes.
- Tier 3: `all-pages` (full ratchet)
	- Includes dashboard/internal pages.

When a file is outside the active enforcement tier, findings are reported as monitor-only and do not fail the gate.

Commands:

```bash
# default (public-premium blocks)
npm run ux:luxury:static

# ratchet to all public pages
npm run ux:luxury:static:public-all

# ratchet to all pages (including dashboard/internal)
npm run ux:luxury:static:all-pages

# staged variants for pre-commit style usage
npm run ux:luxury:static:staged
npm run ux:luxury:static:staged:public-all
npm run ux:luxury:static:staged:all-pages
```

Suggested rollout:

1. Keep `public-premium` as default blocker.
2. Clean up monitor-only findings on public non-premium routes.
3. Promote to `public-all` in CI once public monitor findings are under threshold.
4. Promote to `all-pages` after dashboard baseline remediation windows are complete.

## High-Impact Luxury Standards (Required)

These standards are now treated as delivery requirements for premium pages:

1. Raise legibility baseline.
2. Move most 10-12px body/support copy to 13-14px.
3. Reserve tiny uppercase only for occasional metadata labels.
4. Simplify action architecture.
5. Keep one primary CTA and one secondary CTA visible per major section.
6. Remove repeated links with identical intent in lower sections.
7. Make comparison feel more editorial premium.
8. Keep default 3-row summary.
9. Add short key takeaway sentence above table.
10. Keep expanded rows behind disclosure.
11. Tighten message economy.
12. Reduce jargon density in table cells and trust copy.
13. Replace compound phrases with simpler executive phrasing.
14. Refine hierarchy rhythm.
15. Add slightly more vertical spacing between dense blocks.
16. Use fewer emphasis styles per section to reduce visual noise.

### How these are enforced now

- Automated E2E (`tests/e2e/luxury-ux.spec.ts`):
	- Legibility ratio guard (tiny-text ceiling + support-text 13-14 ratio floor).
	- CTA count/repetition guard and major-section CTA cap.
	- Comparison structure guard (key takeaway, 3-row default, disclosure-hidden expansion).
	- Accessibility polish baseline and mobile premium scan checks.
- Commit-time static gate (`scripts/check-luxury-ux-static-gate.mjs`):
	- Tiny text drift.
	- Repeated CTA labels.
	- Uppercase micro-label overuse.
	- Missing comparison key takeaway/disclosure on comparison sections.

## Additional Luxury-Focused Tests

Some tests are now automated, others are structured research protocols.

### Automated in repo now
- First-click clarity test (`luxury-ux.spec.ts`).
- Readability + premium-density baseline (`luxury-ux.spec.ts`).
- Mobile premium scan behavior (`luxury-ux.spec.ts`).
- Accessibility polish basics (`luxury-ux.spec.ts`).

### Structured manual tests (run weekly or pre-release)

1. First-impression desirability (5-second)
- Ask: "What kind of brand is this?"
- Ask: "What is the main value?"
- Target: clear premium + strategic positioning recognition.

2. CTA reduction A/B test
- Variant A: current CTA architecture.
- Variant B: reduced CTA count by 30-40%.
- Metrics: preview click-through, scroll completion.

3. Readability simplification A/B
- Variant A: current copy.
- Variant B: simplified comparison/trust copy.
- Metrics: dwell quality, conversion rate.

4. Mobile premium scan observation
- Observe thumb-scroll behavior through journey/comparison.
- Track disclosure expansion rate and drop-off.

5. Accessibility polish deep pass
- Focus states and keyboard traversal.
- Heading order across templates.
- Summary/details keyboard behavior.
- Contrast compliance in all key sections.

## Recommended Cadence

- Daily: run `ux:luxury:design` while iterating on premium pages.
- PR readiness: run `test:e2e:luxury` before requesting review.
- Every commit: rely on pre-commit staged static gate.
- Weekly: run manual desirability + A/B protocol review with captured notes.
