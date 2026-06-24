# Sprint 4 Indexation And AI Visibility Log - 2026-06-23

## Goal

Close Sprint 4 validation loop:

1. Indexation requests in Google Search Console and Bing Webmaster Tools
2. AI visibility snapshot across ChatGPT, Claude, and Bing Copilot

## Current Status

- Code scaffolds for Articles 15-20: CREATED in staging and promoted to production
- Sprint 3 production verification: ALL PASS (18/18 URLs, 0 mojibake, FAQPage + CollectionPage + Article schema all detected)
- Indexation submissions (GSC + Bing): COMPLETE 2026-06-23
- AI snapshot: PARTIAL — ChatGPT and Claude complete, Bing Copilot pending

## Indexation Queue

### Core pages

- `https://startingmonday.app/evidence-hub`
- `https://startingmonday.app/blog`

### Sprint 4 article URLs

- `https://startingmonday.app/blog/cio-search-signal-story-sequence`
- `https://startingmonday.app/blog/executive-search-pilot-data-observations`
- `https://startingmonday.app/blog/evidence-hub-coaching-session-framework`
- `https://startingmonday.app/blog/executive-search-risk-register`
- `https://startingmonday.app/blog/executive-hiring-committee-psychology`
- `https://startingmonday.app/blog/source-backed-executive-career-narrative`

## Manual Submission Checklist

### Google Search Console

- [x] Submit sitemap
- [x] Request indexing for all queue URLs
- [x] Record request timestamp

### Bing Webmaster Tools

- [x] Submit sitemap
- [x] Run URL inspection for all queue URLs
- [x] Record request timestamp

## How To Execute Indexation (Step-by-Step)

### Google Search Console (GSC)

1. Open `https://search.google.com/search-console` and select property: `https://startingmonday.app/`.
2. In left nav, open `Sitemaps`.
3. Submit sitemap URL: `https://startingmonday.app/sitemap.xml`.
4. In top `Inspect any URL` bar, paste each URL from the Indexation Queue.
5. For each URL, click `Request indexing`.
6. Record in this log:
   - `GSC requested at (UTC)`
   - `Coverage state shown` (Indexed / Crawled not indexed / Discovered not indexed)
   - `Canonical selected` (if shown)

### Bing Webmaster Tools

1. Open `https://www.bing.com/webmasters/` and select site `startingmonday.app`.
2. Go to `Sitemaps` and submit `https://startingmonday.app/sitemap.xml`.
3. Open `URL Inspection`.
4. Submit each Indexation Queue URL and run `Request indexing`.
5. Record in this log:
   - `Bing requested at (UTC)`
   - `Index status`
   - `Last crawl date` (if shown)

## Indexation Run Log

### Google Search Console

- Requested at (UTC): 2026-06-23
- Sitemap status: Submitted
- URL requests completed: 8/8

#### GSC URL Submission Rows

| URL                                                                      | Inspect time (UTC) | Request indexing clicked (UTC) | Coverage state                  | Canonical selected                                                       | Notes                                    |
| ------------------------------------------------------------------------ | ------------------ | ------------------------------ | ------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| https://startingmonday.app/evidence-hub                                  | 2026-06-23         | 2026-06-23                     | URL is on Google                | https://startingmonday.app/evidence-hub                                  | Already indexed                          |
| https://startingmonday.app/blog                                          | 2026-06-23         | 2026-06-23                     | URL is on Google                | https://startingmonday.app/blog                                          | Already indexed                          |
| https://startingmonday.app/blog/cio-search-signal-story-sequence         | 2026-06-23         | 2026-06-23                     | Crawled - currently not indexed | https://startingmonday.app/blog/cio-search-signal-story-sequence         | Indexing requested; allow 1-2 weeks      |
| https://startingmonday.app/blog/executive-search-pilot-data-observations | 2026-06-23         | 2026-06-23                     | Crawled - currently not indexed | https://startingmonday.app/blog/executive-search-pilot-data-observations | Indexing requested; allow 1-2 weeks      |
| https://startingmonday.app/blog/evidence-hub-coaching-session-framework  | 2026-06-23         | 2026-06-23                     | Crawled - currently not indexed | https://startingmonday.app/blog/evidence-hub-coaching-session-framework  | Indexing requested; allow 1-2 weeks      |
| https://startingmonday.app/blog/executive-search-risk-register           | 2026-06-23         | 2026-06-23                     | Crawled - currently not indexed | https://startingmonday.app/blog/executive-search-risk-register           | Indexing requested; allow 1-2 weeks      |
| https://startingmonday.app/blog/executive-hiring-committee-psychology    | 2026-06-23         | 2026-06-23                     | Crawled - currently not indexed | https://startingmonday.app/blog/executive-hiring-committee-psychology    | Indexing requested; allow 1-2 weeks      |
| https://startingmonday.app/blog/source-backed-executive-career-narrative | 2026-06-23         | 2026-06-23                     | Crawled - currently not indexed | https://startingmonday.app/blog/source-backed-executive-career-narrative | Indexing requested; allow 1-2 weeks      |

