# /pr

Run the pre-PR check suite, then open a pull request.

## Step 1 — Run pre-PR checks

Run: `npm run check:pr`

Show Rich the output as-is. When it finishes:

- If **all checks pass**: proceed to Step 2 automatically.
- If **any checks fail**: stop and clearly list what failed. Ask Rich:
  1. Fix the issues first (recommended — tell him what to look at)
  2. Proceed anyway (he accepts the risk)
  3. Cancel

Do not proceed to PR creation until Rich makes a choice.

## Step 2 — Gather PR details

Before running `gh pr create`, determine:

1. **Branch name**: run `git branch --show-current`
2. **Ticket number**: extract from branch name (e.g. `SMK-156/some-description` → `SMK-156`). If the branch has no ticket number, ask Rich for it.
3. **PR title**: look at `git log main..HEAD --oneline` to understand what shipped. Propose a title in the form `feat(SMK-XX): short description` — adjust the prefix (`fix`, `chore`, `refactor`) to match the nature of the changes. Ask Rich to confirm or edit it.
4. **Draft or ready?**: ask Rich whether this should be a draft PR or ready for review.

## Step 3 — Create the PR

Run:
```
gh pr create \
  --base main \
  --title "<confirmed title>" \
  --body "Closes SMK-XX" \
  [--draft if Rich chose draft]
```

Return the PR URL when done.

## Notes

- Rich is the repo owner (`richrothschild`) — do not add a reviewer.
- Always include `Closes SMK-XX` in the body (required for Jira integration).
- Base branch is always `main` — never `staging`.
- If `gh` is not authenticated or returns an error, show the error and stop.
