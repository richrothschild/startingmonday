# SEO Crawl and Index Ops

This folder documents the weekly crawl/index operating routine.

## Commands

Run production sitemap crawl and status audit:

```bash
npm run seo:crawl:audit
```

Run against a custom base URL (for staging or preview):

```bash
npm run seo:crawl:audit -- --base-url https://starting-monday-staging.up.railway.app
```

Limit URL count during quick checks:

```bash
npm run seo:crawl:audit -- --max-urls 100
```

## Output Files

The script writes outputs to `tmp/seo`:

- `crawl-index-audit.latest.json`
- `crawl-index-audit.latest.csv`
- timestamped JSON and CSV snapshots per run

## Weekly Operating Flow

1. Run `npm run seo:crawl:audit`.
2. Open `tmp/seo/crawl-index-audit.latest.csv` and classify issues.
3. Fill in `docs/seo/weekly-crawl-index-report-template.md`.
4. Re-submit sitemap and request recrawl for priority URLs in Bing.
5. Track week-over-week trend for 4 to 6 weeks.
