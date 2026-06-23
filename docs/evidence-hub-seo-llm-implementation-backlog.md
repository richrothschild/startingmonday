# Evidence Hub SEO + LLM Implementation Backlog

Owner: Growth + Content + Product Engineering
Status: ready
Last updated: 2026-06-23

## Goal
Use Evidence Hub as the credibility center that improves:
- Organic search rankings (Google, Bing)
- AI citation probability (ChatGPT, Claude, Perplexity, Bing Copilot)
- Conversion on commercial pages through visible proof blocks

## Deliverable 1: Exact page templates and copy blocks

### 1.1 Template A: Evidence-backed blog article page
Use this for all net-new search demand capture pages in `src/app/blog/<slug>/page.tsx`.

Files touched per article:
- `src/lib/blog-posts.ts` (add meta entry)
- `src/app/blog/<slug>/page.tsx` (page content)
- `src/app/sitemap.ts` (already auto-includes from `BLOG_POSTS`, no manual change)

Code scaffold:

```tsx
import type { Metadata } from 'next'
import { BlogPost } from '@/components/BlogPost'
import { getPost } from '@/lib/blog-posts'

const post = getPost('<slug>')!

export const metadata: Metadata = {
  title: `${post.title} - Starting Monday`,
  description: post.description,
  keywords: post.keywords,
  alternates: { canonical: `https://startingmonday.app/blog/<slug>` },
  openGraph: {
    title: post.title,
    description: post.description,
    url: `https://startingmonday.app/blog/<slug>`,
    type: 'article',
    publishedTime: post.date,
  },
  twitter: {
    card: 'summary_large_image',
    title: post.title,
    description: post.description,
  },
}

export default function Page() {
  return (
    <BlogPost
      title={post.title}
      description={post.description}
      date={post.date}
      readTime={post.readTime}
      url="https://startingmonday.app/blog/<slug>"
      cta={{
        headline: 'Validate your positioning with source-backed workflows.',
        body: 'Use Starting Monday to convert evidence into signal tracking, prep briefs, and outreach execution.',
        label: 'Start free ->',
        href: '/signup',
        note: 'No credit card required.',
      }}
    >
      <div className="space-y-6 text-[15px] text-slate-700 leading-relaxed">
        {/* use copy blocks below */}
      </div>
    </BlogPost>
  )
}
```

Copy blocks for Template A:

Block A1: Direct answer intro (for SERP and LLM extraction)
- Paragraph 1: answer the main query in one sentence.
- Paragraph 2: include timeframe, audience, and confidence limits.
- Paragraph 3: link to one Evidence Hub section and one source index anchor.

Ready-to-use copy:
- "Short answer: executives get more traction when they run a weekly operating cadence tied to early role signals, high-context outreach, and role-specific prep."
- "This guidance is based on peer-reviewed research plus Starting Monday pilot observations. Results vary by market, role level, and campaign consistency."
- "For methods and source detail, use Evidence Hub and the full source index."

Block A2: Claim-evidence-implication triad (repeat 3-5 times)
- Claim: one sentence
- Evidence: source citation with link
- Implication: what to do this week

Ready-to-use copy frame:
- "Claim: <what is true>."
- "Evidence: <study/publication/year> found <key finding>."
- "Implication: this week, <specific action with metric>."

Block A3: Limits and scope
Ready-to-use copy:
- "This model is strongest for VP and C-suite technology transitions with active networking and interview volume."
- "It is weaker for first-time manager transitions, highly regulated internal-only promotions, or low-signal geographies."

Block A4: FAQ extract block (2-4 questions)
- "How long does this usually take?"
- "What if I am in a confidential search?"
- "What should I measure weekly?"

Block A5: Evidence CTA
Ready-to-use copy:
- "Need the full reasoning model? Use Evidence Hub for source-backed methods, limitations, and references."

---

### 1.2 Template B: Evidence section page (topic cluster hub)
Use this for cluster pages that consolidate related articles and point to Evidence Hub anchors.

Suggested route pattern:
- `src/app/research/<topic>/page.tsx` (new)

Page structure:
1. Topic definition in 50-80 words
2. What the evidence says (3 bullets)
3. What to do this week (numbered list)
4. Related articles (5-8 links)
5. Evidence Hub deep link (`/evidence-hub#<section-id>`)

