## Summary

- Describe what changed.
- Describe why this change is needed.

## Mobile Reliability (required)

- [ ] I reviewed mobile impact for this PR.
- [ ] I ran mobile guard checks.
- [ ] I ran mobile route or visual checks for affected pages.

### Mobile impact statement (required)

- Impact level: none | low | medium | high
- Affected mobile surfaces:
- Risk notes:

### Mobile route coverage (required)

List each affected route and the viewport coverage you verified.

| Route | iPhone | Android | Notes |
| --- | --- | --- | --- |
| /example | pass | pass | |

### Evidence links (required)

- CI run URL:
- Visual artifact URL (if UI changed):
- Lighthouse artifact URL (if performance-sensitive):

## Validation

- [ ] Build passes locally.
- [ ] Relevant tests pass.

## Marketing Trust and Proof (required for marketing surface changes)

- [ ] I verified trust language is present (privacy, confidentiality, or governance clarity).
- [ ] I verified proof language is present (source note, method note, or measurable evidence).
- [ ] I ran `npm run marketing:trust-proof:gate`.

## Executive Page Claim Quality (required when changing /for-* or /executives routes)

- [ ] No internal file paths appear in any user-visible proof or source text.
- [ ] Every major claim includes a denominator (e.g. "27 executives"), a time window (e.g. "Jan–May 2026"), and a method reference link or note.
- [ ] Absolute claims ("best", "most valuable", "always") are either removed or replaced with attributed/bounded forms.
- [ ] New or changed CTA labels describe the destination or action — not vague navigation (e.g. not "Open executive journey").
- [ ] Undefined technical or strategic terms are defined inline where first used.

## Non-Executive Landing Clarity (required when changing non-exec /for-* routes)

- [ ] Above the fold clearly states who this is for, what they get, and why now.
- [ ] A "This week" action block is present with 3 concrete first actions.
- [ ] Copy uses role-appropriate language and avoids executive-only framing on non-exec pages.
- [ ] Section count is constrained (no unnecessary long-form duplication or repeated proof blocks).
- [ ] At least one role-specific proof story is included with directional/source context.
