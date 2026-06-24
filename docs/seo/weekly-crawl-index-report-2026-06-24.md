# Weekly Crawl and Index Report

## Week Of
- Date range: 2026-06-24 to 2026-06-30
- Prepared by: Copilot automation draft

## Snapshot
- Site: https://startingmonday.app
- Sitemap URL: https://startingmonday.app/sitemap.xml
- Audit artifact (latest JSON): tmp/seo/crawl-index-audit.latest.json
- Audit artifact (latest CSV): tmp/seo/crawl-index-audit.latest.csv
- Audit generated at: 2026-06-24T19:11:00.351Z

## KPI Summary
- Total sitemap URLs checked: 100
- 200 count: 99
- 3xx count: 1
- 4xx count: 0
- 5xx count: 0
- Status 0 or request errors: 0
- URLs with x-robots-tag noindex: 0 observed in quick run
- URLs with canonical mismatch: Not yet evaluated (needs canonical comparison pass)

## Week-over-Week Deltas
- Indexed pages (Bing): Baseline pending manual pull from Bing Webmaster Tools
- Excluded pages (Bing): Baseline pending manual pull from Bing Webmaster Tools
- Duplicate/canonical conflict pages (Bing): Baseline pending manual pull from Bing Webmaster Tools
- New URLs discovered within 7 days: Baseline pending

## Top Issues This Week
1. Redirected legacy URL still present in sitemap sample
- Impact: Minor crawl waste and delayed canonical consolidation
- Example URLs: https://startingmonday.app/for-vp -> /for-executives/leadership
- Owner: SEO + web platform
- ETA: Next sprint

2. Canonical mismatch audit not yet automated
- Impact: Risk of duplicate index entries remaining undetected
- Example URLs: Pending dedicated canonical diff pass
- Owner: SEO engineering
- ETA: Next sprint

3. Bing-side exclusion trend not yet baseline tracked in repo
- Impact: Cannot quantify trend yet
- Example URLs: N/A
- Owner: Growth/SEO ops
- ETA: This week

## Changes Completed This Week
1. Added repeatable crawl/index audit script
- File/route: scripts/seo/run-crawl-index-audit.mjs
- Why it was made: Automate weekly crawl health checks from sitemap
- Validation result: Quick run completed with status summary 99x200, 1x307

2. Added SEO ops docs and weekly report template
- File/route: docs/seo/README.md and docs/seo/weekly-crawl-index-report-template.md
- Why it was made: Standardize weekly operating routine and reporting format
- Validation result: Template populated for this week

## Recrawl Actions
- Sitemap resubmitted in Bing: Pending
- Priority URLs requested for recrawl:
1. https://startingmonday.app/
2. https://startingmonday.app/for-executives/leadership
3. https://startingmonday.app/coaches

## Redirect Hygiene Check
- New redirect chains found: None observed in quick sample
- Permanent redirects corrected to 301: Pending review of /for-vp route policy
- Open redirect issues: None observed in quick sample

## Internal Linking Check
- Strategic pages reviewed: Pending full pass
- Orphan pages found: Pending full pass
- Internal links added: None in this reporting cycle

## Next Week Plan
1. Run full audit (no max URL cap) and publish baseline metrics.
2. Add canonical comparison checks to audit script output.
3. Remove legacy redirected URL variants from sitemap where appropriate.

## Risks and Blockers
1. Bing exclusion metrics require manual extraction from Bing Webmaster Tools (no automated API wired).
2. Redirect policy decisions may require coordination with active GTM route experiments.

## Sign-off
- SEO lead: Pending
- Engineering lead: Pending
- Date: 2026-06-24
