# Coach Outreach Messages — Sales Navigator Campaign

**Purpose:** Ready-to-use message templates for Sales Navigator coach targeting (1-10 person firms, posted last 30 days, active on LinkedIn)

**Execution Owner:** Rich  
**Quality Auditor:** Liz  
**Target Volume:** 10–15 new connections per day  
**Success Benchmarks:** 40–60% connection rate | 15–20% response rate | 25–35% demo-to-signup conversion  

---

## Message Sequence Overview

| Day | Message | Context | If |
|-----|---------|---------|-----|
| **0** | Cold Connection Request | LinkedIn connection note | Initial outreach |
| **0–1** | Follow-Up (post-acceptance) | LinkedIn DM or Email | Connection accepted same day |
| **3** | Check-In Demo Offer | LinkedIn DM or Email | No response to Day 0 |
| **7** | Final Touch | LinkedIn DM or Email | No response to Day 3 |

---

## MESSAGE 1: Cold Connection Request

**Where:** LinkedIn Sales Navigator connection note field  
**Length:** 250 characters max  
**Tone:** Persuasive, peer-to-peer, high-value ask (15 minutes)  
**Principle:** Leverage reciprocity and authority; highlight unique value.

### Base Template
```
[Name] — noticed your expertise on [specific coaching topic]. Built a platform coaches trust to deliver high-impact results (pipeline visibility, prep briefs, momentum tracking). Let’s explore if it aligns—15 minutes?
```

### Persona Variants

**Career Transition Specialist**
```
[Name] — your insights on transition coaching stood out. Built a tool that accelerates client transitions while saving you hours on research. Let’s connect for 15 minutes?
```

**VP-to-CXO Positioning Coach**
```
[Name] — your focus on executive positioning is impressive. Built a platform that ensures clients maintain momentum across 12–24 months. Worth a quick 15-minute chat?
```

**Executive Search Firm Coach**
```
[Name] — your approach to interview prep caught my eye. Built a tool that gives you real-time visibility into client pipelines. Let’s discuss—15 minutes?
```

**Board & Governance Coach**
```
[Name] — noticed your work with board-seeking executives. Built a platform that tracks 50+ governance opportunities tailored to your clients. Let’s connect for 15 minutes?
```

---

## MESSAGE 2: Follow-Up (Post-Acceptance)

**Where:** LinkedIn Direct Message or Email  
**Length:** 300 characters max  
**Tone:** Warm, value-driven, and action-oriented  
**Principle:** Build on initial connection; emphasize mutual benefit.

### Template
```
[Name], thanks for connecting! Coaches using our platform report faster client transitions and deeper engagement. Would love to show you how it works—15 minutes this week?
```

---

## MESSAGE 3: Check-In Demo Offer

**Where:** LinkedIn Direct Message or Email  
**Length:** 300 characters max  
**Tone:** Persistent but respectful; emphasize exclusivity  
**Principle:** Create urgency; highlight unique outcomes.

### Template
```
Hi [Name], following up to see if you’d like to explore our platform. Coaches say it’s a game-changer for client momentum and visibility. Let’s find 15 minutes this week?
```

---

## MESSAGE 4: Final Touch

**Where:** LinkedIn Direct Message or Email  
**Length:** 250 characters max  
**Tone:** Polite, final opportunity  
**Principle:** Leave the door open for future engagement.

### Template
```
Hi [Name], I know timing is everything. If now isn’t the right moment, no problem—just let me know. Coaches often revisit us when they’re ready to scale client impact. Wishing you continued success!
```

### Alternative (If New Signal Available)
```
Saw you were recently interviewed on [publication] about [topic] — that’s exactly the kind of coaching we support. Happy to share a quick demo if you’re open to it. If not, no problem.

[Video link]
```

### Notes
- Use alternative only if you have a NEW signal (different publication, recent move, etc.)
- If using alternative, reset the sequence (don’t send base Day 7 after this)
- Otherwise, use base template to close door gracefully

---

## Implementation Guide

### For Rich (Message Execution)

**Daily Workflow:**
1. Open Sales Navigator → filter for coaches (1–10 employees, posted last 30 days, active)
2. Identify 10–15 high-signal targets for the day
3. For each target:
   - Pick variant matching their coaching niche (career, VP-to-CXO, search, board)
   - Add one personal detail from their profile/post to connection note
   - Record in Google Sheet: [Date | Name | Firm | Variant Used | Connection Request Sent]
4. Monitor for Day 0 acceptances → send Day 0–1 follow-up immediately
5. Track Day 3 and Day 7 follow-ups based on initial date

