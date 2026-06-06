# Elite Site UX / UI Rubrics

Applied to: startingmonday.app  
Reference sites: Linear.app, Stripe.com, Notion.so, Vercel.com, Arc.net, Loom.com

---

## 1. Clarity of value proposition

**Rubric:** Can a first-time visitor state what the product does and who it is for within 5 seconds?

| Signal | Target | Current state |
|---|---|---|
| H1 states the outcome, not the feature | Yes | ✓ — hero h1 frames timing/narrative/prep |
| Subheading names the audience | Yes | ✓ — "C-suite executives and senior operators" |
| No jargon above the fold | Yes | ✓ — no product jargon in primary hero |

**Applied changes:** Hero sentence 1 (eyebrow) reduced 2 font sizes to de-emphasize the setup. Sentence 2 (core claim) reduced 1 size. Sentence 3 (CTA/closer) stays largest — it is the action frame.

---

## 2. Visual hierarchy

**Rubric:** Does the eye move naturally from the most important element to the least important?

| Signal | Target | Current state |
|---|---|---|
| One dominant CTA per viewport | Yes | ✓ — "Start Now" orange on dark |
| Font sizing creates clear levels (H1 > body > label) | Yes | ✓ after hero font resize fix |
| White space separates logical blocks | Yes | ✓ — section padding consistent |
| Charts are legible at typical viewport | Yes | ✓ after +2 font size fix on SVG text |

**Applied changes:** SVG axis labels and annotation text increased from 10–12px to 12–14px. Chart titles stripped of trailing category word ("Chart", "Scatter") per convention that the chart IS the evidence, not a labelled exhibit.

---

## 3. Perceived performance

**Rubric:** Does the page feel fast regardless of measured load time?

| Signal | Target | Current state |
|---|---|---|
| Content is visible above fold with no layout shift | Yes | ✓ — static hero renders server-side |
| Skeleton/streaming states shown for dynamic content | Yes | ✓ — demo brief uses streaming dots |
| No blocking font loads | Yes | ✓ — system font stack used |

---

## 4. Conversion pathway clarity

**Rubric:** Is there one clear next step from every page, appropriate to the user's position in the funnel?

| Page | Expected CTA | Current state |
|---|---|---|
| Homepage | Start Now / Sign Up | ✓ |
| Pricing | Start free trial (per card) | ✓ — all 3 cards aligned bottom after flex-col fix |
| Demo | Start free trial | ✓ after revamp |
| Blog post | Signup or demo | ✓ — role-signals post now gates methodology, offers signup |
| Blog index | See a live prep brief | ✓ |
| Method & Evidence | Explore supporting evidence | ✓ after "Dig deeper" rewrite |
| Signup | Create account | ✓ — jump-to nav removed (friction without value) |

**Applied changes:** Pricing cards switched to `flex flex-col` + `mt-auto` on CTA so all "Start free trial" buttons align at the same vertical position regardless of feature list length.

---

## 5. Trust signals placement

**Rubric:** Are trust signals visible at the point of decision, not buried elsewhere?

| Signal | Target | Current state |
|---|---|---|
| Privacy assurance near signup CTA | Yes | ✓ — "Your employer cannot see your account" |
| Pilot data near hero | Yes | ✓ — Proof line present |
| Social proof near CTA | Yes | Partial — pilot data used, no named testimonials |

---

## 6. Information scent

**Rubric:** Can a user predict what they will find on the next page from the current page's copy?

| Signal | Target | Current state |
|---|---|---|
| Nav labels match page headings | Yes | ✓ |
| CTA copy describes the destination | Yes | ✓ — "See a live prep brief →" |
| Blog article titles are specific, not clever | Yes | ✓ — titles name the outcome |

---

## 7. Cognitive load

**Rubric:** Is the user asked to make one decision at a time?

| Signal | Target | Current state |
|---|---|---|
| Max one input group per screen section | Yes | ✓ after signup jump-to removal |
| Forms have no optional friction fields above the fold | Yes | ✓ |
| Demo does not ask user to provide company + role | Preferred | ✓ after revamp — preset company, role dropdown only |

**Applied changes:** Demo page reduced input to a single role selector (company is preset). Removed "Before you run the demo" section. Removed "What you get with a full account" section (shown only after brief is generated). Removed "Jump to section" nav on signup page (unnecessary scroll map for a short-form page).

---

## 8. Content economy

**Rubric:** Is every word earning its place?

| Signal | Target | Current state |
|---|---|---|
| No section headers that describe navigation intent to the site operator | Yes | ✓ after "What this means for the website" rewrite |
| Takeaway callouts start with the insight, not "Key takeaway:" | Yes | ✓ after removal of label prefix |
| Titles describe the chart, not the chart format | Yes | ✓ after removing "Chart" / "Scatter" suffix |

**Applied changes:**
- Chart takeaway lines: removed "Key takeaway:" prefix, capitalized first word.
- Chart titles: "Opportunity Timing Gap" (not "Chart"), "Role Landing Probability" (not "Scatter").
- Method & Evidence bottom box: removed internal product copy, replaced with user-facing CTA copy.
- Role-signals blog post: removed full methodology playbook, gated detailed detection logic behind signup.

---

## 9. Scannability

**Rubric:** Can a user extract meaning without reading full sentences?

| Signal | Target | Current state |
|---|---|---|
| Bullet lists used for parallel items | Yes | ✓ |
| Section labels in uppercase tracking text | Yes | ✓ |
| Pricing: feature lists parallel in structure | Yes | ✓ |
| Differentiators on demo page scannable in 3-column grid | Yes | ✓ after revamp |

---

## 10. Mobile readiness (complementary to Playwright rubric)

**Rubric:** Does the site meet the core mobile contract on every changed page?

| Signal | Target | Current state |
|---|---|---|
| No horizontal overflow on mobile | Yes | ✓ — SVG charts use overflow-x-auto |
| Touch targets ≥ 44px | Yes | ✓ |
| Font sizes ≥ 13px on mobile body | Yes | ✓ |
| CTAs full-width on mobile | Yes | ✓ |

---

## Changelog — session 2026-06-06

| Change | Rubric | File |
|---|---|---|
| Hero font sizes: -2 / -1 / same | Visual hierarchy #2 | `LandingPage.tsx` |
| Removed "today" from hero body | Content economy #8 | `page.tsx` |
| Chart axis labels: +2pt | Visual hierarchy #2 | `LandingPage.tsx` |
| Chart titles: removed type suffix | Content economy #8 | `LandingPage.tsx` |
| Takeaway prefix removed | Content economy #8 | `LandingPage.tsx` |
| Takeaway text corrected + capitalized | Content economy #8 | `LandingPage.tsx` |
| Role Landing: legend added right of chart | Scannability #9 | `LandingPage.tsx` |
| Method & Evidence: box renamed + rewritten | Content economy #8 | `method-and-evidence/page.tsx` |
| Role-signals post: methodology gated | Trust + content economy | `how-we-estimate.../page.tsx` |
| Pricing cards: flex-col + mt-auto CTA | Conversion clarity #4 | `pricing-cards.tsx` |
| Signup: jump-to nav removed | Cognitive load #7 | `signup/page.tsx` |
| Blog: chat search box added | Information scent #6 | `blog/page.tsx` + `blog-chat.tsx` |
| Demo: full revamp, preset company, limit 5 | Cognitive load #7 + conversion #4 | `demo/page.tsx` |
