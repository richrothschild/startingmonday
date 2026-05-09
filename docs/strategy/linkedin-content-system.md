# LinkedIn Content System

> Strategy, workflow, and automation spec for Starting Monday's LinkedIn presence.
> Operator: Liz (Rothschild). Goal: consistent, credible presence that drives awareness among senior tech executives and executive coaches.

---

## Strategic objective

LinkedIn is the right primary channel for two reasons. First, senior technology executives are active on LinkedIn in a way they are not on Instagram or X. Second, executive coaches and outplacement partners — the B2B channel — live on LinkedIn professionally. One channel serves both audiences.

The goal is not impressions. The goal is that when an executive goes through a leadership change, a CHRO decides to offer career support, or an executive coach looks for tools, Starting Monday is the brand they have already seen 10 times.

---

## Who the content is for

**Primary audience:** Senior technology executives (CIO, CTO, CISO, CDO, COO, VP) who are in search or know they will be in search in the next 12 months.

**Secondary audience:** Executive coaches, career consultants, and outplacement professionals who serve this population.

These two audiences want different things. Executives want tactical insight and confidence. Coaches want to look smart and well-resourced. The content serves both by being genuinely useful to executives and implicitly credible to coaches.

---

## Liz's workflow

### Daily routine

1. A **Google Calendar event fires each weekday at 9:00 AM** with a unique link.
2. Liz clicks the link. It opens Starting Monday at `/dashboard/admin/social`.
3. The platform displays **today's pre-generated post draft** — pulled from the weekly content schedule, enriched with this week's signals and pipeline data.
4. Liz reviews the draft. She can edit the text inline.
5. She clicks **"Copy to LinkedIn"** or, once the integration is live, **"Schedule post"** — which pushes it to the queue.
6. LinkedIn posting happens either manually (she pastes it) or automatically at the scheduled time.

### Reply and DM management (15 minutes per day)

1. Starting Monday's social dashboard shows **all new comments and DMs** from the connected LinkedIn profile.
2. Each comment shows: post context, commenter name, their current role, suggested reply.
3. Liz reviews suggested replies, edits as needed, and sends from the dashboard or directly in LinkedIn.
4. DMs are flagged if they look like potential partner or user inquiries (keywords: "interested," "how does it work," "coach," "my clients").

### Weekly rhythm

- Monday, Wednesday, Friday: regular posts (insight / product / engagement rotation).
- Friday afternoon: review the next week's draft schedule, request regeneration for any that do not land.
- Monthly: review top-performing posts; feed themes into next month's content generation.

---

## The five content pillars

Rotate through these on a Monday / Wednesday / Friday schedule.

### 1. Search craft
Tactical, specific advice for the executive search process. What works at this level that does not work at lower levels. What conventional wisdom is wrong.

*Examples:*
- "Executive recruiters call you when they already have a candidate in mind. Here is what that changes about how you present."
- "The prep brief framework we use before every executive interview"
- "Why your LinkedIn 'About' section is the wrong thing to optimize"

### 2. Market intelligence
What is happening in the executive hiring market right now. Sector trends, role growth and decline, timing signals.

*Examples:*
- "CIO openings typically spike 6-8 weeks after a major ERP announcement. Here is the pattern."
- "Three industries where digital transformation budget is accelerating right now"
- "PE-backed companies are creating COO roles faster than any other sector this year"

### 3. Behind the build
Transparent product development posts. What features were built, why, what problem they solve. This builds credibility with both audiences.

*Examples:*
- "We added funding round signals to the daily briefing last week. Here is why a Series B matters for your CIO search."
- "The onboarding question that revealed a gap in how executives think about their pipeline"
- "Why we built the follow-up reminder system before anything else"

### 4. User stories
Specific, anonymized success patterns from users. Not testimonials. Patterns.

*Examples:*
- "One of our users added a funding signal to his outreach message. The reply rate doubled. Here is why that works."
- "The executive who had 40 companies in her pipeline but had not sent an outreach message in 11 days. What that tells you."

### 5. Engagement
Questions, contrarian takes, polls. These generate comments and comments drive reach.

*Examples:*
- "What is the biggest thing that surprised you about your executive job search? Reply in the comments."
- "Hot take: spending more than 20% of your search time on your resume is a mistake at the C-suite level. Agree?"
- "How long did your last executive search take?" (poll)

---

## Post format

LinkedIn rewards posts that make people stop scrolling. For this audience:

