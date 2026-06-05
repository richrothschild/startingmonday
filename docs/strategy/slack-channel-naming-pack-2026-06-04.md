# Slack Channel Naming and Description Pack

Date: 2026-06-04
Scope: UI delivery, QA signals, design review, and release operations

## Channel Set (Create in This Order)

1. #ui-delivery
- Purpose: Daily shipping flow and non-critical progress updates.
- Post types allowed:
  - Jira status transitions
  - PR opened and merged
  - Deployment success summaries
- Post types blocked:
  - Individual commit pushes
  - Per-test pass noise

2. #ui-alerts
- Purpose: Immediate attention failures only.
- Post types allowed:
  - CI failure
  - Visual regression failure
  - Lighthouse budget failure
  - Deployment failure
  - Critical Jira issues marked Blocked
- Post types blocked:
  - Informational updates
  - Design comments

3. #ui-design-review
- Purpose: Design comments, approvals, and handoff signals.
- Post types allowed:
  - Figma file comments
  - Design approval decisions
  - Ready-for-build handoff notes
- Post types blocked:
  - Engineering CI updates

4. #ui-research
- Purpose: User behavior insights and friction evidence.
- Post types allowed:
  - Hotjar sessions tagged friction/high intent
  - Funnel drop-off threshold alerts
  - Usability test highlights
- Post types blocked:
  - Raw session stream

5. #ui-release-ops
- Purpose: Production release checkpoints and post-deploy verification.
- Post types allowed:
  - Release start/finish messages
  - Incident and rollback notes
  - Post-deploy smoke check summaries
- Post types blocked:
  - General product discussion

## Channel Descriptions (Copy/Paste)

#ui-delivery
UI delivery stream. PR opened/merged, Jira transitions, deploy success. No failure spam.

#ui-alerts
UI failures only. CI fail, visual regression fail, performance budget fail, deploy fail.

#ui-design-review
Design review and handoff. Figma comments, approvals, and build-ready design updates.

#ui-research
Research and behavior evidence. Hotjar friction insights and usability findings.

#ui-release-ops
Release and production operations. Deploy checkpoints, smoke checks, incidents, rollbacks.

## Channel Membership Rules

- #ui-delivery: product, engineering, design, PMM stakeholders
- #ui-alerts: engineering on-call + tech lead + product lead
- #ui-design-review: design + frontend + PM
- #ui-research: UX + product + conversion owners
- #ui-release-ops: engineering leads + release owner + on-call

## Naming Rules for Future Channels

- Prefix by domain: ui-
- Suffix by function: delivery, alerts, review, research, ops
- Keep one responsibility per channel
- Avoid duplicates like #design-ui and #ui-design unless ownership is different

## Message Prefix Convention

Use this short prefix for machine and human posts:
- [INFO] for non-urgent updates
- [WARN] for elevated risk needing follow-up
- [CRIT] for immediate action
