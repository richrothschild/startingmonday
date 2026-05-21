# Starting Monday Jira Sprint Slices

## File

- CSV import file: docs/Starting_Monday_Jira_Sprint_Slices_2026-05-21.csv

## What this includes

- 8 Epic rows aligned to the revised team-managed Jira structure.
- Sprint-by-sprint Task sequencing across Sprint 1 through Sprint 6.
- Priority, owner, dependencies, story points, labels, and components.
- Explicit inclusion of these requested initiatives:
  - Full UI/UX audit by hand and council
  - Executive search firm pages parity with outplacement pages
  - Add more names by outreach channel
  - Publish more articles and blog posts
  - Increase LinkedIn company page posting cadence
  - Create a code quality and review council and adapt to findings

## Recommended import flow (team-managed)

1. Create or confirm the team-managed Jira Software project.
2. Import CSV with Epic and Task issue types enabled.
3. Map fields:
   - Issue Type -> Issue Type
   - Summary -> Summary
   - Description -> Description
   - Epic Name -> Epic Name
   - Priority -> Priority
   - Labels -> Labels
   - Components -> Components
   - Story Points -> Story Points
4. After import, set sprint containers in board backlog and drag tasks by Sprint column value.
5. Confirm owner mapping from the Owner column to Jira assignee conventions.

## Notes

- The Parent column is intentionally blank to avoid team-managed CSV hierarchy import mismatches.
- Epic association is carried by Epic Name for import simplicity.
- If your Jira setup supports parent linking during import, you can add Parent IDs after first import pass.
