# Starting Monday — Ideas Backlog

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: weekly
Source of truth: yes

### Reviewed 2026-05-03. Items below are not scheduled. Revisit at each planning cycle.

---

## Brief Quality and Content

**Career Options Brief**
A new brief type separate from interview prep: given the candidate's background, what are 4–5 distinct paths they could credibly pursue? For each: realistic demand, salary range, what they'd need to get there, and whether it's a lateral or a stretch. Useful for candidates who aren't yet sure what they're targeting. Differentiates Starting Monday from pure interview-prep tools.

**Skills Gap Analysis**
For a given target role or company, identify gaps between the candidate's background and what the role likely requires. Suggest specific ways to close each gap before the interview. Could be a section of the prep brief or a standalone brief type.

**Salary and Compensation Benchmarking**
Given role type, sector, geography, and level, provide a realistic comp range with notes on how to approach the negotiation. Include: base vs. bonus vs. equity expectations by company stage, and what levers to push at this level. Source: use Claude's training data + explicit caveats about staleness.

**Objection Management Library**
A user-built (or Claude-suggested) library of the specific objections they face repeatedly. Each entry: the objection verbatim, their current counter, and Claude's suggested refinement. Acts as a living prep tool they improve over time. Could live on the profile page.

**BLUF for All Content Types**
Extend the Bottom Line section beyond briefs to: daily briefing emails, chat responses, scan result summaries. Any time Starting Monday generates a long output, lead with a 2–3 sentence executive summary.

---

## Discovery and Pipeline

**Glassdoor / Company Intelligence Integration**
On the company detail page, surface Glassdoor rating, recent review themes, and CEO approval. Requires Glassdoor API or scraping workaround. Phase 3 after scan infrastructure is stable.

**Psychological / Communication Style Profile**
After onboarding, offer an optional 10-question self-assessment that classifies the user's communication style (D/I/S/C or similar). Use this to personalize the tone of outreach drafts and interview prep — e.g., "you tend to over-explain; in this room, cut to the decision." Not a full DiSC integration, just a simple heuristic layer.

**User Scoring for Recruiter Matching**
Allow users to opt into an anonymized profile that executive search firms can query. Build a matching layer where recruiters can describe what they're looking for and Starting Monday surfaces candidates who fit. Requires recruiter-side product (Phase 4+).

---

## Engagement and Retention

**Daily Email Action Plan**
Each morning, send a structured action plan email: 2–3 specific actions to take today based on pipeline stage, pending follow-ups, and scan results. Different from the current daily briefing (which summarizes pipeline state) — this is a task list with context. One-click done from email.

**"How to Think About Your Search" Feature**
A standalone resource section (or pop-up on first login) with a short framework: how senior searches actually work, what pace is realistic, how to think about network vs. applications vs. recruiters, how to manage mental load. Positioning for Starting Monday as the authoritative source of truth, not just a tool.

**Coaching Resources Section**
A curated resource library: articles, frameworks, and exercises for executives in search. Lightweight content marketing play. Could include Starting Monday-authored pieces on specific topics (the first 90 days, how to handle the gap question, etc.).

**Calendar Integration**
Connect to Google/Outlook calendar to:
- Auto-create prep reminders 48h before tracked interviews
- Suggest follow-up deadlines based on stage changes
- Detect interview patterns and surface prep brief at the right moment

---

## Quality and Infrastructure

**E2E Test Suite with Synthetic Personas**
Build 3–4 synthetic user profiles (CIO in active search, VP pivoting to consulting, etc.) and run automated end-to-end tests that simulate the full flow: onboarding, company add, strategy brief generation, prep brief generation. Verify output quality heuristics (length, sections present, no em dashes). Makes regressions in AI output visible before users hit them.

**Cognitive Load Testing**
Structured usability review: have 5 real users narrate their experience using the product for the first time. Identify where they stall, what they misunderstand, and what language confuses them. Particularly: onboarding form, strategy brief, and the Day 1 action plan.

---

## Notes

- "Emotional triggers on landing page" from the original brainstorm: the landing page already has the SITUATIONS self-selection grid. Any additional emotional copy improvements should go through the copywriting guidelines in `writing-guidelines.md`.
- Immediate scan on company add was already implemented before the May 2026 planning session.
