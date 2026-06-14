# PR Churn Reduction Policy

## Goal
Reduce commit-fail-recommit churn by preventing predictable failures before merge.

## 1. Feature-Flag-First for Risky Changes
- Risky PRs touching auth, conversion funnels, pricing, or major UX surfaces must carry the `feature-flagged` label.
- Risky changes must ship behind an off-by-default kill switch.
- Rollout sequence: internal -> pilot -> percentage rollout -> full rollout.

Reference policy: config/feature-rollout-policy.json

## 2. Auto-Remediation Guardrails
- Auto-fix is allowed only for low-risk classes:
  - visual baseline refresh
  - guide sync artifacts
- Auto-fix is blocked when `risk:high` or `autofix:blocked` labels exist.
- Visual autofix requires `autofix:approved` label.

## 3. PR Churn SLO Dashboard
- Weekly report artifact:
  - docs/status/pr-churn-slo.latest.json
  - docs/status/pr-churn-slo.latest.md
- Tracked metrics:
  - reopen rate
  - median time to merge
  - median commits per PR
  - median files changed per PR
  - high-churn PR rate

## 4. Merge-Queue Full-Suite Validation
- Merge queue runs expanded Playwright suite as a final gate.
- PR gates stay focused and change-aware for fast feedback.
- Merge queue absorbs heavier confidence checks before final merge.
