# Starting Monday — Investor Brief

Confidential | May 2026

---

## The Opportunity

Five hundred thousand senior executives change roles in the United States every year. For thirty years, they have done it with the same tools: job boards that index roles after they are filled, outplacement firms that charge fifty thousand dollars for a brief that takes six weeks to produce, spreadsheets that collapse by week five, and LinkedIn. Starting Monday is the first platform built specifically for this search, by someone running one.

---

## The Problem

The best roles at the VP and C-suite level are filled before they are posted. The candidate who knows that a funding round just closed, that a CIO just departed, that a new transformation initiative was just authorized, gets the first call. The one who finds out when the role appears on LinkedIn does not. There is no consumer tool that monitors a candidate's specific target organizations for these signals. That is the first problem.

The second is preparation. Producing a high-quality brief for a single company conversation requires cross-referencing company strategy, recent leadership changes, financial position, the job description, and the candidate's specific career record. It takes four to five hours. An executive managing twenty target companies cannot sustain this manually and still run the rest of the search.

The third problem is that most executive candidates build a disciplined process and abandon it by week six. The tracking falls behind. The follow-up does not go out. The contact goes cold. The spreadsheet approach has a known failure rate and no one has fixed it, because no one has built for this user.

---

## The Solution

Starting Monday is a campaign management platform for executive search. It watches, prepares, and manages.

It watches by scanning career pages at up to twenty-five target companies three times a week, before roles appear publicly, and by monitoring company intelligence signals — funding rounds, executive hires and departures, acquisitions, expansions — the moment they are detectable. Users learn before the broader market does.

It prepares by generating a sixty-second brief built from the intersection of the company's current data and the candidate's actual record. Not a generic company summary. A brief specific to this person at this company at this moment, drawing on scan results, recent signals, attached documents, and the candidate's resume.

It manages by tracking pipeline by stage, logging contacts and conversations, surfacing overdue follow-ups, delivering a daily morning briefing, and providing an AI advisor with full context that can take operational actions directly in conversation.

---

## Traction

The product is in production at startingmonday.app. Two pricing tiers are live: Passive at $49 per month and Active at $199. The first alpha users are onboarded on a 30-day free trial with no credit card required. Executive at $499 and Campaign at $999 are in waitlist with self-identified paying interest. The infrastructure stack is Railway, Supabase, and Anthropic, with monitoring live via UptimeRobot and Sentry and a 44-test automated suite in place. Introductions to Wake Forest and Stanford alumni career offices are pending. A partnership conversation with Mark Horstman at Manager Tools, whose audience is the exact target user, is in development.

---

## Market Size

Approximately 500,000 to 800,000 VP and above professionals transition roles annually in the United States. At $199 per month and an eight-month average search duration, each candidate represents roughly $1,600 in lifetime value. The total addressable market runs to $800 million to $1.3 billion annually in subscription revenue alone.

The serviceable addressable market is the 15 to 20 percent of those candidates who are in active or latent search and willing to invest in their own search infrastructure: 75,000 to 160,000 candidates, representing $120 to $260 million annually. The three-year target is 5,000 subscribers at $200 per month average, producing $12 million in ARR. That is 3 to 7 percent SAM penetration, achievable through referral and institutional channel development before any significant paid acquisition.

---

## Business Model

Consumer subscriptions are the primary revenue stream, with an institutional channel in development.

| Plan | Monthly | Quarterly | Status |
| --- | --- | --- | --- |
| Passive | $49 | $132 | Live |
| Active | $199 | $537 | Live |
| Executive | $499 | — | Waitlist |
| Campaign | $999 | 3-month min. | Waitlist |

The institutional channel adds outplacement firm integrations at $35 to $45 per seat per month at volume, company-funded transition benefits for executives being transitioned, and a recruiter-facing tier currently in design.

