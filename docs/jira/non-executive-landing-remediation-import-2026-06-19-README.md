# Non-Executive Landing Remediation Jira Import (2026-06-19)

## Files
- [docs/jira/non-executive-landing-remediation-import-2026-06-19.csv](docs/jira/non-executive-landing-remediation-import-2026-06-19.csv)
- [docs/non-executive-landing-remediation-backlog.md](docs/non-executive-landing-remediation-backlog.md)
- [docs/Starting Monday marketing.docx](docs/Starting%20Monday%20marketing.docx)

## Intent
Create missing Jira cards for the non-executive landing remediation program and place them directly into In Progress.

## Dedupe and status behavior
This CSV uses two optional importer columns supported by scripts/jira/import-csv-to-jira.mjs:
- Deduplicate=true: reuse existing issue if summary matches a ticket with at least one provided label.
- Status=In Progress: transition created/reused issues into In Progress when available.

## Source rationale mapping
- SM-1: complexity/cognitive load
- SM-2: workflow clarity
- SM-3: proof stories over metrics-only proof
- SM-4: audience-language mismatch
- SM-5: urgency and why-now clarity

## Workflow dispatch command
gh workflow run jira-import.yml --repo richrothschild/startingmonday --ref staging -f csv_path=docs/jira/non-executive-landing-remediation-import-2026-06-19.csv -f dry_run=false
