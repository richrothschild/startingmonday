# Code Synthetic Council Rubric (Full Spectrum)

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: yes


## Scoring model

- Scale: 0-100 per category.
- Overall score: weighted blend of category scores.
- Grade bands:

  - A+: 97-100
  - A: 93-96
  - A-: 90-92
  - B+: 87-89
  - B: 83-86
  - B-: 80-82
  - C+: 75-79
  - C: 70-74
  - C-: below 70

## Category weights

- correctness: 16%
- security: 16%
- type safety: 12%
- testability: 12%
- maintainability: 12%
- observability: 10%
- performance: 8%
- complexity: 8%
- delivery risk: 6%

## Category definitions and metrics

### 1. Correctness

Purpose: reduce runtime defects and logic regressions.

Metrics:

- suppression directives (`@ts-ignore`, `@ts-expect-error`)
- high-risk code patterns in critical paths
- consistency of source and test signals

### 2. Security

Purpose: prevent exploitable behavior.

Metrics:

- `eval` or `new Function` usage
- unsafe HTML injection surfaces (`dangerouslySetInnerHTML`)
- risky process execution density

### 3. Type Safety

Purpose: reduce ambiguity and hidden edge-case failure.

Metrics:

- `any` density
- type suppression directives
- typed-path consistency in TS/TSX code

### 4. Testability

Purpose: ensure behavior is provable and regressions are catchable.

Metrics:

- source-to-test traceability (counterpart test presence)
- test-surface coverage by module type
- gaps in high-change/high-risk files

### 5. Maintainability

Purpose: keep cost of change low.

Metrics:

- file size thresholds
- long-line density
- readability and decomposition pressure

### 6. Observability

Purpose: improve diagnosis and MTTR.

Metrics:

- logging/exception capture presence in API routes
- error instrumentation consistency
- operational signal coverage

### 7. Performance

Purpose: avoid avoidable latency and scale risk.

Metrics:

- blocking sync operations in heavy paths
- process spawn overuse
- expensive static anti-pattern indicators

### 8. Complexity

Purpose: reduce change risk from nested/branch-heavy logic.

Metrics:

- deep nesting levels
- branch and conditional density
- large-function density

### 9. Delivery Risk

Purpose: expose unresolved implementation uncertainty.

Metrics:

- TODO/FIXME/HACK marker density
- unresolved migration notes in production paths
- concentration of deferred work in core modules

## Severity model

- critical: must-fix before release
- high: fix in current sprint
- medium: schedule in next sprint
- low: backlog with trend monitoring

## Council decision policy

When recommendations conflict, prioritize by:

1. security and correctness risk
2. user impact magnitude
3. reversibility and blast radius
4. effort-to-risk reduction ratio
5. strategic roadmap alignment

## Exit criteria for "healthy"

- Overall score >= 90
- No critical findings
- No high findings in security/correctness left unassigned
- Testability >= 85 and observability >= 85

## Governance cadence

- Per PR: fast scoped review on touched files
- Weekly: repository-wide synthetic council run
- Monthly: score trend review + rubric calibration
