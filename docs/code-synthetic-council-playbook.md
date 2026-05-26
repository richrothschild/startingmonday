# Code Synthetic Council Playbook

## What you asked for

You want a synthetic council that reviews code, identifies what to fix, and pinpoints where to fix it.

## Cursor Team Kit vs Claude

Cursor Team Kit style workflows usually provide:

- multiple reviewer personas
- shared memory/context around a task
- a structured output with priorities and owners

Claude can do the same functionally, even without a single built-in "team kit" toggle, by combining:

- role-specific prompts (Principal Engineer, Security, SRE, QA, Performance)
- a shared evidence payload (repo metrics and findings)
- a deterministic aggregation pass (score, severity, fix queue)

In this repo, that pattern is now implemented via:

- scripts/code-synthetic-council-audit.mjs
- docs/code-synthetic-council-rubric.md

## How to run

From repo root:

```bash
node scripts/code-synthetic-council-audit.mjs
```

Optional machine-readable output:

```bash
node scripts/code-synthetic-council-audit.mjs --json
```

Strict mode (non-zero exit if overall score < 85):

```bash
node scripts/code-synthetic-council-audit.mjs --strict
```

## Outputs

The run writes:

- docs/code-synthetic-council-audit.latest.md
- docs/code-synthetic-council-audit.latest.json

## What the council currently evaluates

- correctness signals
- security signals
- maintainability and complexity signals
- type-safety signals
- testability signals
- observability signals
- delivery risk signals

## How to use results in practice

1. Start from "Priority Fix Queue" in the markdown report.
2. Address critical and high-severity findings first.
3. Re-run the audit after each fix wave.
4. Track score deltas over time and tie them to release quality outcomes.

## Recommended next upgrade

Add a qualitative Claude synthesis pass that reads the JSON report and emits:

- root-cause themes
- remediation plan by sprint
- policy changes to prevent recurrence

This keeps the council deterministic for gating and adds Claude judgment where it is most useful: synthesis and planning.
