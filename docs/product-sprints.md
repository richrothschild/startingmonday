# Starting Monday: Sprint Plan (Sprints 8-15)

**Goal:** Move every product dimension from current grade to A or A- through targeted, sequenced sprints.  
**Date created:** 2026-05-07  
**Sequencing logic:** Impact-to-effort ratio, not arbitrary order. Fix the product before the channel.

---

## Grade Baseline and Targets

| Dimension | Current | Target | Primary blocker |
|---|---|---|---|
| Core value proposition | A- | A | Briefing depth; proof points |
| Onboarding | C+ | A- | No guided moment; blank state; no progress signal |
| AI content quality | B+ | A- | Degrades badly with thin profiles |
| Pipeline UX | B+ | A- | Outreach workflow breaks at copy-paste |
| Mobile experience | B | B+ | Touch targets; form friction |
| Differentiation from raw AI | B- | B+ | Platform context is invisible to user |
| Distribution strategy | C | B | No referral loop; no SEO; channels unclear |
| B2B readiness | C+ | B+ | No pricing page; no seat management; collateral thin |

> Distribution will not reach A through sprints alone. It reaches A through traction. The sprints build the infrastructure for traction.

---

## Sprint 8: Onboarding Overhaul

**Drives:** Onboarding C+ to B+

The first session has to deliver a win before the user leaves. Right now it does not.

### Deliverables

- **Profile progress bar.** Shows sections complete out of 5: Identity, Targets, Resume, Positioning, Briefing settings.
- **Inactivity nudge.** Sticky prompt appears after 90 seconds of no interaction on the profile page. "Save and continue" copy. Prevents abandonment mid-form.
- **Dashboard activation checklist card.** Visible until all 5 steps are done:
  1. Set your role type
  2. Add a target company
  3. Add your resume
  4. Generate your first brief
  5. Set your briefing schedule
- **Empty state copy for every dashboard section.** Each blank panel explains what belongs there and why. "Your pipeline lives here. Add a company to start tracking." Not blank boxes.

---

## Sprint 9: First-Win Flow

**Drives:** Onboarding B+ to A-; AI content quality B+ to A-

The user needs to see what "good" looks like in the first session. Right now they cannot see it until the profile is substantially complete.

### Deliverables

- **Auto-prompt after first company add.** Do not make them find the brief button. Redirect them immediately to generate a prep brief for the company they just added.
- **"Draft quality preview" on thin profiles.** On the outreach page when the profile is under 50% complete: show what the draft looks like now vs. what it will look like with a full profile. Use the demo user's data for the complete side.
- **Profile completeness score on dashboard.** 0 to 100 integer, not a letter grade. Clicking it takes them to the next incomplete section, not the top of the profile page.
- **Quick profile shortcut.** A condensed 3-field form: name, current title, one-line positioning. Completing it unlocks a basic brief immediately. Full profile unlocks full brief quality. Reduces time-to-first-value from 20 minutes to 3.

---

## Sprint 10: Make the AI Feel Personal, Not Generic

**Drives:** Differentiation from raw AI B- to B+; AI content quality A-

The platform knows things about the user that ChatGPT never will. That context needs to be visible in the output, not hidden behind the curtain.

### Deliverables

- **"What informed this draft" callout.** Small expandable section beneath every outreach draft listing 3 to 4 data points used: "Your background as CIO, your contact's VP Engineering role at [company], your stated goal of requesting a call." This is what a blank AI window cannot do.
- **"Personalized for your background" section in prep briefs.** Explicitly connects this company's known challenges to the user's specific experience. "You led a cloud migration at [prior company]. This company is mid-migration."
- **Low-profile warning banner.** If profile score is below 50%: outreach and prep output shows a yellow inline banner. "This brief used limited profile data. Add your resume for full depth." Link goes directly to the resume field, not the top of the profile page.
- **Brief rating on every AI output.** Feed low ratings into a review log for manual inspection. Identifies which output types are failing in production.

---

## Sprint 11: Fix the Outreach Copy-Paste Gap

**Drives:** Pipeline UX B+ to A-

Every step between "I have a draft" and "I sent it" is a churn moment. There are currently too many steps.

### Deliverables

- **Post-copy inline prompt.** After the user copies a draft, an inline prompt slides in: "Paste this into LinkedIn or email, then mark it sent here." Two buttons: Mark as Sent and Remind me later (sets a 24-hour follow-up task).
- **"Open LinkedIn" button.** On the outreach page, for any contact with a LinkedIn URL on file, a button opens their profile in a new tab. Removes one manual search step.
- **"Draft email" button.** Opens a `mailto:` link with the subject pre-filled as "Introduction" and the body pre-filled with the outreach draft. Works without any email integration.
- **Auto follow-up on Mark as Sent.** Confirmation action creates a follow-up task automatically: "Follow up with [name] in 5 days." User can adjust the date or delete it. No extra clicks required.

