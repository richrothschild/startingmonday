# Council Review Process

How to run any synthetic council against the Starting Monday site, a specific feature, or a piece of content.

---

## What a Council Review Produces

For each council member:
- **Likes** — specific things that align with their principles
- **Dislikes** — specific things that would draw their criticism
- **Required change** — one concrete change they would demand before approving

Then as a group:
- **Key changes** — the top 2-3 changes that appeared across multiple members
- **One thing to stop doing** — the highest-priority behavior to eliminate

---

## Choosing the Right Council

| Council | Use when reviewing |
| --- | --- |
| Sales and Marketing | Landing page, blog posts, email copy, LinkedIn posts, CTAs |
| Software and SRE | Architecture, codebase, deployment pipeline, observability, reliability |
| UI UX and Product Design | Dashboard flows, onboarding, component design, interaction patterns |
| Behavioral Economics | Retention mechanics, pricing page, activation flows, habit loops |
| Brand and Scaling | Positioning, growth strategy, acquisition channels, brand voice |
| Decision Management | Major product decisions, roadmap prioritization, kill criteria |
| Revenue and Economics | Pricing model, unit economics, SaaS metrics, expansion strategy |
| Management | Team processes, hiring, operating cadence (relevant post-hire) |
| Data Analytics | Metrics choices, dashboard design, event tracking, data storytelling |
| Culture and Organization | Operating systems, governance, team structure |
| HR and Legal | Contracts, compliance, hiring processes, AI governance |

---

## Prompt Template — Content Review

Use this for landing pages, blog posts, emails, and marketing copy.

```
You are the Starting Monday Synthetic Council for [COUNCIL NAME].

Review the following content through the lens of each council member listed below.

For each member, provide:
1. Likes — specific elements that align with their principles (quote the text where possible)
2. Dislikes — specific elements that would draw their criticism (quote the text)
3. Required change — one concrete change they would demand before this goes live

Council members and their principles:
[PASTE MEMBER LIST FROM COUNCIL FILE]

Starting Monday context:
- AI-powered career search platform for senior executives (VP, CIO, CTO, COO)
- Hero message: "The role was never posted. You found it anyway."
- Tiers: Intelligence ($49/mo), Search ($199/mo), Executive ($499/mo)
- Core features: career page scanning 3x/week, company signals, daily briefing, AI prep briefs, AI chat, outreach drafting, salary intelligence

After individual reviews, provide:
- Key changes (top 2-3 that multiple members flagged)
- One thing to stop doing (highest-priority behavior to eliminate)

Content to review:
[PASTE CONTENT HERE]
```

---

## Prompt Template — Technical / Product Review

Use this for architecture, codebase, flows, and infrastructure.

```
You are the Starting Monday Synthetic Council for [COUNCIL NAME].

Review the following technical material through the lens of each council member listed below.

For each member, provide:
1. Likes — specific decisions or patterns that align with their principles
2. Dislikes — specific decisions or patterns that would draw their criticism
3. Required change — one concrete change they would demand before approving

Council members and their principles:
[PASTE MEMBER LIST FROM COUNCIL FILE]

Starting Monday technical context:
- Next.js 16 App Router web app deployed on Railway
- Separate Node.js worker service for background jobs and cron scheduling
- Supabase PostgreSQL with RLS for all user data
- Claude (Anthropic) for AI features; Browserless for career page scanning
- Stripe for billing; Resend for email; Sentry for errors; PostHog for analytics
- No staging environment; auto-deploys to production on push to main
- Pre-commit hooks: TypeScript check + em-dash detection
- Playwright E2E tests exist but run only locally

After individual reviews, provide:
- Key changes (top 2-3 that multiple members flagged)
- One thing to stop doing (highest-priority behavior to eliminate)

Material to review:
[PASTE ARCHITECTURE NOTES, CODE, FLOW DESCRIPTION, OR FEATURE SPEC HERE]
```

---

## Tips

- **Be specific in the material you paste.** A council review is only as good as what it has to work with. Paste actual code, actual copy, actual flows — not summaries.
- **Run the two most relevant members first** when you need a fast read. For technical debt decisions: Beck and Fowler. For production incidents: Majors and Beyer. For user trust issues: Fong-Jones and Norman.
- **Use the required change as your action item.** If all six members demand a change, do it first. If only one demands it, put it in the backlog.
- **The "one thing to stop doing" is a forcing function.** Pick something you will actually stop. A recommendation that gets noted and ignored is worse than no recommendation.
