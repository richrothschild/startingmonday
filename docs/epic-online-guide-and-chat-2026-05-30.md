# Epic: Online User Guide + Guide Chat + Auto-Sync

Date: 2026-05-30
Owner: Product + Engineering
Status: In progress (MVP implemented)

## Objective

Build a user-facing guide that makes it easy to find answers fast, includes chat-based retrieval over guide content, and stays current via an automated sync process when features/APIs/articles change.

## Scope

- User guide at /guide with search and section browsing.
- Guide chat endpoint that returns ranked, relevant sources.
- Generated guide corpus that includes:
  - Get-started steps.
  - Product feature links.
  - How-to content from docs.
  - API/automation endpoint references.
  - Starting Monday article links.
- Auto-sync script that detects source changes and regenerates guide artifacts.

## Architecture

- Content generation:
  - Script: scripts/user-guide-sync.ts
  - Inputs: dashboard routes, API routes, blog metadata, automation guide markdown.
  - Outputs:
    - docs/user-guide.md
    - docs/user-guide.index.json
    - docs/user-guide.manifest.json
- UI:
  - Route: src/app/guide/page.tsx
  - Client UI: src/app/guide/guide-client.tsx
- Chat retrieval API:
  - Route: src/app/api/guide/chat/route.ts
  - Behavior: token-based scoring of guide index entries + answer synthesis + source list.

## Success Criteria

- Findability:
  - Users can discover guide from Help page in <= 1 click.
  - Users can search guide sections by keyword.
- Retrieval quality:
  - Guide chat returns >= 1 relevant source for common product questions.
  - Responses include source links users can open directly.
- Coverage:
  - Guide includes get-started, feature links, API references, and article links.
- Freshness:
  - Running npm run guide:user:sync updates artifacts when watched sources change.
  - npm run guide:user:check fails when guide artifacts are stale.

## Risks

- Token-based retrieval is deterministic but weaker than semantic embeddings.
- Route-derived feature labels may need manual curation for user readability.
- Auto-sync currently relies on script execution (CI/scheduler wiring is next).

## Phase Plan

1. MVP (completed)
- Implement generated guide + UI + chat retrieval + sync scripts.

2. Quality pass (next)
- Add retrieval evaluation set and scoring metrics.
- Improve snippets and ranking with phrase-level weighting.

3. Automation hardening (next)
- Wire guide sync into CI or scheduled runner.
- Add stale-guide alerting.
