# Starting Monday — User Acquisition Sprint Plan
**Focus: First 10 paying users. May 9 through July 31, 2026.**
**Companion: sm-sprints.md (product + GTM integrated), sm-gtm-b2c.md, sm-gtm-b2b.md**

---

## What the Existing Plan Gets Right

The channel sequencing in sm-gtm-b2c.md is correct. The ICP is precise. The /optimize trigger-moment insight is smart. The B2B sequencing is patient in the right ways.

What it doesn't address: the next 10 days, personal network outreach, and execution specifics for LinkedIn content and the Wake Forest Zoom. This document fills those gaps and reframes the sprint work with acquisition as the primary objective.

---

## The Refined Strategy

Three insights drive the next 90 days:

**1. The fastest path to first users is your phone, not your content.**
Before any LinkedIn post drives a signup, you can text 15 people today who are in search or have been recently. Personal DMs from a founder convert at 40-60%. Content converts at 2-5%. Do the math on where to start.

**2. The Wake Forest Zoom is your highest-leverage event this month.**
One warm referral from a career center director can move 5-10 users. One satisfied user from that cohort becomes your first testimonial. That Zoom needs specific preparation, not good intentions.

**3. Measure trial-to-paid before doing anything else at scale.**
Every channel, every post, every DM is feeding trial signups. But if trial-to-paid conversion is below 30%, more trials don't fix the problem — they just increase the evidence that something in the product experience isn't working. The activation email drip is not a nice-to-have in Sprint A; it's the conversion lever.

---

## Pre-Sprint: This Week (May 9–16, ~15 hours)
**Theme: Launch Posture. Fix the landing. Start the content. Warm up the network.**

This is the work that happens before Sprint A formally begins May 19.

---

### Block 1 — Saturday-Sunday May 9-10 (4h): Fix the Front Door

**[ ] Confidentiality promise on landing page (2h)**
Four sentences, above the fold, plain language:
- What you store (search data, companies, contacts)
- What you never do (train AI on their data, share with employers)
- What happens when they cancel (data deleted on request)
- No link to ToS. The statement is the promise.

*Why now:* Every trial user who comes from the Wake Forest Zoom will check this. Persona 1 (active CIO in search) will not give you their resume without it.

**[ ] Update Stripe + landing page pricing (1h)**
- Active tier: raise to $199/month (decided May 8)
- Executive: add placeholder at $499/month (reflects executive positioning)
- Update landing page pricing section to match
- Update any email copy that references $129

**[ ] Test prep brief auto-start in production (30min)**
The aha moment (May 8 commit) is deployed. Log in as a new user, add a first company, confirm the orange banner appears and the brief generates automatically. If it doesn't work in production, fix it before inviting anyone.

**[ ] LinkedIn profile update (30min)**
- Headline: "Transformation CIO | Built the AI tool executive search needed | Starting Monday"
- Featured section: link to startingmonday.app and one strong data post (once it exists)
- About: lead with the search insight — "I ran a CIO search and couldn't find a tool that did what I needed. So I built it."

---

### Block 2 — Monday-Tuesday May 11-12 (5h): Personal Outreach

**[ ] Build the personal outreach list (1h)**
Write out every person you know who is currently in search, was in search in the last 18 months, or is employed and watching the market. Target: 20 names minimum. Categories:
- CIO/CTO/VP peers you've worked with directly
- People from your own search who were looking at the same time
- Former colleagues who've been RIF'd or restructured out
- Anyone you've had a "what are you doing next?" conversation with in the last year

**[ ] Send 10 personal outreach messages (3h)**
Not a mass email. Individual texts, LinkedIn DMs, or personal emails.

Template structure:
> "[Name] — built something you should know about. It's a daily briefing + company monitoring tool for senior tech executives in search — watches your target companies, generates prep briefs, tracks follow-ups. I built it because I needed it and it didn't exist. You're exactly who it's for. 30-day free trial, no card. [link] — would mean a lot to get your honest reaction."

