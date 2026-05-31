# Tickets: Online User Guide + Guide Chat

Date: 2026-05-30
Sprint: Current

## Ticket 1: Generate user guide artifacts
- Description: Build script that scans product routes, APIs, and articles, then writes user guide markdown/index/manifest.
- Deliverables:
  - scripts/user-guide-sync.ts
  - docs/user-guide.md
  - docs/user-guide.index.json
  - docs/user-guide.manifest.json
- Acceptance criteria:
  - Sync script generates artifacts without manual editing.
  - Index includes get-started, features, APIs, and articles.

## Ticket 2: Add stale-check workflow
- Description: Add check mode that fails when source hash differs.
- Deliverables:
  - npm script: guide:user:check
- Acceptance criteria:
  - guide:user:check exits non-zero when stale.
  - guide:user:sync refreshes stale artifacts.

## Ticket 3: Upgrade /guide page to user-facing corpus
- Description: Replace internal-only source dependence with generated user guide markdown.
- Deliverables:
  - src/app/guide/page.tsx
- Acceptance criteria:
  - Authenticated users can load /guide.
  - Fallback guidance appears if artifacts are missing.

## Ticket 4: Implement guide chat retrieval API
- Description: Create endpoint that answers questions using guide index retrieval.
- Deliverables:
  - src/app/api/guide/chat/route.ts
- Acceptance criteria:
  - Valid question returns answer + ranked source list.
  - Invalid requests return 4xx with actionable error.

## Ticket 5: Add guide chat UI
- Description: Add chat input and results panel in guide UI.
- Deliverables:
  - src/app/guide/guide-client.tsx
- Acceptance criteria:
  - Enter key and button submit supported.
  - Loading/error/success states rendered.
  - Source links are visible and clickable.

## Ticket 6: Improve guide discoverability from Help
- Description: Add clear entry point from Help page to guide.
- Deliverables:
  - src/app/(dashboard)/dashboard/help/page.tsx
- Acceptance criteria:
  - Help page displays card linking to /guide.

## Ticket 7: Validation and closeout
- Description: Execute sync and typecheck; record completion status.
- Deliverables:
  - Passing guide:user:sync
  - Passing typecheck
- Acceptance criteria:
  - No type errors from touched code paths.
  - Guide artifacts exist and are current.
