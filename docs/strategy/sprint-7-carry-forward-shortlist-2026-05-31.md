# Sprint 7 Carry-Forward Shortlist (2026-05-31)

Source reviewed: `origin/archive/sprint-6-rebased-2026-05-31`

## Priority Candidates To Evaluate

1. `scripts/internal-guide-sync.ts`
- Why: deterministic guide hashing changes reduced local/CI drift risk during merge gates.
- Keep criteria: no regression in guide freshness checks on CI.

2. `scripts/user-guide-sync.ts`
- Why: companion hash-ordering/path-normalization fixes should stay paired with internal guide logic.
- Keep criteria: stable `guide:user:check` across Windows/Linux runners.

3. `scripts/check-auth.mjs`
- Why: auth guard hardening supported CI auth UX reliability.
- Keep criteria: no false positives in `Auth UX guard` workflow.

4. `tests/e2e/global-setup.ts`
- Why: setup reliability improvements reduced flaky auth bootstrap.
- Keep criteria: deterministic login/session setup in Playwright jobs.

5. `tests/e2e/mobile-visual.spec.ts`
- Why: mobile visual assertion updates aligned baselines with production rendering.
- Keep criteria: consistent pass across iPhone/Android snapshots.

## Defer Until Explicit Scope

- Broad product/ops sweep from `chore: commit today updates across product, research, and ops`.
- Reason: too large for sprint-7 proof architecture entry point and high regression surface.

## Exclude From Porting

- Generated guide/perf artifacts under `docs/*latest*`, `docs/internal-guide*`, `docs/user-guide*`.
- Screenshot binaries in `tests/e2e/__screenshots__/` unless paired with an intentional visual baseline refresh.
- Lockfile-only churn without scoped dependency decisions.