---

## Sprint 12: Profile Save and Data Trust

**Drives:** Addresses the privacy objection; supports B2B readiness

The privacy objection ("I do not want my resume in an AI system") has no answer in the product right now. It needs one.

### Deliverables

- **Data policy card on the profile page.** Not a link to a legal page. An actual readable statement in four plain sentences: "Your resume and career notes are stored only in your account. They are used only to generate your briefs. They are never used to train AI models. You can delete them at any time."
- **"Delete all sensitive data" made more visible.** Move it out of the page bottom and into a dedicated, clearly labeled section with a plain-language explanation of what it deletes and what it does not.
- **Data export.** One button that downloads a JSON file of everything the platform stores about the user. Executives in regulated industries will ask for this. Having it builds trust even if they never click it.
- **"Last updated" timestamp on profile.** Shows when profile data was last saved. Signals freshness and control.

---

## Sprint 13: B2B Readiness

**Drives:** B2B readiness C+ to B+

Right now a CHRO or relocation VP who looks up Starting Monday after a conversation finds a product built for individual users. There is no signal that the company sells to businesses.

### Deliverables

- **Public pricing page at `/pricing`.** Shows Monitor ($49/mo) and Active ($129/mo). Includes a "Teams and enterprise" row with a "Contact us" CTA. Short. No feature matrix overload.
- **Partner inquiry page at `/partners`.** Brief description of partnership types: relocation firms, outplacement, executive coaches, search firms. Single form: name, company, role, how they heard about Starting Monday, what they are interested in. Routes to email.
- **Basic multi-seat flow.** Admin invites a user by email. Invited user signs up under the account. Admin sees activation status per seat: profile complete, first company added, first brief generated. Nothing fancier than this for now.
- **Invoice-ready receipts.** Stripe receipt emails include company name and address fields that enterprise buyers need for expense reimbursement. Native Stripe feature, minimal build effort.

---

## Sprint 14: Referral Loop

**Drives:** Distribution C to B

Word of mouth is the only distribution channel that works at this user level without paid acquisition. Build the infrastructure now.

### Deliverables

- **Referral program.** Each user gets a unique link. Anyone who signs up through that link gets their first month free. The referring user gets a free month when their referral converts to paid. No points system.
- **Referral card on dashboard.** "Know someone in a search? Give them a month free. You get one too." Visible but not intrusive. Appears after the user has been active for 7 days.
- **Post-signup email sequence.** Written first, automated in Sprint 15:
  - Day 1: What to do in your first session
  - Day 3: Did you add your first company?
  - Day 7: Your first week summary and what to do next
  - Day 14: What users who land interviews do in week two
- **"Share a milestone" card.** When a user marks a company as In Process or schedules an interview, offer a LinkedIn share card. Simple graphic: "Running a structured search with Starting Monday." Opt-in, not automatic.

---

## Sprint 15: Mobile Polish

**Drives:** Mobile experience B to B+

Lower priority than the product gaps above. Fix the product first, then the mobile experience.

### Deliverables

- **Pipeline stage change from mobile.** Tap a company card to change its stage without opening the full detail page.
- **Copy button on mobile.** Larger tap target. Clear "Copied" confirmation. Haptic feedback where supported.
- **Profile form on mobile.** Each section collapses. User taps to expand and fill. Prevents scroll fatigue on a form that is currently very long on a small screen.
- **Bottom nav regression check.** Confirm all five tabs work correctly on iOS Safari after the safe area fix. Tap targets confirmed at minimum 44px.

---

## Grade Trajectory by Sprint

| Sprint | Onboarding | AI Quality | Pipeline UX | Differentiation | B2B | Distribution | Mobile |
|---|---|---|---|---|---|---|---|
| Now | C+ | B+ | B+ | B- | C+ | C | B |
| After 8 | B | B+ | B+ | B- | C+ | C | B |
| After 9 | B+ | A- | B+ | B- | C+ | C | B |
| After 10 | B+ | A- | B+ | B+ | C+ | C | B |
| After 11 | A- | A- | A- | B+ | C+ | C | B |
| After 12 | A- | A- | A- | B+ | B | C | B |
| After 13 | A- | A- | A- | B+ | B+ | B- | B |
| After 14 | A- | A- | A- | B+ | B+ | B | B |
| After 15 | A- | A- | A- | B+ | B+ | B | B+ |

---

## What Gets You to A on Distribution

Distribution does not reach A through product sprints. It reaches A when one of these happens:

- A podcast or newsletter with executive-level reach mentions Starting Monday and converts at scale (Manager Tools is the clearest near-term candidate)
- A B2B deal brings 30 or more seats at once and those users become advocates
- A referral network compounds to the point where new users are arriving faster than old users churn
- Organic search starts driving inbound from executives actively Googling job search tools

The sprints build the mechanism. The market provides the fuel.
