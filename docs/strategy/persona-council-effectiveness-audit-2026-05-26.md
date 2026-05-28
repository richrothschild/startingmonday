# Persona Council Effectiveness Audit - 2026-05-26

Goal: judge whether each channel email actually does its job for the reader.

Critical job metrics:

1. Open: will they open the email?
2. Understand: will they read and understand it quickly?
3. Reply: will they reply yes or pass?
4. Product lift: did we materially improve probability of product use?

## Uber Metric

Name: Email Job Effectiveness Score (EJES)

Formula:

$$
EJES = 100 \times (O^{0.25} \cdot U^{0.35} \cdot R^{0.25} \cdot P^{0.15})
$$

Where:

- $O$ = Open probability (0 to 1)
- $U$ = Understand probability (0 to 1)
- $R$ = Reply probability (0 to 1)
- $P$ = Product-use lift probability (0 to 1)

Why this shape:

- Understand has highest weight because low clarity kills every downstream outcome.
- Geometric form punishes weak links; one low dimension drags the whole score.
- Product lift remains explicit so the metric does not optimize only for replies.

Send-gate thresholds:

1. EJES >= 75: send-ready.
2. EJES 65 to 74: rewrite recommended before scaling.
3. EJES < 65: do not send.

Hard fail rules:

1. If U < 0.60, cap EJES at 59.
2. If sentence complexity causes high cognitive load, cap EJES at 64.
3. If the reader cannot restate the ask in one line, cap EJES at 64.

## Council Personas By Channel

Executives channel reviewers:

1. Claudio Fernandez-Araoz (executive readiness standards)
2. Anne Applebaum (credibility, precision, seriousness)
3. Annie Duke (decision quality under uncertainty)
4. Displaced CIO under time pressure (speed, clarity, and recovery)

Coaches channel reviewers:

1. Octavia Zahrt (coach workflow reality)
2. Kim Scott (clear direct tone with care)
3. Josh Braun (low-pressure response design)
4. Solo executive coach operator (admin load, session prep, and client momentum)

Search-firm channel reviewers:

1. John McMahon (economic buyer logic)
2. John Barrows (trigger-led outbound relevance)
3. April Dunford (positioning clarity in context)
4. Retained search partner (mandate economics, first-touch quality, and shortlist credibility)

Outplacement channel reviewers:

1. John McMahon (program economics and buyer consequence)
2. Adam Grant (evidence quality and caveat discipline)
3. Annie Duke (reversible decisions and risk clarity)
4. Outplacement program director (cohort consistency, counselor workflow, and client confidence)

## Missing-Coverage Gaps Closed On 2026-05-27

The earlier reviewer set was strong on clarity and persuasion, but it still blurred the actual cold-email reader in each channel. The new roles above close the largest gaps:

1. Executives needed a time-compressed, recovery-minded reader lens, not just an abstract readiness lens.
2. Coaches needed an operator lens that cares about prep drag, session flow, and client momentum.
3. Search firms needed a retained partner lens that judges mandate economics and shortlist quality.
4. Outplacement needed a program director lens that judges consistency, counselor load, and cohort confidence.

## Cold-Email Open Principles By Reader Type

These are the first principles the council uses when deciding whether to open a cold email:

1. The subject line must promise a concrete reader benefit, not a product category.
2. The first sentence must prove the email was written for my role and moment.
3. The value has to be visible before I do any interpretation.
4. The ask must be binary, small, and easy to decline.
5. The proof must be short, credible, and caveated.
6. The email should reduce work, risk, or uncertainty for me right now.
7. If the value is vague, I assume the sender is optimizing for themselves.

## Template Effectiveness Feedback (Current Live Initials)

### Executives Initial

Persona feedback:

1. Claudio: readiness framing is relevant, but wording is still abstract in places.
2. Anne: credibility improved, but medium-frequency phrasing still slows comprehension.
3. Annie: decision line is clear; outcome path is not concrete enough.

Scores:

- Open (O): 0.71
- Understand (U): 0.58
- Reply (R): 0.62
- Product lift (P): 0.55
- EJES: 61

Verdict:

- Not doing the job yet. Clarity bottleneck dominates.

### Coaches Initial

Persona feedback:

1. Octavia: pain is real, but phrasing is process-heavy and mentally dense.
2. Kim: respectful tone, but too many abstract nouns per paragraph.
3. Josh: yes or pass works, but message asks for too much interpretation.

Scores:

- Open (O): 0.69
- Understand (U): 0.52
- Reply (R): 0.57
- Product lift (P): 0.51
- EJES: 57

Verdict:

- Fails job due to readability and cognitive load.

### Search-Firm Initial

Persona feedback:

1. McMahon: buyer economics are present and relevant.
2. Barrows: trigger is better, but still generic enough to look templated.
3. Dunford: positioning signal exists, but category contrast is still weak.

Scores:

- Open (O): 0.74
- Understand (U): 0.63
- Reply (R): 0.64
- Product lift (P): 0.60
- EJES: 65

Verdict:

- Borderline. Better than others, but still below confident send quality.

### Outplacement Initial

Persona feedback:

1. McMahon: consequence is clearer, but message remains paragraph-dense.
2. Grant: evidence line is responsible, but proof-to-ask distance is too long.
3. Annie: decision framing is useful, but choice still feels heavy to process.

Scores:

- Open (O): 0.67
- Understand (U): 0.54
- Reply (R): 0.56
- Product lift (P): 0.53
- EJES: 57

Verdict:

- Not doing the job yet. Understand is the blocker.

## Diagnostic Summary

Primary failure mode:

1. Too many medium-frequency words and abstract phrases per paragraph.
2. Sentence length and conceptual density require rereading.
3. Reader must infer practical value instead of seeing it instantly.

Consequence chain:

1. Open can be acceptable.
2. Understand falls below threshold.
3. Reply and product lift collapse downstream.

## Construction Rules Required To Raise EJES

Language rules:

1. Use concrete words over abstract nouns.
2. Keep average sentence length between 10 and 16 words.
3. One idea per sentence.
4. Remove stacked qualifiers and passive framing.

Structure rules:

1. Paragraph 1: plain-language pain in one line.
2. Paragraph 2: one decision in one line.
3. Paragraph 3: one proof line with caveat.
4. Paragraph 4: one binary ask with one asset.

Cognitive-load rules:

1. Maximum four short paragraphs before sign-off.
2. No paragraph above two lines in normal viewport.
3. No more than one medium-frequency phrase per paragraph.
4. Reader should restate the ask in under five seconds.

## Channel Targets For Next Rewrite

1. Executives: raise Understand from 0.58 to at least 0.72.
2. Coaches: raise Understand from 0.52 to at least 0.74.
3. Search firms: raise Understand from 0.63 to at least 0.72.
4. Outplacement: raise Understand from 0.54 to at least 0.72.

Expected EJES after rewrite if targets are met:

1. Executives: 76 to 80
2. Coaches: 75 to 79
3. Search firms: 77 to 82
4. Outplacement: 74 to 79

## Bottom Line

Current versions improved structure but still miss the clarity bar.

Using your job definition, only search-firm is near acceptable, and none are confidently strong.

The next rewrite should optimize immediate comprehension first, then persuasion.