Personalize the first sentence for each person. If you know they're actively looking, say so. If they landed recently, ask if they know someone still in search.

*Conversion target:* 40% of personal outreach converts to trial signups. 10 DMs → 4 trials. That's a better return than any content channel this week.

**[ ] Publish LinkedIn post 1 — Data post (1h)**
Topic: "We scanned [X] career pages this week. Here's what CIO hiring looks like right now."
Format:
- Line 1: specific hook ("The CIO job market has a tell. Here's what the data shows.")
- 4-5 findings from the scan data (pull actual numbers from the SM database)
- Call to action: "We scan 3x/week. [link] to see what's watching your target companies."

Post at 8-9am Monday. Stay online for 1 hour to reply to every comment.

---

### Block 3 — Wednesday-Thursday May 13-14 (4h): Wake Forest Prep

**[ ] Demo script for the May 18 Zoom (2h)**
Structure the call:
1. Open with their problem, not your product (2 min): "What's the biggest gap you see in how alumni prepare for senior searches?"
2. Show the product live (5 min): prep brief for a company relevant to their alumni. Let Claude stream. Don't narrate what's happening — let the brief land.
3. Show the daily briefing (3 min): what lands in their inbox every morning.
4. Ask the key question (2 min): "Would you be comfortable recommending this to alumni you personally know are in search?"
5. Leave-behind offer (1 min): "I'd like to give you 10 trial codes to share directly. No pitch to your alumni — just a tool recommendation, with your name on it."

Write this script. Practice it once out loud.

**[ ] Create 10 trial invite codes/links with Wake Forest attribution (1h)**
UTM: `utm_source=wake_forest&utm_medium=referral&utm_campaign=career_center`
If personalized codes aren't built yet, set up the UTM links in the existing signup flow.

**[ ] Prepare leave-behind email (30min)**
One clean email template you can send to the career center contact after the Zoom with:
- 3 sentences on what Starting Monday does
- 10 trial links (or a single generic link with UTM)
- "Share these with alumni you know are actively looking. If they find it useful, I'd appreciate hearing from them directly."

**[ ] Publish LinkedIn post 2 — Coaching post (30min)**
Topic: "The one email structure that gets a response from an executive recruiter."
Specific. Tested. From your own search experience.

---

### Block 4 — Friday May 15 (2h): Check and Close

**[ ] Review outreach: how many DMs went out? How many responded?**
If fewer than 5 responses from 10 DMs, follow up on the non-replies (one follow-up only).

**[ ] Verify /optimize end-to-end (30min)**
Run 3 real profiles through it. Review every output: is the critique specific? Would a CIO reading it feel like the tool knows the market? If anything is generic, note it for Sprint A.

**[ ] Publish LinkedIn post 3 — Behind the build (30min)**
Topic: "I spent 6 months in an executive search and couldn't find a tool that did what I needed."
Authentic. Personal. No marketing language. End with a question: "What did you find missing in your last search?"

**[ ] Weekly wrap: update the trial tracking spreadsheet**
Name, email, source (personal outreach / LinkedIn / /optimize), date, status (signed up / in trial / asked but not signed up).

---

### Pre-Sprint Success Criteria (by end of May 16)

- [ ] Confidentiality promise live on landing
- [ ] Stripe pricing updated to $179 Active / $349 Executive
- [ ] 10 personal DMs sent
- [ ] 3 LinkedIn posts published
- [ ] LinkedIn profile updated
- [ ] Wake Forest demo script written
- [ ] 10 trial codes ready to share
- [ ] Trial tracking spreadsheet started

---

## Sprint A (May 19 – Jun 1, ~22h)
**Theme: Conversion Infrastructure. Build the system that turns trials into paying users.**

The Wake Forest Zoom happens May 18, the day before Sprint A starts. Sprint A is where you process what you learn from it and build the infrastructure that will convert the next cohort of trial users.

### Product (12h)

