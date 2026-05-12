# 30-Day Execution Plan (Monitor-First)

## Objective

Ship a relationship-first execution loop in 30 days that increases daily action-taking, reduces onboarding drop-off, and proves that the Monitor tier is a durable paid entry point.

## Must-Ship-Now (Days 1-30)

1. Daily Briefing as home-base workflow

- Briefing becomes the first screen from dashboard entry points.
- Every briefing section ends with one action CTA: company follow-up, contact touch, or prep task.
- Today, Do This block always shows a prioritized top 3.

1. Relationship-first data model in UX

- Company views always expose associated contacts and next relationship action.
- Contact views always show linked companies and signal context.
- Remove dead-end flows where users can read without scheduling next action.

1. Monitor tier naming and packaging consistency

- Monitor is the only external name for the $49 tier across site, app, and email copy.
- Plan comparison copy clearly differentiates Monitor vs Search vs Executive.
- Billing and post-placement downgrade prompts consistently route to Monitor language.

1. Activation and accountability instrumentation

- Track: first company added, first contact added, first follow-up set, first briefing action completed.
- Add daily activation funnel snapshots to admin reporting.
- Add placement-state retention events (downgrade to Monitor, weekly digest opens, reactivation starts).

1. Fast reliability hardening

- Briefing load SLO baseline in place.
- OAuth and billing critical path smoke checks in CI.
- Error alerts for briefing generation, checkout session creation, and callback auth failures.

## 30-Day Timeline

### Week 1 (Days 1-7): Lock Scope and Instrumentation

- Freeze IA for briefing-first navigation and relationship-first surfaces.
- Finish event schema and verify end-to-end tracking in production.
- Complete Monitor naming migration for all user-facing surfaces.
- Ship QA checklist for dashboard, billing, auth, and post-placement flows.

Exit criteria:

- All must-ship-now epics have owners and acceptance criteria.
- Event pipeline validates in production with no missing critical events.
- Zero remaining user-facing Passive tier references.

### Week 2 (Days 8-14): Build Core Workflow

- Implement briefing-first entry points and top-3 action block.
- Implement relationship cross-links (company to contacts, contact to companies).
- Add follow-up scheduling prompts in key action moments.
- Add admin dashboard tiles for daily activation metrics.

Exit criteria:

- Internal dogfood confirms full daily workflow completion in <= 7 minutes.
- At least 90% of new users can set one follow-up in first session.

### Week 3 (Days 15-21): Stabilize and Tighten

- Improve action quality ranking in briefing suggestions.
- Tighten empty states to always produce a concrete next step.
- Add fallback rendering for partial briefing generation failures.
- Run synthetic council acceptance review and fix top blockers.

Exit criteria:

- Briefing generation success >= 99% for scheduled runs.
- P95 briefing page load <= 2.5s for signed-in users.

### Week 4 (Days 22-30): Launch, Observe, Decide

- Launch to 100% of users.
- Run daily metric standup with product, growth, and reliability.
- Execute reactivation campaign for placed users into Monitor.
- Hold day-30 go/no-go review for next-phase investment.

Exit criteria:

- Go/no-go metric thresholds evaluated with 14-day trailing data.
- Decision made: scale, hold, or rollback specific elements.

## Risk Mitigations By Council

### Product Council Risk: users read but do not act

Mitigations:

- Force one-click conversion from insight to action in every briefing section.
- Add no action scheduled warning state.
- Track briefing-to-action conversion daily.

### UX Council Risk: overload and cognitive fatigue

Mitigations:

- Cap Today, Do This to top 3 actions.
- Progressive disclosure for lower-priority context.
- Enforce plain-language action labels and due-date defaults.

### Revenue Council Risk: Monitor cannibalizes higher tiers

Mitigations:

- Keep premium value boundaries explicit: prep briefs, advanced AI workflows, and deeper scans remain higher tiers.
- Add contextual upgrade prompts only at value moments.
- Track downgrade and upgrade flow weekly by cohort.

### GTM Council Risk: messaging drift across surfaces

Mitigations:

- Single source copy doc for tier naming and value props.
- Add pre-merge copy check for banned legacy tier labels.
- Weekly audit of pricing, onboarding, billing, and lifecycle emails.

### Data Council Risk: blind spots in funnel interpretation

Mitigations:

- Define activation event contract and version it.
- Alert on event drop-rate anomalies.
- Require dashboard parity between product analytics and billing states.

### Security Council Risk: auth and billing regressions during fast changes

Mitigations:

- Keep requireAuth enforcement on all non-webhook API routes.
- Add smoke tests for OAuth callback, billing checkout, and billing portal.
- Add release checklist gate for auth and payment critical paths.

### Reliability Council Risk: briefing trust erodes from flaky runs

Mitigations:

- Add retries and graceful partial rendering for upstream fetch failures.
- Alert on briefing generation error spikes and stale briefing timestamps.
- Publish weekly reliability report with incident actions.

### Ops Council Risk: team loses cadence after launch

Mitigations:

- Daily 15-minute execution review with owner-level blockers.
- Weekly risk burn-down with named DRI per issue.
- Keep backlog constrained: no new scope unless tied to threshold movement.

## Success Metric Thresholds (Go/No-Go)

### Primary thresholds

1. Activation completion (new users, 7-day): >= 45%

Definition: company added + contact added + follow-up scheduled + one briefing action completed.

1. Briefing-to-action conversion (DAU): >= 35%

Definition: user completes at least one tracked action within 24h of opening briefing.

1. Monitor retention (new Monitor subscribers, day-30): >= 70%

Definition: paid Monitor subscribers still active at day 30.

1. Upgrade pull (Monitor to Search or Executive, 30-day): >= 12%

Definition: Monitor starts that upgrade within 30 days.

1. Reliability floor

- Briefing generation success: >= 99%
- P95 signed-in dashboard load: <= 2.5s
- OAuth callback failure rate: < 0.5%

### Guardrail thresholds

1. Support burden

- Billing and auth support tickets per 100 active users: <= 3 per week.

1. Revenue health

- Net MRR growth remains positive week over week during launch window.

1. Quality perception

- Briefing was useful today pulse score: >= 4.2/5.

### Decision rules

- Go: all primary thresholds met and no guardrail breach for 14 consecutive days.
- Conditional go: one primary miss allowed if trendline improves >= 10% week over week and guardrails hold.
- No-go: two or more primary misses, or any severe guardrail breach (security, billing, or reliability incident).

## Operating Cadence During 30 Days

- Daily: 15-minute execution standup with metric review and blocker assignment.
- Twice weekly: council-risk checkpoint (product, UX, revenue, reliability).
- Weekly: metric deep dive and scope prune.
- Day 30: formal go/no-go with written decision memo and next 30-day scope.