Copy block:
- "This page summarizes the strongest available evidence on <topic> for senior executive transitions and translates it into weekly execution decisions."

---

### 1.3 Template C: Proof block component for commercial pages
Use this in high-intent pages to show credibility at decision moments.

Suggested shared component:
- `src/components/EvidenceProofCard.tsx` (new)

Props:
- `claim`
- `sourceLabel`
- `sourceHref`
- `evidenceHref`
- `disclaimer`

Default copy:
- Claim: "Observed pilot cohorts reached first qualified conversation faster when weekly prep and outreach cadence stayed consistent."
- Source label: "Pilot summary + method notes"
- Evidence link: `/evidence-hub#internal-validation`
- Disclaimer: "Results vary by market, role level, and campaign consistency."

## Deliverable 2: Schema snippets per page type

Use JSON-LD via `<script type="application/ld+json">` in page components.

### 2.1 Evidence Hub page schema (`/evidence-hub`)

```tsx
const evidenceHubJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Evidence Hub',
  url: 'https://startingmonday.app/evidence-hub',
  description: 'Source-backed methods and findings for executive transition workflows.',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Starting Monday',
    url: 'https://startingmonday.app',
  },
  about: [
    'Executive transition strategy',
    'Executive coaching effectiveness',
    'Early role signals',
    'Behavior change and execution cadence',
  ],
  publisher: {
    '@type': 'Organization',
    name: 'Starting Monday',
    url: 'https://startingmonday.app',
  },
}
```

### 2.2 Blog article schema (`/blog/<slug>`)

```tsx
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.description,
  datePublished: post.date,
  dateModified: post.date,
  author: {
    '@type': 'Person',
    name: 'Richard Rothschild',
    url: 'https://startingmonday.app/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Starting Monday',
    url: 'https://startingmonday.app',
    logo: {
      '@type': 'ImageObject',
      url: 'https://startingmonday.app/logo.png',
    },
  },
  mainEntityOfPage: `https://startingmonday.app/blog/${post.slug}`,
  about: ['Executive search', 'C-suite transitions'],
  isBasedOn: 'https://startingmonday.app/evidence-hub',
}
```

### 2.3 Case studies schema (`/case-studies` and case pages)

```tsx
const caseStudyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Executive Transition Case Studies',
  url: 'https://startingmonday.app/case-studies',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'VP Engineering to CTO move' },
      { '@type': 'ListItem', position: 2, name: 'CIO quiet-search campaign' },
    ],
  },
  isPartOf: 'https://startingmonday.app/evidence-hub',
}
```

### 2.4 FAQ schema for high-intent guides
Use on pages with explicit Q/A sections.

```tsx
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long does a VP or C-suite search usually take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most transitions take multiple months. Outcomes improve when candidates run a consistent weekly execution cadence.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I run this in a confidential search?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The model is designed to support confidential outreach and prep workflows without public signaling.',
      },
    },
  ],
}
```

### 2.5 Organization and Person schema
- Place Organization schema in root layout or homepage.
- Place Person schema on `/about` and author-driven pages.

```tsx
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Starting Monday',
  url: 'https://startingmonday.app',
  sameAs: [
    'https://www.linkedin.com/company/starting-monday',
  ],
}
```

## Deliverable 3: Internal linking map from current pages to Evidence Hub

Evidence Hub deep-link anchors available now:
- `/evidence-hub#early-signals`
- `/evidence-hub#coaching-effectiveness`
- `/evidence-hub#transition-success`
- `/evidence-hub#behavior-change`
- `/evidence-hub#organizational-visibility`
- `/evidence-hub#internal-validation`

### 3.1 Existing links that should be upgraded to deep links