**Message Personalization Rules:**
- One specific reason (saw post on X, noticed you work with Y, etc.) — NOT generic
- Always use "15 minutes" — specific ask is critical
- Coach benefit FIRST (leverage, momentum, visibility) before feature mention
- Voice should read like one person talking to a peer, not a template

**Demo Link Preference:**
- **Option A:** Calendly link (Rich's calendar for 15-min calls) — higher friction but real conversation
- **Option B:** 5-minute video demo (Loom or similar) — lower friction, shows the product
- Recommend: Use Calendly for Day 0–1, Loom video for Day 3–7 check-ins

**Tracking Sheet Columns:**
- Date Sent | Target Name | Firm | Coach Type | Message Variant | Connection Status | Response | Demo Scheduled | Signed Up | Commission Rate

### For Liz (Response Auditing)

**Weekly Audit (Every Friday):**
1. Pull data from outreach tracking sheet
2. Calculate: connection acceptance rate (target 40–60%), response rate (target 15–20%)
3. Flag if rates fall below target range → indicates messaging needs refinement
4. Log any new objections not covered in appendix
5. Verify commission tracking: each signed coach → 20% rate in `partners` table

**Common Response Patterns to Watch:**
- "Looks interesting but timing isn't right" → Objection #4 (manual workaround) + Objection #5 (pricing concern)
- "How do you differ from LinkedIn?" → Objection #3 (need signal advantage explanation)
- "My clients don't job search actively" → Objection #1 (show success metrics)
- Radio silence (most common) → Day 3 video demo typically highest conversion trigger

**Red Flags (trigger message refinement):**
- Connection rate < 40% → Reposition cold ask or targeting criteria
- Response rate < 15% → Follow-up messages feel too salesy or unclear
- Demo-to-signup < 25% → Demo content or product positioning needs work

**Objection Reference:**
See `docs/outreach-playbook.md` Appendix: Coach Channel Objections (5 pushbacks + rebuttals)

### For Both: Escalation & Iteration

**If New Objection Appears:**
1. Document exact pushback from coach response
2. Add to Google Sheet with "New Objection" flag
3. Propose rebuttal (apply playbook principles: data, peer framing, leverage language)
4. Test rebuttal in next 2–3 similar conversations
5. If effective, add to appendix

**If Response Rate Drops Below 15%:**
1. Review last 10 messages for tone/specificity
2. A/B test: Day 3 check-in with video demo vs. without
3. Shift variant distribution (if search coaches converting better, increase volume)
4. Revisit cold connection note personalization

---

## Success Metrics & Targets

| Metric | Target | Frequency | Owner |
|--------|--------|-----------|-------|
| Connection Acceptance Rate | 40–60% | Weekly | Liz audit |
| Response Rate (of acceptances) | 15–20% | Weekly | Liz audit |
| Demo Scheduled (of responses) | 60–75% | Weekly | Liz audit |
| Demo-to-Signup Conversion | 25–35% | Bi-weekly | Liz + Rich |
| New Coach Signups/Week | 1–2 | Weekly | Liz verification |
| Healthy Weekly Volume | 2–3 demos | Ongoing | Rich execution |

**Success State:** After 3–4 weeks, Rich and Liz should see 1–2 new coaches signing up per week, with commission flow to partners table verified bi-weekly.

---

## Quick Reference: Which Message When

- **Day 0 — Connection Sent:** Cold connection request (choose variant)
- **Day 0–1 — Connection Accepted:** Follow-up message (same variant family)
- **Day 3 — No Response:** Day 3 check-in (brief demo offer)
- **Day 7 — Still No Response:** Day 7 final touch (graceful exit or new signal)

**Edge Cases:**
- If they respond positively at ANY point → move to demo scheduling immediately (skip future day messages)
- If they respond with objection → reference playbook appendix + schedule call to discuss
- If new signal emerges (interview published, firm posted, etc.) → restart sequence with Day 7 alternative

---

## Files & References

- **Outreach Principles:** See `docs/outreach-playbook.md` for full coaching channel strategy
- **Objection Handling:** See `docs/outreach-playbook.md` Appendix for 5 common pushbacks + rebuttals
- **Partner Instructions:** See `docs/liz-coach-outreach-instructions.md` for operational playbook
- **Coach Landing Page:** `/for-coaches` (link to share in demos)
- **Commission Structure:** 20% recurring (per coach signup via partner link)

---

## Version & Updates

**Created:** May 13, 2026  
**Status:** Ready for Live Deployment  
**Last Updated:** [To be filled by Liz/Rich as messaging is refined]

**Update Log:**
- v1.0 (May 13): Initial four-message sequence with persona variants
- [Future iterations tracked here as A/B testing insights emerge]
