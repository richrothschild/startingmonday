# Sprint Backlog

Active and planned sprints for Starting Monday. Sprints are 2 weeks. Owner is Chris Goodwin unless noted.

---

## Active

| Sprint | Dates | Theme | File |
|---|---|---|---|
| Sprint 1 | May 13 - May 23 | Foundation + Activation Framework | [sprint-01.md](sprint-01.md) |
| Sprint 2 | May 26 - Jun 6 | Email Lifecycle + Admin Dashboard | [sprint-02.md](sprint-02.md) |

---

## Upcoming (Planned)

| Sprint | Dates | Theme |
|---|---|---|
| Sprint 3 | Jun 9 - Jun 20 | Referral Program + Alumni Mode foundation |
| Sprint 4 | Jun 23 - Jul 4 | Outplacement pitch + partner portal design |
| Sprint 5 | Jul 7 - Jul 18 | Executive tier features (salary intelligence, recruiter tracker) |

---

## Sprint 3 Preview: Referral and Alumni Foundation

- In-app referral link generation + tracking (link back to the offer-acceptance email, already live)
- "I accepted an offer" flow — move user to a celebration + offboarding state
- Alumni plan: $0 or $19/month, retains 5-company monitoring and briefing archive
- A/B test: $0 vs $19 for alumni price

---

## Sprint 4 Preview: Outplacement

- Outplacement partner pitch one-pager (internal, for Rich's sales calls)
- White-label landing page prototype for a partner firm
- Bulk seat provisioning logic (admin creates N trial accounts for a partner batch)
- Partner portal: usage dashboard for the partner firm (seats used, activation rates)

---

## Sprint 5 Preview: Executive Tier

- Salary intelligence (comp data for target roles, from public sources)
- Recruiter tracker (search firm + partner name, track relationship history, group by firm)
- Unlimited pipeline for Executive tier users
- Opus model routing for Executive tier brief generation (already in architecture, needs feature flag wiring)

---

## Backlog (Unscheduled)

See `docs/backlog.md` for the full list of validated ideas not yet scheduled. Key items:

- `company_watch_events` table (Phase 1 data product sprint)
- Admin analytics page — event volume, signal-to-action rates
- "Regenerate section" in prep brief (moved to Sprint 2)
- Blog syndication to LinkedIn Articles (Rich owns execution; Chris can automate)
- Playwright E2E coverage expansion (currently smoke tests only)
- Test coverage expansion (Vitest — currently 44 tests, target 120+)

---

## Weekly Review

Tuesday 8am PT — Rich and Chris sync via Google Meet. Agenda:

1. What shipped last week (5 min)
2. Any blockers or questions (5 min)
3. Priority for this week (10 min)
4. Any product direction changes from Rich's customer conversations (5 min)

Keep it to 30 minutes. Come with specifics.
