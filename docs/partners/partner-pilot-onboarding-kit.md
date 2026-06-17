# Partner Pilot Onboarding Kit

**Purpose:** Operationalize every pilot launch with consistent checkpoints, clear pass/fail gates, and a structured path to conversion decision.

**Scope:** Applies to Solo, Boutique, and Outplacement tier pilots. All pilots default to 8-week term at 50% base fee unless contract specifies otherwise.

---

## Pilot Start Checklist (Day 0–2)

Complete before the kickoff call. Items marked `[Required]` must be true to start the pilot.

### Partner readiness
- [ ] [Required] Contract signed with explicit no-custom pilot boundary
- [ ] [Required] Partner workspace created and linked to account (`partners` table, `user_id` set)
- [ ] [Required] White-label settings configured: brand name, track, tier, support email
- [ ] [Required] At least one `firm_admin` role assigned
- [ ] Program settings configured: default program, sponsor template variant, weekly summary day
- [ ] Cohort naming prefix set (e.g. "NTG-Q3")

### Participant readiness
- [ ] [Required] Participant list confirmed (min 5 for boutique/outplacement pilots)
- [ ] Participant invite emails staged in `/api/team/invite` (bulk or single)
- [ ] Counselor/cohort assignments defined

### Kickoff call agenda set
- [ ] Pilot scope and success criteria reviewed with partner
- [ ] No-custom boundary explicitly acknowledged
- [ ] Weekly check-in cadence confirmed (default: Fridays)

---

## Week 1 Checkpoint (Day 7)

Review with partner contact. Target: early signal on participant activation.

**Threshold:** ≥ 50% of invited participants have completed onboarding activation (`activation_complete` event emitted).

| Check | Source | Pass |
|---|---|---|
| Activation rate | `/api/partner/outcome-events?eventType=activation_complete` | ≥ 50% of invited |
| At least one weekly loop started | `/api/partner/weekly-loop` | ≥ 1 participant |
| No platform blockers reported | Support inbox | Zero open P1 issues |
| Counselor has used session snapshot | `/api/coach/client/[id]/session-snapshot` | ≥ 1 call |

**If activation < 30%:** escalate. Review invite delivery, onboarding friction, and participant communication. Do not auto-proceed without explicit partner acknowledgment.

---

## Midpoint Review (Day 28–30)

Conducted with partner program lead. Used as input for the day-30 closeout packet decision gate.

**Source data:**
- Firm-admin cohort dashboard for activation + stall rate
- `/api/partner/outcome-events` for weekly_loop_complete, session_prep_viewed
- Sponsor export for KPI trends

| Metric | Target |
|---|---|
| 7-day activation rate | ≥ 60% |
| Weekly loop completion (among active) | ≥ 40% |
| Counselor pre-session snapshot views | ≥ 1 per participant per 2 weeks |
| Overdue action rate | ≤ 30% of open actions |

**Decision options at midpoint:**
- Continue → standard progression to day-60 closeout
- Tune → agree 1–2 specific interventions; re-review at day-45
- Stop → begin wind-down; initiate refund per contract

---

## Week 6–7 Closeout Prep

Pull final data for the closeout packet. Reference `docs/partners/pilot-closeout-packet-template.md`.

**Data to collect:**
- Final activation rate (total unique `activation_complete` events / total invited)
- Weekly loop completion rate (week 4–6 average)
- Pipeline advance rate: `interview_stage_advance` events / total participants
- Offer recorded rate: `offer_recorded` events / total participants
- Counselor NPS (optional survey)
- Partner admin NPS (optional survey)

**Required artifacts for closeout packet:**
- Completed closeout template with all KPI fields filled
- Partner signoff (email or in-product confirmation)
- Renewal recommendation (continue / modify / stop) with rationale

---

## Pilot-to-Paid Decision Flow

```
Pilot complete (week 8)
    │
    ├── Pass gate? (activation ≥ 60%, loop completion ≥ 50%)
    │       │
    │       ├── YES → Present standard contract
    │       │           ├── Offer annual prepay (12% discount)
    │       │           └── Confirm tier (Solo / Boutique / Outplacement)
    │       │
    │       └── NO (one metric) → Offer 4-week extension at 50% base
    │                               └── If miss after extension → close pilot
    │
    └── Partner requests changes? → Apply no-custom pilot policy
                                     ├── Configuration changes → OK
                                     └── Feature requests → Queue for roadmap review
```

---

## Published Artifacts Required Before Scaled Outreach

- [ ] `docs/partners/pilot-closeout-packet-template.md` — complete
- [ ] `docs/partners/expansion-packet-template.md` — complete
- [ ] `docs/partners/partner-pilot-onboarding-kit.md` — this document
- [ ] `/for-outplacement/trust-pack` — published
- [ ] `/for-outplacement/metric-dictionary` — published
- [ ] At least two case studies approved (named or permissioned) before GTM acceleration

---

## Contacts and Handoff

| Role | Responsibility |
|---|---|
| Partnerships Lead | Contract, kickoff call, week-1 check-in |
| Engineering Lead | Platform blockers, data access, audit event visibility |
| Product Lead | Trust pack questions, feature boundary calls |
| Growth Lead | Case study capture, expansion conversation |
