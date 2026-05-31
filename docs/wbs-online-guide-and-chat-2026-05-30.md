# WBS: Online User Guide + Guide Chat

Date: 2026-05-30

## Work Breakdown Structure

1. Discovery and IA
- Audit existing guide/help routes and source docs.
- Define canonical guide information architecture.

2. Content Pipeline
- Build source scanner for dashboard pages and API routes.
- Pull article metadata from blog post catalog.
- Parse how-to sections from automation guide.
- Generate markdown and index artifacts.
- Persist source manifest hash for freshness checks.

3. Guide Experience
- Update /guide to use generated user-guide.md.
- Add rich in-page search + section index navigation.
- Improve readability and linkability in guide section rendering.

4. Guide Chat Retrieval
- Implement /api/guide/chat endpoint.
- Add query normalization and token scoring.
- Return synthesized answer + ranked sources.
- Add client-side chat UI and error/loading states.

5. Findability
- Add clear /guide entry point from /dashboard/help.
- Ensure guide path remains accessible to authenticated users.

6. Operationalization
- Add npm scripts:
  - guide:user:sync
  - guide:user:check
  - guide:user:force
- Validate guide generation and typecheck.

7. Quality and Validation
- Execute guide sync generation.
- Run TypeScript typecheck.
- Confirm no regressions in touched files.
