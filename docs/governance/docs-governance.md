# Documentation Governance

Purpose: keep documentation accurate, decision-oriented, and easy to maintain in GitHub.

## Scope

This policy applies to all files under `docs/` except generated artifacts (for example: `*.latest.json`, `*.latest.md`, `internal-guide.*`, `user-guide.*`).

## Principles

1. One source of truth per topic.
2. Every doc has a clear owner.
3. Docs are reviewed on a fixed cadence.
4. Decisions are logged, not implied.
5. Archive stale docs instead of leaving ambiguous status.

## Required Header

Every governed Markdown doc should begin with this header block:

```md
# <Title>

Owner: <name or team>
Status: draft | active | deprecated | archived
Last reviewed: YYYY-MM-DD
Review cadence: weekly | monthly | quarterly
Source of truth: yes | no

```

If `Source of truth: no`, add one line immediately below the header:

`Canonical doc: <relative-path-or-url>`

## File Naming and Placement

1. Use lowercase kebab-case file names.
2. Keep strategic docs in `docs/strategy/`.
3. Keep operating docs in `docs/operations/` when possible.
4. Keep one-off campaign or sprint docs in topical folders with date in title when relevant.
5. Move retired docs to `docs/archive/` with an archive note.

## Change Control

1. Any meaningful behavior, policy, pricing, or process change must include a doc update in the same PR.
2. If a change affects operating decisions, update `docs/decision-log.md` in the same PR.
3. PR description should include a short `Docs impact` section.
4. For high-risk docs (pricing, legal-adjacent, customer promise docs), require one reviewer from product or founder/owner group.

## Review Cadence

1. Weekly: operational runbooks and active campaign docs.
2. Monthly: product, growth, and sales playbooks.
3. Quarterly: strategy docs, architecture overviews, and principles.

At review time, owners must do one of:

1. Confirm still accurate and update `Last reviewed`.
2. Amend and keep `Status: active`.
3. Mark `Status: deprecated` and add canonical replacement.
4. Archive with an archive note.

## Binary and Sensitive Content

1. Prefer Markdown as the source of truth.
2. Avoid committing large binaries to the main docs flow.
3. If binary files must be kept, store a paired Markdown summary with owner and review metadata.
4. Never commit secrets, credentials, private keys, or personal data.

## Google Drive Mirror Policy

All governed docs are mirrored to the Starting Monday Google Workspace Shared Drive by automation.

### Required secrets for sync automation

1. `GDRIVE_SERVICE_ACCOUNT_JSON`
2. `GDRIVE_SHARED_DRIVE_ID`
3. `GDRIVE_ROOT_FOLDER_ID`

### Exact folder mapping

The sync job maps repository paths to Drive folders using this fixed mapping:

| Repository path prefix | Drive folder |
| --- | --- |
| `docs/governance/` | `Governance/` |
| `docs/templates/` | `Templates/` |
| `docs/strategy/` | `Strategy/` |
| `docs/operations/` | `Operations/` |
| `docs/content/` | `Content/` |
| `docs/growth/` | `Growth/` |
| `docs/research/` | `Research/` |
| `docs/alerts/` | `Alerts/` |
| `docs/status/` | `Status/` |
| any other `docs/` path | `General/` |

Subfolders under each mapped area are preserved by relative path.

### Archive routing rules

A doc is routed to `Archive/` in Drive when one of these metadata rules is true:

1. `Status: deprecated`
2. `Status: archived`
3. `Lifecycle candidate: archive`

Archive destination pattern:

`Archive/<MappedArea>/<RelativeSubfolders>/<filename>`

### Exclusions from sync

These files are excluded from Drive mirror updates:

1. `internal-guide.*`
2. `user-guide.*`
3. `*.latest.md`
4. `*.latest.json`

### Automation source

Sync automation lives in:

1. `scripts/sync-docs-to-gdrive.mjs`
2. `.github/workflows/docs-drive-sync.yml`

## Minimal PR Checklist

Copy this into PRs that touch `docs/`:

```md
### Docs impact
- [ ] Header metadata present (owner/status/last reviewed/review cadence/source of truth)
- [ ] Canonical link added if this is not the source of truth
- [ ] Decision log updated if operational decision changed
- [ ] Deprecated docs marked or archived when replaced
```

For dashboard UI work, also include:

1. `docs/governance/dashboard-pr-checklist.md`

## Fast Start Workflow

1. Create from `docs/templates/doc-template.md`.
2. Fill header metadata.
3. If this is a decision document, also use `docs/templates/decision-record-template.md`.
4. If replacing a doc, add `docs/templates/archive-note-template.md` to the archived file.
