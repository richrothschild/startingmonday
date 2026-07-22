# Search Strategy Intake Form Spec

Owner: Documentation Operations
Status: draft
Last reviewed: 2026-07-20
Source of truth: yes

## Purpose

Create a coach-shareable intake flow that captures the minimum structured context needed to generate a useful search strategy, campaign foundation, and prep guidance without asking the client to rewrite their entire career story in prose.

The form is the phase 4 bridge between coaching conversations and product execution. A client should be able to complete it alone, or with a coach in one session, and the result should be immediately useful to the dashboard and brief generation flow.

## Problem Statement

The current Search Strategy Brief can synthesize a strong narrative, but the product still asks users to assemble the right context across multiple screens and free-form profile fields. Coaches need a structured way to collect search inputs that are specific enough to improve guidance, but lightweight enough that clients will actually finish it.

## Primary Users

1. Executive candidate running a confidential or active search.
2. Executive coach helping a client define the search before outreach and interview prep begin.
3. Internal support or concierge workflow that needs a clean intake artifact before the strategy brief is generated.

## Product Outcome

When the form is complete, the app should be able to:

1. Generate a sharper Search Strategy Brief.
2. Populate Campaign Foundation on the dashboard.
3. Improve interview prep prompts and company fit framing.
4. Help coaches review the search without reconstructing it from memory.

## Required Field Groups

### 1) Search frame

- Target roles.
- Stretch roles.
- Roles to avoid.
- Transition type.
- Search stage.
- Urgency / timing.

### 2) Target market

- Target industries.
- Target companies.
- Company size / stage.
- Geography.
- Remote / travel constraints.
- Compensation guardrails if the user wants them included.

### 3) Positioning

- Current title / most recent title.
- Positioning summary.
- Differentiators.
- Proof points.
- Recent activity summary.
- Relationships that should be activated.

### 4) Decision rules

- Culture criteria.
- Red flags.
- Non-negotiables.
- Decision criteria.
- Board visibility or stakeholder complexity.

## Form Shape

The form should feel like a guided conversation, not a survey wall.

Recommended structure:

1. Step 1: Role and search frame.
2. Step 2: Target market and constraints.
3. Step 3: Positioning and proof.
4. Step 4: Decision rules and red flags.
5. Step 5: Review and handoff.

Each step should show a short why-line so the user understands why the field matters.

## Data Model Impact

Use existing `user_profiles` fields where possible before adding new columns.

Likely additions if product review approves them:

- `roles_to_avoid text[]`
- `search_hypothesis text`
- `culture_criteria jsonb`
- `decision_criteria jsonb`

Only add a field if it is needed by at least one downstream surface.

## Downstream Surfaces

1. Search Strategy Brief should use the intake as primary context.
2. Campaign Foundation should summarize the captured strategy in plain language.
3. Prep generation should reuse the same target-role and positioning context.
4. Signals should reflect the intake so the user sees profile-specific relevance.

## Coach Flow

The coach should be able to review the intake in under two minutes and answer:

1. What is this client targeting?
2. What are they avoiding?
3. What evidence do they have today?
4. What decisions are already made vs still open?

The result should be shareable before the next coaching session.

## Non-Goals

- This is not a full ATS or CRM replacement.
- This is not a long-form biography editor.
- This is not a public lead capture form.
- This is not the final coaching recommendation engine.

## Acceptance Criteria

1. A client can complete the intake in one sitting without writing a long essay.
2. The output cleanly feeds the Search Strategy Brief and dashboard summary.
3. Coaches can identify the client’s target roles, target market, and decision rules at a glance.
4. Empty states prompt completion rather than showing a dead end.
5. The form works as a standalone client workflow and as a coach-supported workflow.

## Build Order

1. Schema review and field mapping.
2. Intake UI and save/resume flow.
3. Brief generation wiring.
4. Campaign Foundation summary wiring.
5. Coach review and share flow.
