# Luxury-Modern Sitewide Elevation Jira Import (Ready)

## Files

- [docs/jira/luxury-modern-sitewide-elevation-import.csv](docs/jira/luxury-modern-sitewide-elevation-import.csv)
- [docs/strategy/luxury-modern-redesign-brief-home-and-channel-pages-2026-06-13.md](docs/strategy/luxury-modern-redesign-brief-home-and-channel-pages-2026-06-13.md)
- [docs/epic-sitewide-luxury-modern-elevation-2026-2027.md](docs/epic-sitewide-luxury-modern-elevation-2026-2027.md)

## What this import contains

1. 1 Epic and 30 sprint-ready Tasks.
2. Six sprint lanes: Sprint LUX-1 through Sprint LUX-6.
3. Story points, owner roles, dependencies, priority, labels, and components.
4. Acceptance criteria embedded in every task description.

## Team-managed Jira import mapping

Map columns as follows:

- `Issue Type` -> Issue Type
- `Summary` -> Summary
- `Description` -> Description
- `Epic Name` -> Epic Name
- `Priority` -> Priority
- `Labels` -> Labels
- `Components` -> Components
- `Story Points` -> Story Points
- `Sprint` -> Sprint (custom or post-import board assignment)
- `Owner` -> Assignee (manual or automation mapping)
- `Dependencies` -> Issue links (manual after import if needed)

## Recommended import flow

1. Import CSV into target team-managed Jira project.
2. Confirm Epic + Tasks count.
3. Validate Story Points and Sprint values imported correctly.
4. Map `Owner` values to real assignees.
5. Convert `Dependencies` text into linked issue dependencies.
6. Move Sprint LUX-1 tasks into active sprint.

## Notes

1. Acceptance criteria are included in `Description` for immediate readiness.
2. `Parent` is intentionally blank to avoid hierarchy import mismatches in team-managed projects.
3. Use labels for filtering by phase:
- `phase-1`
- `phase-2`
- `phase-3`
4. Use label `luxury-modern` as the master filter.
