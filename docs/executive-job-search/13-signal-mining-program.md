# Signal Mining Program

Updated: 2026-05-31

This program covers the non-interview, non-case-reconstruction part of the executive job-transition research plan. It explicitly includes items 13, 14, 15, and 16 from the option set and excludes 10, 11, and 12.

## Scope

Included:

1. Signal-mining sprint.
2. Public job transition mining.
3. Job-description and hiring-language analysis.
4. Transition archetype synthesis.

Excluded:

1. Interviewing executive coaches, recruiters, search partners, or outplacement leaders.
2. Structured case reconstruction of past transitions.
3. Comparing expert interview outputs to council outputs.

## Internal Library Goal

The internal library is a verified-source-backed store of executive transition facts, signals, and reusable interpretations.

It is designed to answer three questions:

1. What do the verified public sources actually say?
2. Which transition patterns recur in market data?
3. Which signals should influence product diagnosis and interventions?

## Verified Source Stack

The library uses the verified stack in the source register:

1. BLS occupational role descriptions.
2. O*NET work activity structure.
3. LinkedIn Economic Graph reports.
4. Spencer Stuart executive transition guidance.
5. APA metadata as a hypothesis source only.

Tier rules:

1. Tier A sources can drive default product behavior.
2. Tier B sources can refine hypotheses with caution.
3. Tier C sources are reference-only unless confirmed elsewhere.

## Item 13: Signal-Mining Sprint

Goal: Build objective market context from public verified sources.

Weekly outputs:

1. Refreshed verified-source snapshots.
2. New or changed source notes.
3. Signal summaries for role, transition, and decision behavior.

## Item 14: Public Job-Transition Mining

Goal: Use public role history to understand how executives actually move.

Weekly outputs:

1. Public transition notes.
2. Title-move patterns.
3. Tenure and function-shift observations.

## Item 15: Job-Description Language Analysis

Goal: Extract recurring hiring language by role and sub-role.

Weekly outputs:

1. Role-language lexicon.
2. Constraint patterns.
3. Repeated interview cues and hiring-manager phrasing.

## Item 16: Transition Archetype Synthesis

Goal: Convert repeated market patterns into archetypes that product can use.

Weekly outputs:

1. Archetype definitions.
2. Common triggers and derailers.
3. Matching interventions and metrics.

## Weekly Refresh Loop

Every week the cron job:

1. Loads the verified source catalog.
2. Fetches the current source pages.
3. Extracts title, summary, and excerpt data.
4. Upserts the internal library.
5. Records a refresh run for auditability.

Only verified sources are included. Newly discovered sources should be added manually to the catalog after verification.

## Deliverables

1. Internal source library.
2. Weekly verified-source refresh job.
3. Transition-pattern note set.
4. Job-description language lexicon.
5. Transition archetype library.