| Current file | Current target | Recommended target | Recommended anchor text |
| --- | --- | --- | --- |
| `src/app/page.tsx` | `/evidence-hub` | `/evidence-hub#early-signals` | See the early signal model |
| `src/components/LandingPage.tsx` | `/evidence-hub` | `/evidence-hub#coaching-effectiveness` | See coaching outcome evidence |
| `src/app/founder-note/page.tsx` | `/evidence-hub` | `/evidence-hub#internal-validation` | Review pilot validation and limits |
| `src/app/annual-report-2026/page.tsx` | `/evidence-hub` | `/evidence-hub#internal-validation` | Validate this with pilot evidence |
| `src/app/pilot-findings/page.tsx` | `/evidence-hub` | `/evidence-hub#internal-validation` | See full pilot evidence |
| `src/app/for-cio/page.tsx` | `/evidence-hub` | `/evidence-hub#transition-success` | See transition success evidence |
| `src/app/for-executives/[lane]/page.tsx` | `/evidence-hub` | `/evidence-hub#behavior-change` | See behavior-change evidence |
| `src/app/coaches/page.tsx` | `/evidence-hub` | `/evidence-hub#coaching-effectiveness` | See coaching effectiveness evidence |
| `src/app/research-brief/page.tsx` | `/evidence-hub` | `/evidence-hub#organizational-visibility` | See organizational visibility evidence |
| `src/app/method-and-evidence/page.tsx` | `/evidence-hub` | `/evidence-hub#early-signals` | Explore the full evidence taxonomy |

### 3.2 Places that mention evidence but need explicit link insertion

| File | Current state | Add link target |
| --- | --- | --- |
| `src/app/demo/page.tsx` | Mentions Evidence Hub conceptually | `/evidence-hub#internal-validation` |
| `src/app/concierge/concierge-waitlist.tsx` | Mentions pilot evidence in text | `/evidence-hub#internal-validation` |

### 3.3 Cross-linking rules for all future pages
- Add at least 1 in-body link to Evidence Hub section anchor.
- Add 1 footer or end-of-article link to full source index on Evidence Hub.
- Use descriptive anchors, not generic "click here".
- Keep anchor-text variety to avoid over-optimization.

## Deliverable 4: First 20 article titles with target query + outline

Use these as the next content sprint queue. Slugs are suggestions.

### Article 1
- Title: Executive Search Timing Signals: What Appears Before a Role Is Posted
- Target query: executive search timing signals
- Suggested slug: `executive-search-timing-signals`
- Outline:
  1. Direct answer
  2. Signal classes (org change, leadership exits, budget shifts)
  3. False positives and confidence
  4. Weekly monitoring checklist
  5. Link to `#early-signals`

### Article 2
- Title: Does Executive Coaching Improve Search Outcomes? What The Evidence Shows
- Target query: executive coaching effectiveness job search
- Suggested slug: `executive-coaching-search-outcomes`
- Outline:
  1. What outcomes to measure
  2. Research summary
  3. Mechanisms that matter
  4. How to evaluate coach quality
  5. Link to `#coaching-effectiveness`

### Article 3
- Title: Executive Transition Success Factors: What Predicts Better Outcomes
- Target query: executive transition success factors
- Suggested slug: `executive-transition-success-factors`
- Outline:
  1. Definition of transition success
  2. First 90-day risk factors
  3. Onboarding evidence
  4. Weekly operating model
  5. Link to `#transition-success`

### Article 4
- Title: Behavior Change For Senior Candidates: Why Consistency Beats Intensity
- Target query: executive job search consistency
- Suggested slug: `executive-search-consistency-model`
- Outline:
  1. The consistency thesis
  2. Goal-setting and implementation intentions
  3. Feedback loops
  4. Practical weekly scorecard
  5. Link to `#behavior-change`

### Article 5
- Title: Organizational Visibility For Executives: What Actually Creates Momentum
- Target query: executive visibility strategy
- Suggested slug: `executive-organizational-visibility`
- Outline:
  1. Visibility versus self-promotion
  2. Relationship graph dynamics
  3. Message quality by audience
  4. Cadence examples
  5. Link to `#organizational-visibility`

### Article 6
- Title: Confidential Executive Search: How To Build Pipeline Without Public Signaling
- Target query: confidential executive job search
- Suggested slug: `confidential-executive-search-pipeline`
- Outline:
  1. Confidentiality constraints
  2. Contact segmentation
  3. Safe outreach patterns
  4. Risk controls
  5. Link to `#behavior-change`