**[M] Activation email drip — 6 emails via Resend (4h)**
This is the highest-leverage code you'll write in Sprint A. Without it, trial users go dark and you never know why.

| Day | Subject | Goal |
|-----|---------|------|
| 0 | "Your search starts now — here's where to begin" | Setup checklist + direct links |
| 3 | "Did you add your first company?" | Single CTA to company add |
| 5 | "Here's what your search looks like to a recruiter" | Profile completeness score + gap |
| 7 | "7 days left — here's what paying users did in their first week" | Social proof + urgency |
| 10 | "4 days left" | Single CTA to upgrade |
| 14 | "Your trial ends today" | Last chance — single upgrade CTA |

Each email: 3-4 sentences max. One CTA. Personalized with their name and company if added. No marketing language.

**[M] Trial user tracking dashboard (3h)**
Admin view showing: all trial users, source, trial start/end, onboarding_completed bool, companies_added count, briefs_generated count, upgrade status. This is how you know which users to prioritize for personal follow-up.

**[S] Scraper failure alerting (3h)**
Any company scan that returns 0 results 3 consecutive times: email alert fires within 1 hour. Silent failures are trust-killers for users who never know why their target companies aren't showing signals.

**[S] /optimize quality audit (2h)**
Run 5 diverse profiles through /optimize. For each: is every critique specific? Is there a single generic sentence that a CIO would read and dismiss? Fix anything that doesn't pass that test.

### B2C GTM (6h)

**[M] LinkedIn content: 6 posts (3h)**
Week 1 of Sprint A: 3 posts (Mon/Wed/Fri)
Week 2 of Sprint A: 3 posts (Mon/Wed/Fri)
Mix: 2 data posts, 2 coaching posts, 2 behind-the-build posts.
By the end of Sprint A, you'll have 9 total posts published (3 from Pre-Sprint + 6 here).

**[M] Wake Forest follow-up (1h)**
Day-of Zoom (May 18): send the leave-behind email within 2 hours of the call ending.
Day +3 (May 21): personal note to the career center contact: "Just wanted to follow up — any feedback from the first alumni who tried it?"
Week 2 (May 25): if trial codes have been used, send a brief note to the users directly: "Saw you started a trial through [contact] — what's working so far?"

**[S] Personal outreach: second wave (2h)**
Review the list from Pre-Sprint. Who didn't respond? One follow-up (not two). Who responded positively but didn't sign up? Give them a direct trial link with a personal note. Who signed up but hasn't added a company? Send a personal check-in.

Also: identify 10 new names for a second wave. Different category: people you know who coach executives, run career programs, or are active in HR/talent communities.

### B2B GTM (4h)

**[S] LinkedIn Sales Navigator: activate and build saved searches (1h)**
Two saved searches:
1. Career coaches: title contains "career coach" OR "executive coach" OR "outplacement consultant" — US — active on LinkedIn — 2nd degree preferred
2. VC/PE operating partners: "operating partner" OR "talent partner" — Venture Capital or Private Equity — US — active

**[M] First 20 coach DMs (2h)**
Use the template from sm-gtm-b2b.md. Personalize the first line. 2nd-degree connections first. Track responses in a simple spreadsheet: name, sent date, response yes/no, call scheduled.

**[S] Response tracking + follow-up (1h)**
For anyone who responds to the coach DMs from Pre-Sprint (if started): schedule the 15-minute demo call.

### Ops (2h)

**[S] Non-converter interview protocol (1h)**
Write the 10-question script. Set up Calendly. Draft the email to send within 72 hours of trial expiry: "Can I get 10 minutes? I want to understand what we could have done better for you." The answer to that question is worth more than any analytics tool.

**[S] Stripe dunning configured (1h)**
3 retry attempts over 7 days. Grace period: 7 days. Email templates for failed payment and final notice.

### Sprint A Success Criteria