**Line 1:** A specific, counterintuitive statement or question. Never a throat-clear.

**Lines 2-5:** 3-4 short sentences that develop the point. One idea per sentence. No paragraphs longer than 2-3 sentences.

**Lines 6-10:** The payoff. Specific, actionable, or a pivot that reframes the opening.

**Final line:** Optional CTA. "What do you think?" or "We built X to solve this — link in bio." Never put the link in the post body. LinkedIn suppresses posts with external links.

**Hashtags:** 3-5 per post at the end. Use a consistent base set: #executivesearch #CIOjobs #careertransition #jobsearch #techleadership. Vary 1-2 situationally.

---

## 4-week sample schedule

### Week 1
- **Mon (Search craft):** "Executive recruiters are not looking for the best candidate. They are de-risking a decision. Here is what that changes about how you present."
- **Wed (Behind the build):** "Why we built signal tracking before anything else in Starting Monday"
- **Fri (Engagement):** "What is the worst advice you got during your executive job search?"

### Week 2
- **Mon (Market intelligence):** "Three sectors where CIO and CISO mandates are forming right now — and the signals that tell you before the job posts"
- **Wed (Search craft):** "The follow-up timing mistake every executive makes in their search"
- **Fri (User story):** "What 40 pipeline companies with zero outreach actually tells you about search behavior"

### Week 3
- **Mon (Behind the build):** "The briefing email we send every morning — and why it takes 90 seconds to act on or skip"
- **Wed (Market intelligence):** "PE-backed company patterns: how to read a funding announcement as a CIO candidate"
- **Fri (Engagement poll):** "How many target companies do you have in your active pipeline right now?"

### Week 4
- **Mon (Search craft):** "Prep briefs vs. company research: the difference at the executive level"
- **Wed (User story):** "The recruiter outreach that converted because the timing was right, not because the message was perfect"
- **Fri (Product + CTA):** Screenshot of daily briefing email + "This goes out every morning at the time you choose. What it contains and why it is built this way."

---

## Starting Monday feature requirements

For Liz's workflow to run:

### Phase 1 (Sprint 3 — manual posting)
- Admin social page at `/dashboard/admin/social`
- Weekly content schedule config: 3 posts per week, pillar rotation
- Daily content generation API: given today's date and content schedule, generate a post draft
- Post preview + edit UI: show draft, allow inline edit, copy-to-clipboard button
- Magic link: `https://startingmonday.app/dashboard/admin/social?date=YYYY-MM-DD` — auto-loads today's post

### Phase 2 (Sprint 5 — scheduling + metrics)
- Buffer API integration: connect Starting Monday to Buffer (simplifies multi-platform scheduling)
- Auto-queue: when Liz approves a draft, push it to Buffer queue for scheduled delivery
- Performance metrics: import impressions, likes, comments from LinkedIn via Buffer or LinkedIn API
- Reply notifications: flag new comments in the social dashboard
- DM inbox: show new DMs with keyword flagging for partner/user inquiries

### Calendar invite setup (Liz does this once)
1. Create a recurring Google Calendar event: weekdays, 9:00 AM, title "LinkedIn post — Starting Monday"
2. Add the magic link as the location or description: `https://startingmonday.app/dashboard/admin/social`
3. The link always opens the current day's pre-generated draft

---

## What not to do on LinkedIn

Do not post features as announcements. "We just released salary benchmarking!" gets no engagement from people who do not already know the product. Post the insight the feature enables, then mention the feature in the last line.

Do not repost generic career advice. "5 tips for updating your resume" competes with every recruiter on LinkedIn. The content must be specifically for senior executives, not for job seekers generally.

Do not use carousels as the primary format. They require design resources and consistent quality. Text posts are faster, more sustainable, and perform well for this audience.

Do not buy followers or use engagement pods. The target audience is small and specific. Inflated engagement metrics attract the wrong followers and break signal-to-noise for outreach.

Do not put external links in post bodies. LinkedIn's algorithm suppresses them. Put the link in the first comment or direct people to the profile link.

---

## Metrics Liz tracks (monthly)

- Follower growth (trending up?)
- Post impressions (growing week over week?)
- Profile link clicks (to startingmonday.app)
- Inbound connection requests from target audience (CIOs, coaches, VPs)
- Comment and DM volume from potential users or partners

Report these numbers to Rich on the 1st of each month. A 5-minute async update is enough.

---

*Last updated: 2026-05-08*
