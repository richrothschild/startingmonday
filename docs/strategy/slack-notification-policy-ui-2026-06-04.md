# Slack Notification Policy for UI Delivery

Date: 2026-06-04
Owner: UI delivery lead
Source of truth: Jira project board

## Policy Goal

Deliver the right signal to the right channel with minimal noise.

## Routing Matrix

Jira
- #ui-delivery:
  - Issue created (Story/Task/Bug in UI project)
  - Status moved to In Progress, In Review, Done
- #ui-alerts:
  - Priority High/Critical created
  - Status moved to Blocked

GitHub
- #ui-delivery:
  - PR opened
  - PR merged
  - Deploy success summary
- #ui-alerts:
  - Required check failed
  - Deploy failed

Chromatic
- #ui-delivery:
  - Build summary (digest mode)
- #ui-alerts:
  - Visual regression fail

Lighthouse CI
- #ui-delivery:
  - Pass summary for main/release only
- #ui-alerts:
  - Budget failure on PR/main/release

Figma
- #ui-design-review:
  - Comment added
  - Approval / handoff note

Hotjar or Research Automation
- #ui-research:
  - Friction-tagged session alerts
  - Funnel threshold regression
- #ui-alerts:
  - Critical conversion drop alert only

## Noise Controls (Mandatory)

1. Do not duplicate the same event across multiple channels unless severity is CRIT.
2. Use digest mode for success events whenever supported.
3. Disable commit-by-commit notifications.
4. Suppress Jira comment events unless they include a blocker tag.
5. Restrict alerts to the UI Jira project only.

## Message Contract (Required Fields)

Every automated message must include:
1. System: Jira/GitHub/Chromatic/Lighthouse/Figma/Hotjar
2. Severity: INFO/WARN/CRIT
3. Scope: page or feature area
4. Owner: assignee or team owner
5. Link: direct actionable URL
6. Next action: one line

## SLA and Escalation

- CRIT in #ui-alerts: acknowledge within 30 minutes in working hours
- WARN in #ui-alerts: acknowledge same business day
- INFO in #ui-delivery: no SLA, reviewed in daily standup

Escalation path:
1. Alert owner responds in thread
2. If no response in SLA window, tag UI lead
3. If release risk, post summary in #ui-release-ops

## Review Cadence

Weekly policy review checklist:
1. Which notifications were ignored?
2. Which alerts lacked owners?
3. Which events should move from realtime to digest?
4. Which integrations generated duplicate posts?

Update this policy monthly or after major workflow changes.