Unit economics at scale: COGS per active user runs $8 to $12 per month, almost entirely Anthropic API usage. Gross margin is approximately 85 percent. Target lifetime value for an Active subscriber at eight months is $1,600. Target CAC through referral and institutional channels is $150 to $400, producing a 5:1 or better LTV-to-CAC ratio. The marginal cost of a 30-day trial, including the Anthropic usage for a user who generates two or three briefs, is $5 to $15.

---

## Competitive Landscape

There is no direct comparable. Starting Monday is creating a category — executive career platform — that does not yet have a recognized leader.

| Category | Why it falls short |
| --- | --- |
| Job boards (LinkedIn, Indeed) | Roles are indexed after they are filled |
| ATS tools | Built for companies, not candidates |
| Outplacement firms | $10,000 to $50,000; slow and generic |
| Career coaches | Human and valuable; not continuous or scalable |
| Resume tools (Teal, Jobscan) | Volume search oriented; wrong level |
| General AI (ChatGPT, Claude) | No context, no monitoring, no campaign infrastructure |

The moat is not the AI, which any competitor could access. It is the accumulated company intelligence, the candidate's career data that grows richer the longer they are on the platform, and the founder's credibility with the target persona.

---

## Why Starting Monday Wins

The founder is the target user. Every product decision is made by someone running exactly the search the platform is designed to support. This eliminates the feature-market mismatch that kills most products aimed at executives, where the builder has never done the thing they are building for.

The intelligence advantage is real and defensible. No consumer tool monitors a specific candidate's target company list, at career-page depth, three times a week, before roles are posted. The candidate who arrives first has an advantage that compounds: earlier conversations, earlier positioning, more time to build the relationship before anyone else knows the role exists.

Data gravity grows with tenure. The longer a user is on the platform, the more valuable their Starting Monday data becomes — company intelligence accumulated over months, a contact history that reflects a full campaign, an accomplishment repository that makes every brief more accurate. Leaving means losing something that cannot be reconstructed quickly elsewhere.

The referral path is unusually high quality. A CIO who accepts an offer and tells three peers about Starting Monday generates three self-qualified, high-motivation leads with zero marketing spend. A peer recommendation in a tight professional network converts at rates that paid acquisition cannot approach.

The institutional channel is a pull, not a push. Outplacement firms serve large cohorts of exactly the right users at exactly the right moment of motivation. A single partnership with a mid-sized firm delivers 50 to 100 seats per year. That is customer acquisition at near-zero marginal cost.

---

## Risks

| Risk | Assessment | Mitigation |
| --- | --- | --- |
| Slow trial-to-paid conversion | Medium probability, high impact | Onboarding improved to reach first brief in under 15 minutes |
| Anthropic API cost increases | Low probability | Token budgets enforced in code; model selection tuned per task |
| Competitor entry | Medium probability, medium impact | Moat is data and founder credibility, not technology |
| Executive search market softens | Low probability | Passive tier creates counter-cyclical demand |
| Churn at offer | Structural | Alumni mode designed to retain users between search cycles |

---

## The Ask

Starting Monday is not currently raising. The business is capital-efficient: primary costs are API usage, which scales with revenue, and Railway hosting, which is minimal. The current phase is customer development and institutional channel development, not paid acquisition.

When we raise, it will be to accelerate two things. First, institutional channel development — outplacement integrations require enterprise sales and legal work that cannot be bootstrapped indefinitely. Second, the first customer success hire, which is the highest-leverage position in a product where user success is the referral engine.

A seed round of $750,000 to $1.5 million funds 18 to 24 months of focused execution. What matters as much as the capital is the network. An investor with relationships in executive outplacement, talent management, or professional services acceleration is worth more than a check. A single introduction to a CHRO running an outplacement program is worth six months of cold outreach.

---

## The Founding Story

The founder is a Transformation CIO who built Starting Monday because it did not exist and he needed it. The product is not theoretical. It is being used to run the founder's own search, and every feature has been tested against the real experience of a real executive in a real search.

That is not a marketing claim. It is the reason the product is specific where other tools are generic, operational where others are aspirational, and built for the search that cannot afford to miss.

---

Confidential. For discussion purposes only.