- [ ] Activation email drip live and sending to all active trials
- [ ] Trial tracking dashboard showing all trial users with attribution
- [ ] Scraper alerting tested and confirmed working
- [ ] 9+ LinkedIn posts published (cumulative since May 9)
- [ ] Wake Forest trial codes shared; at least 1 trial user from that channel
- [ ] 20 coach DMs sent; at least 1 response
- [ ] First non-converter interview protocol ready
- [ ] At least 1 personal follow-up call completed with a trial user

---

## Sprint B (Jun 2–15, ~22h)
**Theme: Onboarding Wizard. The blank dashboard is the primary conversion killer. Eliminate it.**

### Product (14h)

**[XL] Full onboarding wizard — Steps 1-7 (12h)**
Seven-step guided setup with progress indicator and auto-save:
1. Role type + experience level + search status
2. Target companies (minimum 3; suggest by sector if blank)
3. Resume upload or paste (optional but strongly prompted)
4. Briefing time + timezone (defaults 7am; simple time picker)
5. Generate first prep brief for one of their companies (streaming, in-wizard)
6. Outreach draft for one contact (skippable)
7. "Your search is live" confirmation screen

Step 5 is the aha moment inside the wizard. The user should see Claude stream their first brief before they've finished setup. That is the conversion moment.

**[S] Wizard completion confirmation screen (2h)**
Shows: companies added, first briefing scheduled (time), next scan time. "Your search starts working at 7am tomorrow."

### B2C GTM (2h)

**[S] Testimonial request to all alpha users (1h)**
Personal email: "Would you write 2-3 sentences about your experience? Specifically: what would you tell another CIO in search about Starting Monday?" Use actual names and quotes on the landing page (with permission).

**[S] Email list segmentation (1h)**
Three segments in Resend: /optimize visitors (from email capture), trial users, paying users. Different messaging for each. UTM parameters tracking which source each came from.

### B2B GTM (4h)

**[M] ICF webinar session proposal (2h)**
300-word proposal for a regional ICF chapter: "AI and executive coaching: how data-driven search is changing what your clients expect." Regional chapter is easier to get accepted than national. Aim for a Q4 2026 appearance.

**[M] First coach demo call structure documented (2h)**
Write the 15-minute structure from sm-gtm-b2b.md. Practice once. Know the three most common objections (cost, complexity, client resistance) and the response to each.

### Sprint B Success Criteria

- [ ] Onboarding wizard live; at least 2 new trial users complete it
- [ ] At least 1 testimonial received and displayed on landing page
- [ ] ICF proposal submitted
- [ ] First coach demo call scheduled or completed
- [ ] Trial-to-paid conversion rate has a preliminary data point

---

## Sprint C (Jun 16–29, ~20h)
**Theme: Monitor Tier + Content Compound. Unlock intelligence users and get LinkedIn working.**

### Product (10h)

**[M] Intelligence setup track — 3-field fast path (3h)**
For Monitor tier: title, 5 companies (or suggest), email. Briefing defaults to weekly digest. Done in under 3 minutes. No pipeline, no contact management.

**[L] Weekly Market Intelligence Digest (5h)**
Sunday email to Monitor tier users: scan matches from the week, notable signals (new executive hires, funding), 2 company suggestions based on profile. All value in the email — no login required to get it.

**[M] Proactive company suggestions in Monitor dashboard (2h)**
On first login: "Based on your title and sector, you might want to watch these 5 companies." One-click add.

### B2C GTM (4h)

**[M] First SEO article (3h)**
Topic: "We scanned [X] career pages this week — here's what CIO hiring looks like in Q2 2026."
Real data from SM's scan results. 1,500+ words. Published on /blog. SEO target terms: "CIO job market 2026" and "how to monitor company career pages."

This is the first piece of content no one else can publish — you have the data.

**[S] Post-Zoom follow-up cadence (1h)**
4 weeks have passed since Wake Forest. Where are those trial users? Personal check-in. Who landed an interview? Who upgraded? Who churned and why?

### B2B GTM (2h)

**[S] Ongoing coach outreach — 20 DMs (2h)**
By end of Sprint C: 60 coach DMs total. Target: first demo call completed this sprint.