### Article 7
- Title: How To Evaluate An Executive Coach Using Evidence, Not Marketing Copy
- Target query: how to choose executive coach
- Suggested slug: `evaluate-executive-coach-evidence`
- Outline:
  1. Coach selection failure modes
  2. Evidence-based criteria
  3. Interview questions to ask
  4. Red flags
  5. Link to `#coaching-effectiveness`

### Article 8
- Title: Executive Interview Prep: The 7-Day Briefing System
- Target query: executive interview preparation system
- Suggested slug: `executive-interview-prep-7-day-system`
- Outline:
  1. Why prep quality matters
  2. Company-context brief structure
  3. Question rehearsal model
  4. Debrief loop
  5. Link to `#transition-success`

### Article 9
- Title: What To Track Weekly In A C-suite Search (With Benchmarks)
- Target query: c suite job search metrics
- Suggested slug: `c-suite-search-weekly-metrics`
- Outline:
  1. Metrics that matter
  2. Leading versus lagging indicators
  3. Weekly dashboard template
  4. Intervention thresholds
  5. Link to `#internal-validation`

### Article 10
- Title: Why Executive Outreach Gets Ignored And How To Fix It
- Target query: executive outreach response rate
- Suggested slug: `executive-outreach-response-rate`
- Outline:
  1. Why messages fail
  2. Context-first framing
  3. Example rewrites
  4. Follow-up sequence
  5. Link to `#organizational-visibility`

### Article 11
- Title: C-suite Search Timeline: What To Do In Days 1-30, 31-60, 61-90
- Target query: c suite search timeline
- Suggested slug: `c-suite-search-90-day-plan`
- Outline:
  1. Timeline reality
  2. Phase 1 setup
  3. Phase 2 momentum
  4. Phase 3 conversion
  5. Link to `#behavior-change`

### Article 12
- Title: Evidence-Based Executive Networking: A Practical Cadence For Busy Leaders
- Target query: executive networking strategy
- Suggested slug: `evidence-based-executive-networking`
- Outline:
  1. Network activation model
  2. Contact tiers
  3. Message objectives by tier
  4. Cadence by week
  5. Link to `#organizational-visibility`

### Article 13
- Title: Executive Search Readiness Audit: 15 Questions Before You Start
- Target query: executive search readiness checklist
- Suggested slug: `executive-search-readiness-audit`
- Outline:
  1. Readiness dimensions
  2. Scoring rubric
  3. Common gaps
  4. 2-week remediation plan
  5. Link to `#transition-success`

### Article 14
- Title: VP To C-suite Positioning: How To Show Enterprise-Level Scope
- Target query: vp to c suite positioning
- Suggested slug: `vp-to-c-suite-positioning`
- Outline:
  1. Positioning gaps
  2. Business-impact narrative
  3. Board and stakeholder framing
  4. Resume and LinkedIn edits
  5. Link to `#transition-success`

### Article 15
- Title: Executive Search For CIO Candidates: Signal, Story, And Sequence
- Target query: cio executive search strategy
- Suggested slug: `cio-search-signal-story-sequence`
- Outline:
  1. CIO market context
  2. Signal monitoring plan
  3. Story architecture
  4. Sequence and cadence
  5. Link to `#early-signals`

### Article 16
- Title: Pilot Data: What We Observed Across Executive Search Campaigns
- Target query: executive search pilot data
- Suggested slug: `executive-search-pilot-data-observations`
- Outline:
  1. Cohort and method
  2. What improved
  3. Where results varied
  4. Limitations
  5. Link to `#internal-validation`

### Article 17
- Title: How To Use Evidence Hub In Weekly Executive Coaching Sessions
- Target query: executive coaching session framework
- Suggested slug: `evidence-hub-coaching-session-framework`
- Outline:
  1. Session design around evidence
  2. Agenda template
  3. Assignment structure
  4. Progress review loop
  5. Link to `#coaching-effectiveness`

### Article 18
- Title: Executive Search Risk Register: The 10 Failure Modes To Watch
- Target query: executive search risks
- Suggested slug: `executive-search-risk-register`
- Outline:
  1. Top failure modes
  2. Early warning indicators
  3. Mitigation actions
  4. Weekly risk review process
  5. Link to `#behavior-change`

