# Epic: Executive Pages UX Remediation and Luxury Measurement Hardening

Date: 2026-06-14  
Owner: Product + Design + Engineering + Content  
Source audit: [docs/executive-pages-ux-audit-2026-06-14.md](docs/executive-pages-ux-audit-2026-06-14.md)

## Objective

Fix all findings in the executive-pages UX report, reduce executive decision friction, raise trust/proof quality, and enforce luxury-grade UX measurement checks on every executive-facing page.

## Execution Status (2026-06-18)

- EXUX-301: complete. Executive-route luxury E2E coverage runs through `tests/e2e/luxury-public-all-pages.spec.ts` and `npm run test:e2e:luxury:public-all`.
- EXUX-302: complete. Public-all luxury static enforcement is now a blocking CI job in `.github/workflows/ci.yml` (`luxury-static-public-all`).
- EXUX-303: complete. Lighthouse route coverage now includes executive route set and persona detail route across `.lighthouserc.json`, `.lighthouserc.tight-850.json`, and `.lighthouserc.tight-800.json`.
- EXUX-304: complete. Closure audit and sign-off published in `docs/status/exux-304-closure-audit-2026-06-18.md`.

## In Scope (Pages)

- /for-executives
- /for-cio
- /for-vp-technology
- /for-data-officer
- /for-cdo
- /for-ciso
- /for-cpo
- /for-coo
- /for-vp (redirect behavior)
- /executives
- /executives/active
- /executives/passive
- /executives/personas
- /executives/personas/[slug]
- /career-tools
- /about

## Report Issues to Remediate (Must Close)

1. Internal source-path artifact shown on /for-cio.
2. Ambiguous CTA label Open executive journey on /executives.
3. Unsupported high-stakes claim on /for-data-officer.
4. Front-loaded pre-hero content and CTA overload on /for-cio.
5. Undefined term two registers on /for-cpo.
6. Shared link microcopy artifact in landing component.
7. Persona selection lacks guidance layer.
8. Over-absolute phrasing risks.
9. Repeated generic motivational motif.
10. FAQ answer density and readability burden.
11. Broader cognitive-load issues from too many concurrent choices and long blocks.

## Epic Success Metrics

### Primary

1. All 11 report issue groups are closed with code + content + UX evidence.
2. Executive hub and persona-path CTA click-through improves by >= 15% from baseline.
3. Trust/proof confidence score (qual + survey) improves by >= 20% on executive routes.

### Secondary

1. Luxury static gate passes for all changed executive pages.
2. Luxury E2E checks pass for all executive pages on desktop and mobile projects.
3. Lighthouse CI budgets pass on all changed executive pages.
4. No regressions in route availability, accessibility baseline, or SEO metadata integrity.

## Luxury Measurement Framework (Required Per Page)

Reference standards: [docs/luxury-ux-testing-playbook.md](docs/luxury-ux-testing-playbook.md)

### Required automated checks for each in-scope page

1. Static luxury gate (tiny-text drift, CTA repetition, uppercase micro-label noise, comparison editorial checks where applicable).
2. Luxury E2E route checks (desktop + mobile):
- heading hierarchy sanity
- CTA count and repetition constraints
- no horizontal overflow on mobile
- disclosure interactions if present
- readability and support-text ratio thresholds
3. Lighthouse budget checks for changed routes.

### Standard commands

```bash
npm run ux:luxury:static:staged:public-all
npm run test:e2e:luxury
npm run perf:lighthouse:budget:config
npm run perf:lighthouse:ci
```

## Page-by-Page Luxury Check Matrix

| Page | Static Gate | Luxury E2E Desktop | Luxury E2E Mobile | Lighthouse Budget | Ticket Close Evidence |
| --- | --- | --- | --- | --- | --- |
| /for-executives | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /for-cio | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /for-vp-technology | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /for-data-officer | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /for-cdo | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /for-ciso | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /for-cpo | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /for-coo | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /for-vp | Redirect check | Required | Required | N/A (redirect) | redirect assertion + no-loop evidence |
| /executives | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /executives/active | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /executives/passive | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /executives/personas | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /executives/personas/[slug] | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /career-tools | Required | Required | Required | Required | CI logs + screenshot + metric export |
| /about | Required | Required | Required | Required | CI logs + screenshot + metric export |

## Sprint Plan

Sprint cadence: 2 weeks  
Epic horizon: 4 sprints  
Ticket ID prefix: EXUX

---

## Sprint 1: Trust and Clarity Hotfixes

Goal: Remove high-severity trust/clarity defects and fix direct copy artifacts.

### Ticket EXUX-001: Remove internal proof-source path from /for-cio
- Type: Content + Frontend
- Estimate: S
- Scope: [src/app/for-cio/page.tsx](src/app/for-cio/page.tsx)
- Success criteria:
1. No internal file path appears in public proof text.
2. Proof disclosure includes denominator + window + results variability in user-safe language.
3. Luxury checks for /for-cio pass (static + E2E + lighthouse).

