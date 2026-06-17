# White-Label Transition MVP Jira Import (Ready)

## Files
- [docs/jira/white-label-transition-mvp-import-2026-06-16.csv](docs/jira/white-label-transition-mvp-import-2026-06-16.csv)

## What this import contains
- 1 epic
- 15 stories
- Acceptance criteria on every story
- Dependencies and sprint sequencing across 5 two-week sprints (8-10 week MVP window)

## Suggested Jira CSV mapping (team-managed)
- Summary -> Summary
- Issue Type -> Issue Type
- Description -> Description
- Acceptance Criteria -> custom field (or append into Description)
- Epic Name -> Epic Name
- Priority -> Priority
- Labels -> Labels
- Components -> Components
- Story Points -> Story Points
- Sprint -> Sprint (optional if sprint names already exist)
- Owner -> Assignee (optional)
- Dependencies -> issue link notes (post-import if not auto-mapped)

## Execution order
1. Import CSV.
2. Confirm epic and story count.
3. Filter label `wl-s1` and start Sprint WL-1 stories first.
4. Keep no-custom pilot guardrail in scope review for each sprint.
