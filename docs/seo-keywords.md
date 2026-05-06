# Starting Monday — SEO Keyword Strategy

## Strategic position

Starting Monday cannot compete on generic terms ("job search", "CIO jobs", "resume builder") — those are owned by LinkedIn, Indeed, and established SaaS players with domain authority built over years. The opportunity is in long-tail, intent-specific terms where the audience is small but highly qualified and where no one has built authoritative content yet.

Target: senior technology executives (CIO, CTO, CDO, VP of Technology, VP of IT) in active or passive job search. Personas are research-oriented, read long-form content, and trust specificity over generic advice.

---

## Tier 1 — Primary targets (implement now)

These appear in page titles, meta descriptions, OG tags, and JSON-LD. Low competition, high buyer intent.

| Keyword | Target page | Monthly searches (est.) | Rationale |
|---------|------------|------------------------|-----------|
| CIO job search strategy | /for-cio | 200-500 | High intent, no dominant result |
| VP to CIO transition | /for-vp | 300-600 | Very specific, no dedicated tool |
| how to prepare for CIO interview | /for-cio | 200-400 | Problem-aware, high intent |
| executive job search tracker | / | 100-300 | Tool-specific, low competition |
| technology executive job search | / | 400-800 | Broad but qualified |
| CTO job search | /for-cio | 500-1000 | Adjacent, covers CTO persona |
| VP IT to CIO | /for-vp | 100-200 | Very specific transition intent |
| executive interview preparation tool | / | 100-300 | Tool-specific |

---

## Tier 2 — Content targets (needs blog/resource pages)

These require dedicated content to rank. Build these as the product matures.

| Keyword | Suggested content | Notes |
|---------|------------------|-------|
| how to work with executive search firms | Blog: "What executive recruiters actually want" | High-value audience, low competition |
| what CIO search firms look for | Blog: "The CIO search process from the inside" | Positions Starting Monday as advisor |
| executive job search timeline | Blog: "How long does a CIO search really take?" | Answers a question nobody answers directly |
| how to get on a board after CIO | /for-cio + blog | Mentioned in situation cards, needs content |
| C-suite outreach email examples | Blog: "Outreach that works at the executive level" | Ties to outreach feature |
| CIO interview questions | Blog: "The questions every CIO search asks" | High volume, drives trial |
| technology executive LinkedIn profile | /optimize | Ties to resume optimizer |
| what is an executive search firm vs recruiter | Blog | Top-of-funnel education content |
| how to negotiate CIO compensation | Blog | High-intent late-stage content |

---

## Tier 3 — Comparison/alternative terms (future)

When reviews and comparison content exists:

- "Huntr alternative for executives"
- "Teal HQ for executives"
- "job search CRM for CIOs"
- "executive job search software"
- "best tools for executive job search 2025"

These are worth targeting once there are third-party reviews or comparison pages mentioning Starting Monday.

---

## Negative keywords (do NOT optimize for)

These attract the wrong audience or are unwinnable:

- "job search" (too broad, dominated by aggregators)
- "CIO jobs" / "CTO jobs" (job board content, not tool content)
- "executive recruiter" (search firm audience, not candidate audience)
- "resume template" (commodity, wrong audience)
- "job board" (not what we are)
- "LinkedIn alternative" (wrong intent)

---

## Where each keyword is implemented

| Location | Keywords embedded |
|----------|------------------|
| Root layout (`layout.tsx`) | executive job search, AI career platform, senior technology executive, job search tracker, CIO, CTO, VP |
| Home page (`page.tsx`) | executive job search tools, pipeline tracking, company intelligence, interview prep executives |
| `/for-cio` | CIO job search, CIO interview preparation, CTO job search, technology executive search, executive search firm preparation |
| `/for-vp` | VP to CIO, CIO career path, technology leadership career, senior VP job search |
| `/optimize` | executive resume optimizer, CIO resume, ATS resume checker, AI resume tailoring |

---

## Tracking

Check these in Google Search Console (once verified) and Bing Webmaster Tools monthly:

1. Which queries are driving impressions vs clicks
2. Average position for Tier 1 keywords
3. Which pages are being indexed (check Coverage report)
4. Core Web Vitals score for public pages

Google Search Console property: startingmonday.app (verify via DNS TXT record or the HTML file already in `/public/`)
Bing Webmaster Tools: submit sitemap at `https://startingmonday.app/sitemap.xml`

---

## Open Graph / social keyword strategy

When executives share Starting Monday content on LinkedIn, the OG title and description are the ad copy. Each OG title is written to work as a standalone statement that earns a click without context:

- Home: "Your executive search, running at full speed."
- /for-cio: "The best CIO mandates are created, not posted."
- /for-vp: "Most VP searches fail at positioning, not credentials."
- /optimize: "Your resume, tailored to this specific role. Free."

These are not keyword-optimized — they are written for human executives who see them on LinkedIn. The SEO keywords live in the meta description and body content.
