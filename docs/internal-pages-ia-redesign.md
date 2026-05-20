# Internal Pages IA Redesign (Scale + Cognitive Load)

## Objective

Redesign internal page organization to reduce cognitive load, increase findability, and scale to additional operational surfaces without navigation entropy.

## Industry references used

1. Nielsen Norman Group, Information Scent:
   - [Information Scent](https://www.nngroup.com/articles/information-scent/)
   - Applied: stronger, task-specific labels and context-rich grouping.

2. Nielsen Norman Group, Progressive Disclosure:
   - [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
   - Applied: show core pages first, defer advanced pages within each domain.

3. Laws of UX, Hick's Law:
   - [Hick's Law](https://lawsofux.com/hicks-law/)
   - Applied: reduce top-level navigation choices and avoid equal visual weight for all links.

4. Nielsen Norman Group, Recognition vs Recall:
   - [Recognition vs Recall](https://www.nngroup.com/articles/recognition-and-recall/)
   - Applied: domain hubs and explicit page descriptors so users recognize destinations instead of remembering path conventions.

## Current pain points addressed

- Flat internal page list mixed strategic, operational, and specialist tools.
- Header nav exposed too many sibling choices for high-frequency tasks.
- No explicit distinction between core and advanced pages.
- Growth surfaces and platform operations were interleaved, increasing context switching.

## New IA model

Three domain groups are now first-class:

1. Revenue & Growth
   - CRM, Customers, Outreach Performance (core)
   - Coach Outreach, Social, LinkedIn Launch, Speakers (advanced)

2. Product & Intelligence
   - Admin Hub Analytics, Intelligence (core)
   - B2B Deals, Action Scores, Feedback, Traces (advanced)

3. Platform Operations
   - Automation Guide, Team Management (core)
   - Outreach Hub (advanced)

## Core IA mechanics

- Core vs Advanced tiering is explicit in the UI.
- Operating Areas cards surface only core pages first.
- Full grouped tables preserve complete discoverability.
- Top header nav now favors highest-frequency operational destinations.

## Scaling rules (for new pages)

When adding new internal pages:

1. Assign a domain group first; do not create a standalone top-level nav entry.
2. Mark as core only if used weekly by >= 2 roles.
3. Keep header nav to 5-7 direct options max.
4. Every new advanced page must include an adjacent core page link-back.
5. Add a one-line purpose statement for each group entry point.

## Suggested next scaling step

Build dedicated domain hub pages:

- /dashboard/admin/revenue
- /dashboard/admin/product
- /dashboard/admin/operations

Those pages should each include:

- KPI strip
- open actions
- recent runs/alerts
- top tasks by role

This preserves low cognitive load while allowing significant internal surface growth.
