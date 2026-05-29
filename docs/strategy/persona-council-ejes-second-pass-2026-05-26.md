# Persona Council EJES Second Pass - 2026-05-26

Scope: post-rewrite evaluation of initial emails across four channels using the job metrics.

Metrics:

1. Open probability (O)
2. Understand probability (U)
3. Reply probability (R)
4. Product-use lift probability (P)

Uber metric:

$$
EJES = 100 \times (O^{0.25} \cdot U^{0.35} \cdot R^{0.25} \cdot P^{0.15})
$$

Evaluation method:

- Persona-council read-through against clarity, cognitive load, and one-pass comprehension.
- This is a modeled score for copy quality, not an observed live campaign metric.

## Second-Pass Scores (Modeled)

| Channel | O | U | R | P | EJES | Send Gate |
| --- | --- | --- | --- | --- | --- | --- |
| Executives | 0.83 | 0.87 | 0.81 | 0.79 | 83 | Near target, rollout-ready |
| Coaches | 0.82 | 0.88 | 0.82 | 0.80 | 84 | Near target, rollout-ready |
| Search firms | 0.85 | 0.89 | 0.84 | 0.82 | 86 | Meets target |
| Outplacement | 0.82 | 0.88 | 0.81 | 0.80 | 84 | Near target, rollout-ready |

## What Improved Most

1. Understand rose due to plain-language sentence design and reduced abstraction.
2. Reply rose due to one clear yes or pass CTA and one asset ask.
3. Product-use lift rose because value can be understood in one quick read.

## Remaining Gap To EJES >= 85 Everywhere

1. Executives: add one concrete trigger token in line 1 from recipient context.
2. Coaches: swap one process term for a direct session outcome term.
3. Outplacement: replace one program phrase with a concrete day-one outcome.

## Decision

Status: deploy now for controlled outbound.

Next step:

1. Run one-week live test and replace modeled EJES with observed Open, Reply, and Activation data.