### Article 19
- Title: Hiring Committee Psychology: What Senior Candidates Should Anticipate
- Target query: executive hiring committee decision process
- Suggested slug: `executive-hiring-committee-psychology`
- Outline:
  1. Decision dynamics
  2. Information asymmetry in executive hiring
  3. How signal quality reduces uncertainty
  4. Interview strategy implications
  5. Link to `#early-signals`

### Article 20
- Title: Building A Source-Backed Executive Career Narrative
- Target query: executive career narrative framework
- Suggested slug: `source-backed-executive-career-narrative`
- Outline:
  1. Narrative components
  2. Evidence attachment model
  3. Role-specific variation
  4. Story testing before interviews
  5. Link to `#organizational-visibility`

## Execution sequence (ready to run now)

### Team roles
- Growth lead: keyword prioritization, publishing calendar, SERP tracking
- Content lead: draft/review/publish all 20 articles
- Engineering lead: schema, deep links, component work, QA
- Analytics owner: indexing checks, AI snapshot log, weekly report

### Sprint 1 (week 1): credibility foundation + first demand capture batch
Sprint objective: ship machine-readable credibility and publish first 4 evidence-led articles.

Implementation tasks:
1. Add schema to core pages
- Update [src/app/evidence-hub/page.tsx](src/app/evidence-hub/page.tsx): inject CollectionPage JSON-LD
- Update [src/app/blog/page.tsx](src/app/blog/page.tsx): inject WebSite/CollectionPage support schema
- Update one representative article page: use Article JSON-LD pattern in [src/app/blog/executive-hiring-patterns-2026/page.tsx](src/app/blog/executive-hiring-patterns-2026/page.tsx)
2. Upgrade highest-impact internal links to deep links
- Update links in:
  - [src/app/page.tsx](src/app/page.tsx)
  - [src/components/LandingPage.tsx](src/components/LandingPage.tsx)
  - [src/app/founder-note/page.tsx](src/app/founder-note/page.tsx)
  - [src/app/annual-report-2026/page.tsx](src/app/annual-report-2026/page.tsx)
  - [src/app/pilot-findings/page.tsx](src/app/pilot-findings/page.tsx)
  - [src/app/for-cio/page.tsx](src/app/for-cio/page.tsx)
  - [src/app/for-executives/[lane]/page.tsx](src/app/for-executives/[lane]/page.tsx)
  - [src/app/coaches/page.tsx](src/app/coaches/page.tsx)
3. Publish Articles 1-4
- Add 4 metadata entries in [src/lib/blog-posts.ts](src/lib/blog-posts.ts)
- Add 4 pages under [src/app/blog](src/app/blog)

Acceptance gates:
- 3 schema blocks present and valid in rendered HTML
- 8 deep links deployed to Evidence Hub section anchors
- 4 articles live in blog index and sitemap

Demo artifact:
- One markdown summary in [docs](docs) with links to new pages and schema validation screenshots.

### Sprint 2 (week 2): conversion credibility layer + second content batch
Sprint objective: put proof at commercial decision points and publish articles 5-8.

Implementation tasks:
1. Build shared proof component
- Create [src/components/EvidenceProofCard.tsx](src/components/EvidenceProofCard.tsx)
2. Add proof component to core pages
- Integrate into:
  - [src/app/page.tsx](src/app/page.tsx)
  - [src/app/coaches/page.tsx](src/app/coaches/page.tsx)
  - [src/app/for-cio/page.tsx](src/app/for-cio/page.tsx)
  - [src/app/annual-report-2026/page.tsx](src/app/annual-report-2026/page.tsx)
3. Publish Articles 5-8
- Add 4 metadata entries in [src/lib/blog-posts.ts](src/lib/blog-posts.ts)
- Add 4 pages under [src/app/blog](src/app/blog)

Acceptance gates:
- Proof component shipped and reused in at least 4 routes
- 4 additional articles published and linked from blog index
- Lighthouse no critical regressions on homepage and Evidence Hub pages

Demo artifact:
- Before/after screenshots of each proof placement and links to published posts.

### Sprint 3 (week 3): scale publication + FAQ extraction surfaces
Sprint objective: publish articles 9-14 and add FAQ schema where answer extraction value is highest.