### Sprint C Success Criteria

- [ ] Monitor tier intelligence track live; at least 1 $49/month subscriber
- [ ] Weekly digest live and sending
- [ ] First SEO article published
- [ ] First coach demo call completed
- [ ] LinkedIn following approaching 250+

---

## 30-Day Target (by June 9, end of Sprint A)

| Metric | Target |
|--------|--------|
| Paying users | 5+ |
| Active trials | 10+ |
| Trial-to-paid conversion | First data point — any % |
| LinkedIn posts published | 15+ |
| LinkedIn followers | 150+ |
| Coach DMs sent | 30+ |
| Wake Forest trial users | 3-5 |
| Personal network signups | 4-6 |
| Non-converter interviews completed | 2+ |
| Activation email drip | Live and sending |

The most important number: trial-to-paid conversion rate. If it's below 20%, pause outreach and fix activation before adding more trial users. If it's above 30%, Sprint B onboarding wizard becomes even more urgent — feed it more users.

---

## Quarter Target (by July 31, end of Sprint D)

| Metric | Target |
|--------|--------|
| Paying users | 15-20 |
| MRR | $2,500-$4,000 |
| Trial-to-paid conversion | ≥ 30% |
| Daily briefing open rate | ≥ 50% (baseline measured) |
| LinkedIn followers | 500+ |
| /optimize monthly visitors | 200+ |
| Coach conversations active | 3+ |
| Coach demo calls completed | 5+ |
| LinkedIn content | 3 posts/week, every week |
| SEO articles published | 3+ |
| Executive tier | Live at $349+ |

---

## Channel Priority Stack for Now vs. Later

| Channel | This Week | Month 1-3 | Month 3-6 |
|---------|-----------|-----------|-----------|
| Personal network DMs | **Primary** | Ongoing | Ongoing |
| LinkedIn content | **Start now** | 3x/week | 3x/week |
| Wake Forest / career networks | **Prep now** | Follow-up | Expand |
| /optimize (passive) | **Audit now** | Promote | Compound |
| Coach outreach | Sprint A | Active | Close deals |
| SEO | Sprint C | Build | Compound |
| LinkedIn ads | — | — | Only if ≥35% conv |
| Manager Tools | — | — | Month 15 |

---

## Personal Outreach Message Templates

**For executives you know well (text/iMessage):**
> "Hey [Name] — I built something. It's a daily briefing + company monitor tool for senior tech execs in search. I built it because I needed it and nothing out there did what I needed. 30-day free trial, no card required. [link] — would mean a lot to get your honest take."

**For executives you know professionally (LinkedIn DM):**
> "[Name] — I know you've been navigating your own search. I built a tool I wish I'd had — daily intelligence on your target companies, prep briefs, outreach drafts. You're exactly who it's built for. Free trial: [link]. No obligation — your feedback is what I actually want."

**For former colleagues:**
> "Hey [Name] — quick note. I've been building Starting Monday — an AI tool for senior executive job search. I'm still in early alpha and you'd be a perfect early user given [specific reason]. Trial link: [link]. Would genuinely love your unvarnished reaction."

**For the coach outreach (LinkedIn Sales Navigator DM after connection accepted):**
> "[Name] — saw you coach [CIO/VP-level] executives through transitions. I built a tool that a few coaches are using to handle the daily monitoring and briefing delivery for their clients — frees them up for the strategy work. Would a 15-minute demo be useful to see if it fits how you work?"

---

## The One Rule

Every week that passes without 3 LinkedIn posts and 10 personal or coach outreach messages is a week of acquisition ground given up. The product is ready. The question is whether users know it exists. That answer is 100% a function of how consistently you show up.

---

*Version 1.0 — May 9, 2026*
*Companion: sm-sprints.md (integrated product+GTM), sm-gtm-b2c.md, sm-gtm-b2b.md*
*Next review: June 9 — after first trial-to-paid conversion rate measurement*