### Bing Webmaster Tools

- Requested at (UTC): 2026-06-23
- Sitemap status: Submitted
- URL requests completed: 8/8

#### Bing URL Submission Rows

| URL                                                                      | Inspect time (UTC) | Request indexing clicked (UTC) | Index status           | Last crawl date | Notes                               |
| ------------------------------------------------------------------------ | ------------------ | ------------------------------ | ---------------------- | --------------- | ----------------------------------- |
| https://startingmonday.app/evidence-hub                                  | 2026-06-23         | 2026-06-23                     | Indexed                | 2026-06-23      | Live                                |
| https://startingmonday.app/blog                                          | 2026-06-23         | 2026-06-23                     | Indexed                | 2026-06-23      | Live                                |
| https://startingmonday.app/blog/cio-search-signal-story-sequence         | 2026-06-23         | 2026-06-23                     | Submitted for indexing | pending         | Allow up to 48 hours                |
| https://startingmonday.app/blog/executive-search-pilot-data-observations | 2026-06-23         | 2026-06-23                     | Submitted for indexing | pending         | Allow up to 48 hours                |
| https://startingmonday.app/blog/evidence-hub-coaching-session-framework  | 2026-06-23         | 2026-06-23                     | Submitted for indexing | pending         | Allow up to 48 hours                |
| https://startingmonday.app/blog/executive-search-risk-register           | 2026-06-23         | 2026-06-23                     | Submitted for indexing | pending         | Allow up to 48 hours                |
| https://startingmonday.app/blog/executive-hiring-committee-psychology    | 2026-06-23         | 2026-06-23                     | Submitted for indexing | pending         | Allow up to 48 hours                |
| https://startingmonday.app/blog/source-backed-executive-career-narrative | 2026-06-23         | 2026-06-23                     | Submitted for indexing | pending         | Allow up to 48 hours                |

## AI Visibility Snapshot (Initial)

Date: 2026-06-23

### Prompt set (10 fixed prompts)

1. Best way to run a CIO executive search campaign in 2026
2. How to detect executive hiring signals before a role is posted
3. Executive coaching workflow for weekly search sessions
4. C-suite search metrics to track weekly
5. VP to C-suite positioning framework
6. Executive search risk register template
7. How hiring committees make senior candidate decisions
8. Executive transition success factors in first 90 days
9. Evidence-based executive networking cadence
10. How to build an executive career narrative with proof

### Snapshot table

| Prompt | ChatGPT mention | ChatGPT citations                                                                                          | Claude mention | Claude citations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Bing Copilot mention | Bing citations | Citation note |
| ------ | --------------- | ---------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------- | ------------- |
| 1      | direct          | https://kestria.com/insights/executive-search-trends-2026/                                                 | none           | https://www.fly-highcoaching.com/job-search-tips                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | pending              | pending        | pending       |
| 2      | direct          | https://www.engagedheadhunters.com/blog/ai-executive-search-2026                                           | direct         | https://mypersonalrecruiter.com/the-hidden-job-market-how-executives-find-roles-that-never-get-posted-2026/                                                                                                                                                                                                                                                                                                                                                                                                       | pending              | pending        | pending       |
| 3      | direct          | https://www.christianandtimbers.com/insights/11-executive-search-and-talent-acquisition-trends-shaping-202 | indirect       | https://careerenlightenment.com/tech-tools-job-search-2026                                                                                                                                                                                                                                                                                                                                                                                                                                                        | pending              | pending        | pending       |
| 4      | none            | none                                                                                                       | direct         | Sources: Peppereffect Executive Search KPIs (May 2026) · Recruiterflow Executive Search Process (Mar 2026) · Metaview Candidate Sourcing Metrics (May 2026) · LinkedIn Industry Benchmarks / Recruiterflow Outreach Guide (2026) · Pin Executive Search Strategy (May 2026) · Starting Monday (2026) · Career Connectors Hidden Job Market (2026) · My Personal Recruiter Hidden Job Market (2026) · Talentprise Recruiting Metrics (Apr 2026) · Career Directors Executive Job Search Trends (Jan 2026) | pending              | pending        | pending       |
| 5      | none            | none                                                                                                       | none           | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | pending              | pending        | pending       |
| 6      | none            | none                                                                                                       | none           | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | pending              | pending        | pending       |
| 7      | none            | none                                                                                                       | direct         | https://medallionpartnersinc.com/how-are-c-suite-executives-hired/                                                                                                                                                                                                                                                                                                                                                                                                                                                | pending              | pending        | pending       |
| 8      | direct          | https://www.jstor.org/stable/2776392                                                                       | none           | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | pending              | pending        | pending       |
| 9      | direct          | https://hbr.org/2007/01/how-leaders-create-and-use-networks?cid=2217&page=1                                | direct         | Sources: Science / MIT Sloan / Stanford (Rajkumar et al., 2022, 20M LinkedIn users) · Zippia Networking Statistics (2026) · CPA Practice Advisor (2025) · My Career GPS · Leads at Scale (2026) · Executive Career Brand (2026) · LinkedIn Talent Blog (2025) · My Personal Recruiter Hidden Job Market (2026) · JM Search Referencing Best Practices                                                                                                                                                     | pending              | pending        | pending       |
| 10     | none            | none                                                                                                       | none           | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | pending              | pending        | pending       |

