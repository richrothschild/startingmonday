# Internal Explore Playbook

This staff-only playbook standardizes how to use Explore to produce useful codebase insight for internal users.

## When to use it

Use Explore when you need a fast, read-only understanding of a subsystem, especially for:

- dashboard features and user flows
- worker jobs and scheduled automation
- auth, RLS, and data-access boundaries
- API routes and route-handler wiring
- migrations, infra, and operational scripts

## Goal

Produce a source-linked internal briefing that explains what exists, where it lives, how it connects, what can break, and what to inspect next.

## Prompt template

Use this exact shape when possible:

> Explore the target subsystem read-only at medium depth. Focus on what exists, where it lives, and how it connects. Return: what exists, top files or folders, data/auth/ops flow, risks, and one next anchor. Prefer source-linked answers and keep the scope local.

## Output format

Ask Explore to return the result in these sections:

1. Summary
2. Key files or routes
3. Data and auth flow
4. Risks and watchouts
5. Next anchor

## Working rules

- Keep the scope narrow to one subsystem at a time.
- Prefer local evidence over broad repo mapping.
- Tie claims back to files, routes, or generated guide entries.
- Regenerate only the affected slice when code changes.
- Use the internal guide index and source links so the briefing can be traced later.

## Suggested cadence

- Weekly refresh for stable areas.
- Manual refresh after major changes to dashboard, worker, auth, or schema code.

## Good internal use cases

- A team member wants to understand a subsystem before editing it.
- Support or ops needs a quick mental model of how a feature works.
- A reviewer wants a compact orientation pass before a deeper review.
- Documentation needs a current staff-facing summary without rereading the whole codebase.

## Recommended follow-up

After Explore, either:

- add the result to the relevant section of [docs/internal-guide.md](docs/internal-guide.md)
- add a short subsystem note beside the relevant source files
- update [docs/internal-system-summary.md](docs/internal-system-summary.md) if the high-level shape changed