Implementation tasks:
1. Publish Articles 9-14
- Add 6 metadata entries in [src/lib/blog-posts.ts](src/lib/blog-posts.ts)
- Add 6 pages under [src/app/blog](src/app/blog)
2. Add FAQ blocks and FAQ schema on 4 pages
- Candidate pages:
  - [src/app/for-cio/page.tsx](src/app/for-cio/page.tsx)
  - [src/app/annual-report-2026/executive-search-ai-confidentiality/page.tsx](src/app/annual-report-2026/executive-search-ai-confidentiality/page.tsx)
  - [src/app/research-brief/page.tsx](src/app/research-brief/page.tsx)
  - [src/app/method-and-evidence/page.tsx](src/app/method-and-evidence/page.tsx)

Acceptance gates:
- 6 more articles live with internal Evidence Hub links
- 4 FAQ schema blocks validate successfully
- Each FAQ page has at least 2 direct-answer paragraphs near top content

Demo artifact:
- Structured data test output links and FAQ snippet screenshots.

### Sprint 4 (week 4): complete topic coverage + indexation and AI visibility checks
Sprint objective: publish articles 15-20 and close technical/distribution validation loop.

Implementation tasks:
1. Publish Articles 15-20
- Add 6 metadata entries in [src/lib/blog-posts.ts](src/lib/blog-posts.ts)
- Add 6 pages under [src/app/blog](src/app/blog)
2. Indexation and crawl checks
- Google Search Console: request indexing for Evidence Hub and 20 new posts
- Bing Webmaster Tools: submit sitemap and URL inspection for core pages
3. AI visibility snapshot audit
- Run fixed prompt set (10 prompts) in ChatGPT, Claude, and Bing Copilot
- Log whether Starting Monday or Evidence Hub appears, with citation context

Acceptance gates:
- All 20 articles live and in sitemap
- Indexation requests submitted for all new URLs
- AI snapshot log completed and archived in docs

Demo artifact:
- Final rollout report in [docs](docs) with indexation status and AI snapshot table.

## Immediate start checklist (today)
1. Create branch: feat/evidence-hub-seo-llm-sprint1
2. Open Sprint 1 tracking issue with all tasks above
3. Assign owner per task and due date
4. Ship schema + 8 deep links first
5. Publish first 4 articles in same sprint

## Done criteria (hard completion)

### Content completion
- 20/20 articles published with:
  - unique slug
  - metadata entry in [src/lib/blog-posts.ts](src/lib/blog-posts.ts)
  - at least 1 deep link to Evidence Hub section anchor

### Internal linking completion
- Every top-level commercial page has at least one Evidence Hub deep link:
  - [src/app/page.tsx](src/app/page.tsx)
  - [src/components/LandingPage.tsx](src/components/LandingPage.tsx)
  - [src/app/coaches/page.tsx](src/app/coaches/page.tsx)
  - [src/app/for-cio/page.tsx](src/app/for-cio/page.tsx)
  - [src/app/for-executives/[lane]/page.tsx](src/app/for-executives/[lane]/page.tsx)
  - [src/app/annual-report-2026/page.tsx](src/app/annual-report-2026/page.tsx)
  - [src/app/founder-note/page.tsx](src/app/founder-note/page.tsx)
  - [src/app/pilot-findings/page.tsx](src/app/pilot-findings/page.tsx)

### Structured data completion
- Valid JSON-LD on targeted page types:
  - CollectionPage on [src/app/evidence-hub/page.tsx](src/app/evidence-hub/page.tsx)
  - Article on all new article pages
  - FAQPage on 4 selected high-intent pages
  - Organization schema present in site-level layout or homepage

### Search and indexing completion
- All 20 article URLs discovered in sitemap output from [src/app/sitemap.ts](src/app/sitemap.ts)
- Indexation requested for all new URLs in Google and Bing
- At least 60 percent of new URLs indexed within 21 days

### AI visibility completion
- Fixed 10-prompt audit run in ChatGPT, Claude, and Bing Copilot
- Evidence Hub or Starting Monday appears in at least 2 prompt answers per platform
- Snapshot log stored in docs with date, prompt, result, and citation note

### Release quality completion
- No critical build/type errors introduced
- No broken internal links to Evidence Hub anchors
- Final rollout report published in docs and reviewed by Growth + Engineering