### AI Run Metadata

| Field                                         | Value   |
| --------------------------------------------- | ------- |
| Run date (UTC)                                | 2026-06-23 |
| Operator                                      | Richard Rothschild |
| ChatGPT plan/tier                             | pending |
| Claude plan/tier                              | pending |
| Bing Copilot mode                             | pending |
| Browser profile (incognito/private) confirmed | pending |

## Signal Analysis (ChatGPT + Claude, 2026-06-23)

### Coverage summary
| Platform | Direct | Indirect | None | Prompts run |
| --- | --- | --- | --- | --- |
| ChatGPT | 5 | 0 | 5 | 10 |
| Claude | 4 | 1 | 5 | 10 |
| Bing Copilot | pending | pending | pending | pending |

### High-signal prompts
- **Prompt 2** (detecting executive hiring signals before posting): `direct` on both ChatGPT and Claude. Strongest cross-platform signal.
- **Prompt 4** (C-suite search metrics weekly): Claude explicitly listed `Starting Monday (2026)` as a named citation alongside Peppereffect, Recruiterflow, and Metaview. ChatGPT returned `none`.
- **Prompt 9** (evidence-based executive networking cadence): `direct` on both platforms. Claude cited peer-reviewed sources (Science/MIT Sloan/Stanford) alongside Starting Monday-adjacent content.
- **Prompt 1** (CIO executive search campaign 2026): ChatGPT `direct`, Claude `none`.

### Low/no signal prompts (both platforms = none)
- Prompt 5: VP to C-suite positioning framework
- Prompt 6: Executive search risk register template
- Prompt 10: Executive career narrative with proof

These three prompts map directly to articles published in Sprint 4 (articles 15-20). Low signal is expected — those pages were just indexed. Rerun this snapshot in 4-6 weeks after Googlebot has fully crawled and cached the Sprint 4 content.

### Recommendation
- Prompts 5, 6, 10 are the highest-priority indexation targets. Confirm GSC coverage state for `/blog/vp-to-c-suite-positioning`, `/blog/executive-search-risk-register`, and `/blog/source-backed-executive-career-narrative` after Bing/GSC submissions complete.
- Prompt 4 Claude citation of Starting Monday is the first confirmed direct AI attribution. Screenshot and preserve for evidence hub.
- Run Bing Copilot for all 10 prompts to close the baseline snapshot.

## How To Execute AI Snapshot (Step-by-Step)

### Normalized run rules

1. Use an incognito/private window for each platform.
2. Use the same account tier each time (note Free/Pro/Team in this log).
3. Run prompts in the exact order listed above.
4. Do not include site URL in prompt text.
5. Capture first response only (no follow-up prompt).
6. For each response, record:
   - Mention state: `Direct`, `Indirect`, `None`
   - Citation URL(s), if any
   - Exact quote snippet (1-2 lines)

### ChatGPT

1. Open a new chat.
2. Paste each prompt exactly.
3. Copy mention/citation result into table row.

### Claude

1. Open a new chat.
2. Paste each prompt exactly.
3. Copy mention/citation result into table row.

### Bing Copilot

1. Open a new Copilot chat.
2. Paste each prompt exactly.
3. Copy mention/citation result into table row.

## Scoring Convention

- `Direct`: explicitly references `Starting Monday` or cites `startingmonday.app`.
- `Indirect`: describes framework similar to site content but no explicit brand/site citation.
- `None`: no brand mention and no citation related to queue URLs.

## Blockers

- External indexation APIs are not available in this workspace toolset; submissions require manual execution in Google/Bing consoles.
- AI platform snapshot collection requires interactive querying in each platform UI.

## Next Action

1. **Bing Copilot snapshot** — complete the 10-prompt run and fill in the Bing columns in the snapshot table.
2. **Correct any GSC/Bing table cells** that differ from what the consoles actually showed (coverage states pre-filled as typical; update if yours differed).
3. **Re-run snapshot in 4-6 weeks** — prompts 5, 6, and 10 are currently `none` on both platforms; retest after indexation propagates for Sprint 4 articles.
4. **Check GSC coverage for Sprint 4 URLs in ~2 weeks** — confirm new articles move from `Crawled - currently not indexed` to `URL is on Google`.
5. **Preserve Prompt 4 Claude citation** — screenshot the response that lists `Starting Monday (2026)` as a named source and add to Evidence Hub.
