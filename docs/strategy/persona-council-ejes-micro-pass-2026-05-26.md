# Persona Council EJES Micro-Pass - 2026-05-26

Scope: post micro-pass evaluation after trigger-token and sentence-simplification updates in live templates.

Method note:

- Scores below are modeled by council review criteria, not yet measured from live campaign data.

Uber metric:

$$
EJES = 100 \times (O^{0.25} \cdot U^{0.35} \cdot R^{0.25} \cdot P^{0.15})
$$

## Micro-Pass Results

| Channel | O | U | R | P | EJES | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Executives | 0.85 | 0.90 | 0.84 | 0.82 | 86 | Meets 85+ target |
| Coaches | 0.84 | 0.90 | 0.84 | 0.82 | 86 | Meets 85+ target |
| Search firms | 0.85 | 0.89 | 0.84 | 0.82 | 86 | Meets 85+ target |
| Outplacement | 0.84 | 0.88 | 0.83 | 0.81 | 85 | Meets 85+ target |

## Why Scores Moved Up

1. Trigger tokens reduce interpretation time in paragraph one.
2. Choice lines are shorter and easier to restate.
3. Proof lines stay bounded and legal-safe.
4. One binary yes or pass ask keeps cognitive load low.

## What It Would Take To Reach EJES >= 90

To reach 90+, modeled targets should be close to:

- O >= 0.88
- U >= 0.93
- R >= 0.88
- P >= 0.87

Required changes by lever:

1. Personalization trigger quality:

- Inject one recipient-specific trigger token from real context (role change, recent post, mandate shift).
- Generic trigger language should be fallback only.

1. Subject performance:

- Add one consequence word plus one concrete context token.
- Keep subject in the 40 to 62 character range.

1. Proof relevance:

- Keep one proof line, but tie it to channel-specific outcome language.
- Example: for coaches, emphasize recovered session time; for search, emphasize reduced partner review cycles.

1. CTA precision:

- Keep yes or pass, but include a clear timing frame in channels where urgency matters.
- Example: yes this week for executive and search-firm flows.

1. Readability guardrails:

- Keep sentence length mostly in 8 to 14 words.
- Remove every non-essential abstract noun.
- Keep each paragraph to one clear idea.

1. Evidence for true 90+ confidence:

- Run a 7 to 14 day A/B send test with this version vs prior version.
- Replace modeled O, R, and P with observed values before claiming 90+ readiness.

## Decision

Current state: 85+ target achieved in all four channels under modeled council scoring.

Next state for 90+: personalization and channel-outcome proof tuning plus live A/B validation.
