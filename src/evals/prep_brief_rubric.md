# Prep Brief Rubric v1

**Status:** Draft - not yet validated against labeled traces
**Beachhead feature:** prep_brief
**Last updated:** 2026-05-08

---

## How to use this rubric

Open a trace in `/dashboard/admin/traces`. Read the output. Apply each check independently. A brief PASSES only if all 6 checks are true. No partial credit.

Mark the trace Pass in the trace viewer if all 6 pass. Mark Fail if any single check fails. Write the failing check(s) in the notes field - this is the open coding step.

---

## Binary Checks

**[ ] company_context**
The brief includes at least 2 specific facts about this company that are not derivable from the job title alone. Generic statements like "they are a growing tech company" do not count. Specific statements like "they announced a Series C in Q4 2025 to expand their mid-market segment" do count.

**[ ] role_fit**
The brief connects at least 1 specific element of the executive's background to this role or company. "You have relevant experience" does not count. "Your prior transformation at [Company X] maps directly to their stated initiative to consolidate their data infrastructure" does count.

**[ ] questions_tailored**
At least 3 of the suggested questions are specific to this company or this candidate's situation. "Tell me about a time you led a team" does not count. "How is the board framing the ROI expectation for this transformation, given the 18-month timeline you mentioned in the announcement?" does count.

**[ ] format_correct**
The brief includes all required sections: Bottom Line, The Situation, Win Thesis, The Narrative, Anticipated Pushback, Likely Questions, Talking Points, Questions to Ask, First 90 Days Signal, What to Leave Out, How to Close, Reading the Room. Section headers are present with ## format.

**[ ] tone_executive**
The voice is peer-level. The brief reads as if written by a senior executive coach speaking to another senior executive, not as advice to a junior employee. Phrases like "here are some helpful tips," "you should consider," or "this is a great opportunity" are automatic failures.

**[ ] no_factual_errors**
No claim in the brief is identifiably wrong based on available information. This check only applies to claims you can verify - if you cannot verify a claim, do not mark it as wrong. Common failure: inventing specific revenue figures, headcount, or product names not present in the input data.

---

## Failure Taxonomy (from open coding - update as you find new patterns)

| Category | Description | Example failure |
| --- | --- | --- |
| `company_context_thin` | Generic company description, misses specific business model or recent events | "Company X is a technology leader in their space" |
| `role_fit_not_established` | No connection between candidate's background and this specific role | Win Thesis reads like a generic cover letter |
| `questions_too_generic` | Questions could apply to any company or any exec | "What does success look like in the first 90 days?" |
| `format_off` | Missing sections or broken section structure | No "Reading the Room" section |
| `tone_wrong` | Junior register, motivational language, or hedging | "This is a great opportunity for you" |
| `factual_error` | Specific claim is demonstrably wrong | Wrong headcount, nonexistent product name |
| `missing_context_not_flagged` | Profile is thin but brief pretends it is not | Full brief generated from empty resume without noting the limitation |
| `competitive_framing_missed` | Company notes mention competing candidates but brief ignores this | No adjustment to Win Thesis when internal candidate is noted |

---

## Optimization log

| Date | Change | Before (fail rate) | After (fail rate) | Notes |
| --- | --- | --- | --- | --- |
| - | Rubric created | - | - | Not yet validated |

---

*Build the golden set in `src/evals/prep_brief_golden_set.json` after 50+ labeled traces.*