### Ticket EXUX-002: Replace ambiguous executive hub CTA label
- Type: UX copy + Frontend
- Estimate: XS
- Scope: [src/app/executives/page.tsx](src/app/executives/page.tsx)
- Success criteria:
1. Open executive journey is replaced with explicit destination-intent copy.
2. Analytics event naming updated and remains attributable.
3. Luxury checks for /executives pass.

### Ticket EXUX-003: Add evidence context or bounded claim framing on /for-data-officer
- Type: Content strategy + Frontend
- Estimate: S
- Scope: [src/app/for-data-officer/page.tsx](src/app/for-data-officer/page.tsx)
- Success criteria:
1. Claim is either evidence-linked or rewritten with attribution/bounded language.
2. Metadata and hero language are consistent.
3. Luxury checks for /for-data-officer pass.

### Ticket EXUX-004: Fix shared landing microcopy artifact
- Type: Frontend
- Estimate: XS
- Scope: [src/components/LandingPage.tsx](src/components/LandingPage.tsx)
- Success criteria:
1. Link copy is corrected and punctuation normalized.
2. No regressions across all pages using LandingPage.
3. Luxury checks pass for all LandingPage-powered executive routes.

### Ticket EXUX-005: Sprint 1 verification pack
- Type: QA + Analytics
- Estimate: S
- Scope: all Sprint 1 changed routes
- Success criteria:
1. Attach CI evidence for static gate, luxury E2E, and lighthouse.
2. Attach before/after screenshots and route-level diff summary.
3. Mark report issues A, B, C, F as closed.

---

## Sprint 2: Decision Friction and Cognitive Load Reduction

Goal: Reduce above-the-fold overload, simplify decision architecture, and improve readability.

### Ticket EXUX-101: Reduce /for-cio pre-hero complexity
- Type: UX + Frontend
- Estimate: M
- Scope: [src/app/for-cio/page.tsx](src/app/for-cio/page.tsx)
- Success criteria:
1. Above fold has one primary and one secondary CTA max.
2. Objection block moved to lower-friction position.
3. Scroll-depth and first CTA click-through improve vs Sprint 1 baseline.
4. Luxury checks for /for-cio pass.

### Ticket EXUX-102: Add persona guidance layer on /executives/personas
- Type: UX + Frontend
- Estimate: M
- Scope: [src/app/executives/personas/page.tsx](src/app/executives/personas/page.tsx)
- Success criteria:
1. Add quick route recommender (2-3 qualifying prompts) above persona grid.
2. Suggested persona logic is deterministic and test-covered.
3. Persona page exits to selected route improve by >= 15%.
4. Luxury checks for /executives/personas and /executives/personas/[slug] pass.

### Ticket EXUX-103: FAQ readability refactor (thesis + bullets)
- Type: Content + Frontend
- Estimate: M
- Scope: /for-executives, /for-cio, /for-vp-technology, /for-data-officer, /for-cdo, /for-ciso, /for-cpo, /for-coo
- Success criteria:
1. Dense paragraph answers are converted to thesis + 3 concise bullets format.
2. Reading scan-time reduces in UX review (qualitative benchmark rubric).
3. No loss of role specificity.
4. Luxury checks pass for all touched routes.

### Ticket EXUX-104: Remove generic motivational repeats and replace with role-specific friction lines
- Type: Content
- Estimate: S
- Scope: executive persona pages
- Success criteria:
1. Repeated generic motif is removed/reduced.
2. Replacement copy is role-specific and evidence-linked where possible.
3. Luxury checks pass for touched pages.

### Ticket EXUX-105: Sprint 2 verification pack
- Type: QA + Data
- Estimate: S
- Success criteria:
1. Decision-friction metrics and route analytics attached.
2. Luxury and lighthouse evidence attached for all modified pages.
3. Report issues D, G, and FAQ-density risk marked closed.

---

## Sprint 3: Proof, Messaging Integrity, and Role-Specific Credibility

Goal: Raise executive proof confidence and eliminate wording that causes skepticism.

### Ticket EXUX-201: Add role-specific proof strips across executive routes
- Type: Product marketing + Frontend
- Estimate: L
- Scope: all /for-* executive role pages
- Success criteria:
1. Each role page has proof strip with denominator + timeframe + method link.
2. Proof language is conservative and board-safe.
3. Trust/proof component is reusable with typed schema.
4. Luxury checks pass for each role page.

### Ticket EXUX-202: Normalize over-absolute wording to bounded claims
- Type: Content governance
- Estimate: S
- Scope: metadata + hero + FAQ across all in-scope pages
- Success criteria:
1. Absolute claims are replaced with attributed/bounded forms.
2. Claim style aligns with proof governance standards.
3. Metadata consistency checks pass.

