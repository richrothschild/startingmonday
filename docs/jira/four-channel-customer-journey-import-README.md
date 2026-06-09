# Four-Channel Jira Import (Ready)

## Files
- [docs/jira/four-channel-customer-journey-import.csv](docs/jira/four-channel-customer-journey-import.csv)
- [docs/strategy/four-channel-customer-journey-implementation-backlog-2026-06-08.md](docs/strategy/four-channel-customer-journey-implementation-backlog-2026-06-08.md)

## Team-managed Jira import mapping
Map columns as follows:
- Summary -> Summary
- Issue Type -> Issue Type
- Description -> Description
- Labels -> Labels
- Priority -> Priority

## Recommended order
1. Import the CSV using Jira CSV importer.
2. Confirm Epic + 20 stories created.
3. Filter by label `now` and move those six stories into active sprint.
4. Use labels `next` and `later` for backlog grooming.

## Now tranche stories (label `now`)
- Story 1.1 decision timeline engine
- Story 1.2 outcome attribution layer
- Story 2.1 executive role-fit simulator
- Story 3.1 coach command center
- Story 4.1 outplacement cohort operations hub
- Story 5.1 search firm candidate readiness passport

## Optional direct API issue creation
Repository script available:
- [scripts/jira/create-jira-issue.mjs](scripts/jira/create-jira-issue.mjs)

Required env vars:
- JIRA_BASE_URL
- JIRA_EMAIL
- JIRA_API_TOKEN
- JIRA_PROJECT_KEY