### Ticket EXUX-203: Define previously ambiguous strategic terms in-place
- Type: Content UX
- Estimate: XS
- Scope: [src/app/for-cpo/page.tsx](src/app/for-cpo/page.tsx) and any similar pages
- Success criteria:
1. Undefined terms (for example two registers) are explicitly defined where used.
2. Readers can understand without additional page hops.
3. Luxury checks for touched pages pass.

### Ticket EXUX-204: Executive trust/claims QA checklist in CI docs
- Type: Process + Docs
- Estimate: S
- Scope: docs + PR checklist templates
- Success criteria:
1. Add checklist requiring denominator/timeframe/method for major claims.
2. Add fail condition for internal-path leakage in marketing surfaces.
3. Team adoption confirmed in PR template workflow.

### Ticket EXUX-205: Sprint 3 verification pack
- Type: QA + Analytics
- Estimate: S
- Success criteria:
1. Trust/proof score movement documented.
2. Luxury/lighthouse evidence attached for all changed routes.
3. Report issues E and wording-risk cluster marked closed.

---

## Sprint 4: Measurement Hardening and Epic Closeout

Goal: Make luxury checks page-complete and prevent regressions.

### Ticket EXUX-301: Expand luxury E2E suite to cover all executive routes
- Type: QA Automation
- Estimate: L
- Scope: [tests/e2e/luxury-ux.spec.ts](tests/e2e/luxury-ux.spec.ts)
- Success criteria:
1. Route matrix includes all in-scope executive pages.
2. Desktop and mobile projects assert route-level luxury thresholds.
3. Redirect behavior for /for-vp is verified.
4. CI runtime and flake rate stay within agreed thresholds.

### Ticket EXUX-302: Route-tier static gate enforcement to public-all for executive surfaces
- Type: QA Automation + CI
- Estimate: M
- Scope: luxury static gate scripts/workflows
- Success criteria:
1. Executive routes are enforced at public-all tier in CI.
2. Any static luxury violation blocks PR.
3. Monitor-only findings reduced to 0 for executive route set.

### Ticket EXUX-303: Lighthouse budget route coverage for executive pages
- Type: Performance + CI
- Estimate: M
- Scope: .lighthouserc and perf scripts
- Success criteria:
1. All executive routes added to lighthouse run set.
2. Budgets defined and passing per route.
3. Budget drift alerts documented and actioned.

### Ticket EXUX-304: Epic closure audit and sign-off
- Type: Program + QA + Product
- Estimate: S
- Success criteria:
1. All issue groups from source report are marked closed with linked evidence.
2. All page rows in luxury matrix are green.
3. Final before/after scorecard published.
4. Follow-on backlog created for non-blocking enhancements.

---

## Ticket Summary Table

| Ticket | Sprint | Theme | Estimate | Blocking dependency |
| --- | --- | --- | --- | --- |
| EXUX-001 | 1 | Trust artifact removal | S | None |
| EXUX-002 | 1 | CTA clarity | XS | None |
| EXUX-003 | 1 | Claim support framing | S | None |
| EXUX-004 | 1 | Shared copy fix | XS | None |
| EXUX-005 | 1 | Verification | S | EXUX-001..004 |
| EXUX-101 | 2 | CIO cognitive load | M | EXUX-001 |
| EXUX-102 | 2 | Persona guidance | M | EXUX-002 |
| EXUX-103 | 2 | FAQ readability | M | None |
| EXUX-104 | 2 | Messaging specificity | S | None |
| EXUX-105 | 2 | Verification | S | EXUX-101..104 |
| EXUX-201 | 3 | Proof strips | L | EXUX-003 |
| EXUX-202 | 3 | Claim governance | S | EXUX-201 |
| EXUX-203 | 3 | Term definition clarity | XS | EXUX-103 |
| EXUX-204 | 3 | CI claim checklist | S | EXUX-202 |
| EXUX-205 | 3 | Verification | S | EXUX-201..204 |
| EXUX-301 | 4 | Luxury E2E expansion | L | EXUX-105 |
| EXUX-302 | 4 | Static gate hardening | M | EXUX-301 |
| EXUX-303 | 4 | Lighthouse coverage | M | EXUX-301 |
| EXUX-304 | 4 | Epic closeout | S | EXUX-302, EXUX-303 |

## Definition of Done (Epic)

1. Every report issue is closed with linked implementation evidence.
2. Every in-scope page passes luxury static, luxury E2E, and lighthouse checks (or documented exception with approval).
3. Executive route conversion and trust/proof KPIs meet target improvements.
4. CI prevents recurrence of trust artifacts, claim-quality misses, and luxury-regression drift.
