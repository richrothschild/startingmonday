# Epic: Council A-Grade — 55 Items Across 15 Themes

**Created:** May 12, 2026  
**Source:** Synthetic Council Site Review — May 11, 2026 (docs/content/site-review-may-2026.md)  
**Format:** E-A-01 through E-A-55, grouped by theme. Mark Horstman first per priority instruction. Tensions listed at end with decision options.

---

## Convergence Summary

These items appear in 4+ councils independently — highest leverage:

| Item | Members | Theme |
|---|---|---|
| Product screenshot on landing page | Stanley, Norman, Majors, Biddle, Kozyrkov, Skok (6) | Demo |
| Concierge standalone page + above-fold | Buffett, Campbell, Zhuo, Chris Do, Skok (5) | Pricing |
| Situation card differentiation | Norman, Dunford, McMahon, Bourgoin, Barrows, Kahneman (6) | Cards |
| /about page with founder narrative | Gerhardt, Hughes Johnson, Bock, Huang (4) | Founder |
| Staging/CI wiring | Beck, Fowler, Beyer (3) | SRE |
| Daily briefing cadence framing | Horstman, Eyal, Mochary (3) | Cadence |
| Stats bar "$0" replacement | Rams, Stancil, Kozyrkov (3) | Stats |

---

## Section 1 — Cadence, Habit, and Operating Loop

**E-A-01 — Mark Horstman (Management Council)**  
Frame the daily morning briefing as an execution cadence, not a content delivery feature.  
**Change:** Add copy in the features section or hero: "Every morning you know exactly what happened overnight and exactly what to act on today." That's execution discipline applied to search — the same mechanic as a weekly one-on-one applied to a job campaign.  
**File:** LandingPage.tsx or page.tsx hero body / features copy

---

**E-A-02 — Nir Eyal (Behavioral Economics Council)**  
The habit loop mechanics of the product — external trigger (briefing), investment (pipeline), variable reward (alerts) — are invisible on the landing page.  
**Change:** Name the daily ritual explicitly: "Your morning briefing is ready before the market opens. New signals, pending actions, and what to do first — assembled overnight." Frame it as something you return to, not something that runs without you.  
**File:** LandingPage.tsx features section

---

**E-A-03 — Matt Mochary (Management Council)**  
The product has a clear operating loop. The site presents it as a feature list, not a cadence.  
**Change:** Show the weekly rhythm on the page: "Monday: review your pipeline. Each morning: act on overnight signals. Before each interview: run the prep brief in 60 seconds." Make the operating system legible before the user buys it.  
**File:** LandingPage.tsx — new "How it runs" section or features block

---

**E-A-04 — Ray Dalio (Decision Management Council)**  
The product gives users information. The site presents it as an intelligence platform. The distinction matters.  
**Change:** Frame around decision quality, not data volume: "Every morning you make one decision — which signal to act on first. We surface it. You act." Not a data platform. A decision system.  
**File:** LandingPage.tsx hero or features section

---

## Section 2 — Hero and Above-Fold Copy

**E-A-05 — John McMahon (Sales and Marketing Council)**  
Urgency exists in one section and doesn't sustain. Pain is described intellectually, not viscerally.  
**Change:** Add one specific cost-of-inaction scenario in or near the hero: "The search was filled before it was posted. You didn't know until LinkedIn showed you the announcement. You had been watching that company for six months." Name the wound.  
**File:** page.tsx hero body

---

**E-A-06 — Katelyn Bourgoin (Sales and Marketing Council)**  
The hero opens with five sentences of rational argument before any emotional acknowledgment.  
**Change:** Add one line naming the emotional isolation: "Most executives in active search won't tell anyone they're looking. Not their peers. Not their network. Not even their closest contacts." Acknowledge the anxiety before offering the platform as the answer.  
**File:** page.tsx hero body

---

**E-A-07 — Katelyn Bourgoin (Sales and Marketing Council)**  
The privacy reassurance appears below the CTAs.  
**Change:** Move the confidentiality/privacy line above the primary CTAs. The CISO testimonial is three screens down. The anxiety about exposure is the top-of-funnel objection.  
**File:** LandingPage.tsx hero section CTA block

---

**E-A-08 — Josh Braun (Outreach Sales Council)**  
The still-employed executive cannot afford to be discovered. No unanswered objection should remain near the CTA.  
**Change:** Add one explicit safety line near the primary CTA: "No credit card. No recruiter visibility. No employer access. Cancel from settings in 10 seconds."  
**File:** LandingPage.tsx hero CTA block

---

**E-A-09 — Ben Horowitz (Additional Future Members)**  
The site treats every visitor as someone who has already decided to search strategically. Many are resisting.  
**Change:** Name the resistance directly: "The hardest part isn't finding the role. It's admitting you're looking for one." Give the user permission to be exactly where they are before asking them to sign up.  
**File:** LandingPage.tsx — near situation cards or hero

---

## Section 3 — Category Claim and Brand

**E-A-10 — April Dunford (Sales and Marketing Council)**  
"The executive job search operating system" appears in the title tag and nowhere visible on the page.  
**Change:** Put the category claim in a visible H2 or subhead near the hero: "This is the executive job search operating system. Not a job board. Not a coaching platform. The infrastructure for a campaign." Sets the frame before the differentiation section.  
**File:** LandingPage.tsx — new subhead element near hero

---

**E-A-11 — Marty Neumeier (Brand and Scaling Council)**  
"Operating system" and "campaign infrastructure" are both present in the copy. The brand isn't ownable because the category claim isn't committed.  
**Change:** Choose one category claim and put it in an H2 visible in the first five seconds on desktop. The brand becomes ownable when the category is legible to a first-time visitor without scrolling.  
**See also:** Tension T-3 below — must decide which term to commit to.  
**File:** LandingPage.tsx

---

## Section 4 — Founder Narrative and About

**E-A-12 — Dave Gerhardt (Sales and Marketing Council)**  
Below the hero the page loses the founder voice entirely and slides into feature-list mode.  
**Change:** Add a founder moment paragraph between the hero and the before/after section — first person, named: "I ran this search. I had the relationships. I still lost track of companies, missed signals, and walked into interviews underprepared. I built this because I needed it."  
**File:** LandingPage.tsx — new section, or page.tsx as a passed prop

---

**E-A-13 — Claire Hughes Johnson / Laszlo Bock (Culture Council / HR Council)**  
No /about page exists. Senior executives evaluate vendors by the credibility of the people behind them.  
**Change:** Publish /about page: "Built by a CIO who ran an executive search and built the tool he needed." Two sentences minimum. Named. Links from nav and footer.  
**File:** New src/app/about/page.tsx

---

**E-A-14 — Jensen Huang (Additional Future Members)**  
The choice of Anthropic Claude is a deliberate trust signal that senior executives would respond to. It's invisible.  
**Change:** Name the AI stack on /about or /security: "We use Anthropic Claude because of how they handle data and because the model calibrates better to executive-level nuance." That sentence earns trust at exactly the right buyer level.  
**File:** /about or /security page

---

**E-A-15 — Kim Scott (Management Council)**  
No visible feedback loop — no signal that if a brief misses, the user can report it.  
**Change:** Add a feedback mechanism and name it: "If a brief misses something, flag it — we track every report and improve every prompt." Signals caring personally while challenging directly. Matters to senior executives skeptical of AI black boxes.  
**File:** Dashboard or prep brief UI; mention on landing page features section

---

## Section 5 — Social Proof

**E-A-16 — Patty McCord / Laszlo Bock (Management / HR Councils)**  
All testimonials are anonymous. "CTO in transition, Healthcare technology" builds less trust than a real name at this buyer level.  
**Change:** Get one named executive to go on record. One real name with permission outperforms five anonymous endorsements. The credibility gap is enormous.  
**See also:** Tension T-4 below — named testimonials vs. confidentiality promise.  
**File:** LandingPage.tsx testimonials section + page.tsx testimonials data

---

**E-A-17 — David Skok (Revenue and Economics Council)**  
No conversion metrics are visible. No social proof numbers anchor the pricing section.  
**Change:** Add two numbers to the pricing section: executives currently in active search on the platform, and companies being tracked. "400 executives. 8,000 companies tracked." Honest numbers. Not large ones.  
**File:** PricingSection.tsx

---

**E-A-18 — Chris Hutchins (Culture and Organization Council)**  
"We monitor every 48 hours" is a feature claim. It isn't made visceral anywhere.  
**Change:** Add one operational line that makes the automation real: "This morning we processed signals from 847 companies being watched by executives currently in active search. Yours updated at 6:04am."  
**Note:** This requires real data from the system or plausible initial numbers.  
**File:** LandingPage.tsx — intelligence section or hero

---

## Section 6 — Demo and Product Visibility

**E-A-19 — Pablo Stanley / Don Norman / Gibson Biddle (Design / UX / Product Councils)**  
The dashboard screenshot currently shows "Good afternoon, Richard." — a personal account, not a demo.  
**Change:** Replace public/dashboard-screenshot.png with a screenshot from a demo account (no personal identifiers, ideally populated with recognizable company names). This was flagged by Priya in Round 2 grading as well.  
**File:** public/dashboard-screenshot.png

---

**E-A-20 — Gibson Biddle (Additional Future Members)**  
The demo exists and requires a click. Delight should require zero friction.  
**Change:** Put one sample prep brief on the landing page — for a recognizable company (ServiceNow, Workday, Accenture). Let the reader see the output without creating an account. The output is the product. Show it.  
**File:** LandingPage.tsx — new section or expandable component

---

## Section 7 — Stats Bar

**E-A-21 — Dieter Rams / Benn Stancil (Design / Analytics Councils)**  
"$0 to start" is a trial hook, not an achievement. It doesn't belong in the same visual system as "10+" and "60s."  
**Change:** Replace "$0 to start" with "11 days — the average window between the first signal and a search going to a retained firm." The data story belongs in the stats bar.  
**See also:** Tension T-1 — Kozyrkov wants all three replaced.  
**File:** LandingPage.tsx stats bar

---

**E-A-22 — Cassie Kozyrkov (Data Analytics Council)**  
All three stats — "10+", "60s", "$0" — are activity counts, not decision-relevant metrics. None help the buyer decide whether to start a trial.  
**Change:** Replace all three with outcome metrics tied to the buyer's actual decision. Example: "Executives who track a target company 11+ days before a search is posted get the first interview at 3x the rate of those who find out on LinkedIn."  
**See also:** Tension T-1 — this is an alternative to E-A-21, not additive.  
**File:** LandingPage.tsx stats bar

---

**E-A-23 — Rory Sutherland (Behavioral Economics Council)**  
$199/mo is anchored to coaching cost. It should be anchored to compensation delta.  
**Change:** Add one perception frame near pricing: "The delta between the role you want and the role you settle for is measured in weeks, not years. At that frame, $199/mo is a fraction of a rounding error on a compensation decision that could be $300K."  
**File:** PricingSection.tsx or LandingPage.tsx just before pricing section

---

## Section 8 — Pricing and Economics

**E-A-24 — Warren Buffett / Julie Zhuo / David Skok (Revenue / UX / Economics Councils)**  
Concierge at $1,299/mo is buried in a footnote band below the fold. That is a capital allocation mistake.  
**Change:** Give Concierge its own page (/concierge) with dedicated acquisition copy. Add above-fold mention on landing page — not a buried band.  
**File:** New src/app/concierge/page.tsx; LandingPage.tsx pricing eyebrow

---

**E-A-25 — Patrick Campbell (Sales and Marketing Council)**  
Landing page pricing uses "+" marks for feature bullets while /pricing uses checkmarks — two pages not designed as a system.  
**Change:** Align the feature symbol across both pages. Pick one and apply consistently.  
**File:** PricingSection.tsx; src/app/pricing/page.tsx (if exists)

---

**E-A-26 — Patrick Campbell (Sales and Marketing Council)**  
The upgrade nudge ("most users move to Active once they see what prep briefs do") is buried in the Passive card footer.  
**Change:** Move the upgrade nudge into the plan comparison header as a stated journey — make the upgrade path a visible road, not an accidental discovery.  
**File:** PricingSection.tsx

---

**E-A-27 — Patrick Campbell (Sales and Marketing Council)**  
No expansion hook is visible above the fold of pricing.  
**Change:** Add one line under Active that names the expansion trigger: "When you're ready for full depth, Executive is waiting."  
**File:** PricingSection.tsx Active card

---

**E-A-28 — Chris Do (Brand and Scaling Council)**  
The visual hierarchy accidentally tells buyers that $199 is the real product and $499 is an add-on.  
**Change:** Flip the visual treatment. Give Executive the slate-900 card. Put orange border on Active as "most popular" marker if needed. The most expensive plan must carry the most visual authority.  
**See also:** Tension T-7 — risk if Active is the highest-converting plan.  
**File:** PricingSection.tsx

---

**E-A-29 — Chris Do (Brand and Scaling Council)**  
Executive tier description copy is weak.  
**Change:** Rewrite with transformation language: "The analysis is done. The brief is written. The intelligence is running at full depth before you wake up."  
**File:** PricingSection.tsx EXECUTIVE_FEATURES or description text

---

**E-A-30 — Annie Duke (Decision Management Council)**  
The site creates urgency but doesn't give the user a base rate. Urgency without expected value is pressure.  
**Change:** Give the user a probability to evaluate: "Executives who reach a target company before the search is posted get the first interview 60% of the time. Executives who apply after the posting: 18%."  
**See also:** Tension T-6 — these numbers must be validated or framed as data estimates.  
**File:** LandingPage.tsx near hero or before-after section

---

## Section 9 — Navigation

**E-A-31 — Julie Zhuo (UI/UX Council)**  
"Free Profile Grade" sits in the nav with no explanation anywhere on the landing page. A nav item without explanation erodes navigation clarity.  
**Change:** Either explain "Free Profile Grade" in a visible landing page callout, or remove it from the nav until the feature is ready for full treatment.  
**See also:** Tension T-8 — Derek wants to build this out as a full email-gated CTA.  
**File:** LandingPage.tsx nav section

---

**E-A-32 — Julie Zhuo / Warren Buffett**  
The nav and pricing section feel like they were designed at different times.  
**Change:** Add one Concierge mention to the pricing eyebrow: "Including Executive Concierge at $1,299/mo — application required." Connects nav-level awareness to pricing section.  
**File:** PricingSection.tsx eyebrow/header copy

---

## Section 10 — Situation Cards and Routing

**E-A-33 — Don Norman / John Barrows / April Dunford (UX / Sales / Marketing Councils)**  
All 8 situation cards route to the same generic /signup. The cognitive contract created by self-identification is broken immediately.  
**Change:** Either route cards to differentiated onboarding variants, or acknowledge the selection on the signup page: "You said you need to land well, quickly. Here's what the first week looks like for you." The user told you who they are. Use it.  
**See also:** Tension T-9 — scoping decision (all 8 vs. 2-3 highest-urgency).  
**File:** src/app/signup/page.tsx; situation card onClick handlers in LandingPage.tsx

---

**E-A-34 — Daniel Kahneman (Additional Future Members)**  
The page leads with rational argument (before/after, features) before emotional identification (situation cards). System 2 is doing work that System 1 should have already done.  
**Change:** Move situation cards immediately after the hero — before the before/after section, before the intelligence scanner, before features. Let System 1 say "that's me" before System 2 checks the pricing.  
**See also:** Tension T-10 — conflicts with current page flow anchoring.  
**File:** LandingPage.tsx section order

---

**E-A-35 — Brian Balfour (Brand and Scaling Council)**  
Acquisition looks linear. No growth mechanic is visible on the landing page.  
**Change:** Surface the referral mechanic: "Invite a peer in active search. Both of you get an extra free month." One line. Turns acquisition from linear to looped and signals community without requiring community infrastructure.  
**File:** LandingPage.tsx — below situation cards or near pricing CTA

---

## Section 11 — Executive Persona Pages

**E-A-36 — Ambitious VP IT (Executive User Council)**  
The /for-vp page exists and isn't findable from landing page navigation. The "I'm ready for the next seat" situation card matches but routes to generic signup.  
**Change:** Add one sentence under Level-Calibrated AI: "If you're making the VP-to-CIO move, every prep brief, every outreach draft, and every strategy output is calibrated to the altitude of the role you're moving toward — not the one you're leaving." Link /for-vp from the nav or the situation card.  
**File:** LandingPage.tsx features section; nav

---

**E-A-37 — Sitting CIO (Executive User Council)**  
The Monitor plan description frames monitoring as search preparation. The optionality hedger isn't searching — they're hedging.  
**Change:** Add subtext to the Monitor plan or a new situation card: "I'm not searching. I just want to know what's out there before I have to." Different emotional state than urgency. Serve it explicitly.  
**File:** PricingSection.tsx Monitor card description; or LandingPage.tsx SITUATIONS array

---

**E-A-38 — Displaced Technology Executive (Executive User Council)**  
No time-to-value messaging anywhere. A displaced exec's first question is "what happens on day one."  
**Change:** Add a 3-step onboarding preview near the primary CTA: "Add your target companies. Upload your resume. Your first briefing is ready by morning."  
**File:** LandingPage.tsx hero section, near CTA buttons

---

**E-A-39 — PE-Backed Transformation Operator (Executive User Council)**  
The /for-pe-partners page exists and is linked from nowhere on the landing page. No PE-specific language appears on the main page.  
**Change:** Add PE/transformation to the persona cross-links. Add one signal-specific line in the Intelligence Scanner section: "8-K filings and funding events surface transformation windows before the search is authorized."  
**File:** LandingPage.tsx intelligence section; persona cross-links

---

**E-A-40 — Burned-Out Technology Executive (Executive User Council)**  
The features section makes the product sound active and demanding. It doesn't reassure the burned-out user that minimal daily effort is all that's required.  
**Change:** Add one line near the features section: "Set it up once. The briefing comes to you." First onboarding step should be add one company, not twelve.  
**File:** LandingPage.tsx features section; onboarding flow

---

**E-A-41 — Executive Recruiter (Executive User Council)**  
The /for-search-firms page exists and is linked from nowhere obvious. A recruiter landing on the main page would immediately feel it isn't for them.  
**Change:** Add "Search firms and executive coaches" to the persona cross-links at the bottom of the page. Add a footer band pointing to /for-search-firms: "Built for search firms that want candidates who walk in prepared."  
**File:** LandingPage.tsx persona cross-links; footer

---

## Section 12 — Growth and Network Effects

**E-A-42 — Brian Balfour (Brand and Scaling Council)**  
The referral mechanic exists in the codebase but is surfaced nowhere.  
**Change:** Add the referral program line to the landing page (see E-A-35). Then ensure the referral mechanic is actually functional and tracked.  
**File:** src/app/api/referral/ (verify exists); LandingPage.tsx

---

**E-A-43 — Andrew Chen (Brand and Scaling Council)**  
The platform has no visible network effects. User data doesn't benefit other users. No signal that more users makes the product better for everyone.  
**Change:** Name one network effect: "When executives tracking the same company cluster around the same signals, patterns surface faster. 200 executives are watching Accenture right now."  
**See also:** Tension T-5 — aspirational claim requires real data or honest framing.  
**File:** LandingPage.tsx — intelligence section or stats bar

---

**E-A-44 — Shreyas Doshi (Additional Future Members)**  
The site serves 8 situation cards, 8 persona pages, a partner channel, a concierge tier, and a B2B channel simultaneously. No stated wedge.  
**Change:** Name the ICP you are optimizing for right now — even internally. Everything else builds around that core. The site currently serves everyone equally, which means no one experiences it as built for them first.  
**File:** Internal decision — affects page copy, not a single file change

---

## Section 13 — Partner Ecosystem

**E-A-45 — Bob Moore (Business Development Council)**  
The /for-search-firms and /for-outplacement pages exist but no partner can find their door in.  
**Change:** Build a visible partner portal with a named value prop for each referral category — executive coaches, retained search firms, PE talent teams, outplacement firms. Show the referral economics. Surface "For Partners" as a nav item or footer band.  
**File:** New src/app/partners/page.tsx; LandingPage.tsx footer/nav

---

**E-A-46 — Jay McBain (Business Development Council)**  
The site assumes the executive already found you. It doesn't plan for being sent to you.  
**Change:** Create landing pages designed for warm referrals: "Why coaches recommend Starting Monday" and "Why PE talent teams use Starting Monday." These seed the ecosystem. Right now the site is a direct-acquisition machine with no partner-led motion.  
**File:** New src/app/for-coaches/page.tsx; src/app/for-pe-teams/page.tsx

---

## Section 14 — Security, Trust, and Governance

**E-A-47 — Scott Kupor / Mary O'Carroll (VC / HR Councils)**  
Senior executives at F500 companies are fielding AI governance questions from their own legal teams.  
**Change:** Add one paragraph on /security addressing AI classification and data handling under CCPA, EU AI Act, and enterprise AI procurement requirements. Show Starting Monday has thought through the same questions executives are fielding from their boards.  
**File:** src/app/security/page.tsx (or wherever the security page lives)

---

**E-A-48 — Liz Fong-Jones (SRE Council)**  
The trust section makes a privacy promise. The reliability posture behind that promise is undocumented.  
**Change:** Add a public incident response policy on /security: "If we detect unauthorized access to your data, here is what we will do and within what timeframe." Close the loop between the landing page trust promise and the operational posture behind it.  
**File:** src/app/security/page.tsx

---

**E-A-49 — Jeff Bezos (Additional Future Members)**  
Some sections serve the product (features, stats) instead of the customer's outcome.  
**Change:** Write the future press release as a design constraint — not to publish. "An executive used Starting Monday to find the role before it was posted. Here's what happened on each of the 11 days." Audit every landing page section against that story. Cut what doesn't serve it.  
**File:** Internal exercise; affects page.tsx and LandingPage.tsx

---

## Section 15 — SRE and Technical Foundations

**E-A-50 — Kent Beck (Software Council)**  
Every production deploy conflates structural and behavioral changes — no staging gate means every commit is simultaneously structural and behavioral.  
**Change:** Wire the existing Railway staging service to CI. Separate structural from behavioral testing. The staging infrastructure exists; it isn't connected.  
**File:** .github/workflows/ or Railway service config; see also project memory on E4.1 staging

---

**E-A-51 — Martin Fowler (Software Council)**  
Architecture decisions aren't documented beyond the council files. Technical debt is managed by convention, not by record.  
**Change:** Document the two or three architecture decisions that most constrain future change — why the worker is a separate service, why Supabase RLS is the auth boundary, what the scaling assumptions are. Cheap to write, expensive to reconstruct when a new contributor is changing something they don't fully understand.  
**File:** docs/architecture/ directory (new files)

---

**E-A-52 — Charity Majors (SRE Council)**  
Observability means being able to ask novel questions about production behavior. Whether the PostHog data is being queried is unknown.  
**Change:** Add user-action instrumentation to the five most critical conversion moments — situation card click, demo click, CTA click by scroll depth, pricing toggle, plan selection. Build one dashboard that tells you where the funnel breaks and why.  
**File:** LandingPage.tsx (add analytics events); PostHog dashboard config

---

**E-A-53 — Gene Kim (SRE Council)**  
The value stream has a gap between user production behavior and the engineering backlog.  
**Change:** Create one explicit feedback loop from production signal to product decision: "Three users flagged the same prep brief gap this week. That became a prompt change on Thursday." That's the DevOps third way — continual learning from production.  
**File:** Process/workflow change; possibly a Slack/Linear integration

---

**E-A-54 — Betsy Beyer (SRE Council)**  
No SLOs defined. No error budget. No staging gate. Playwright runs locally only. The reliability posture is "deploy and watch Sentry."  
**Change:** Define one SLO for the most critical path — prep brief generation at 95th percentile under 10 seconds. Set up an alert when it degrades. Wire Playwright to CI against staging. Minimum posture needed before enterprise procurement due diligence.  
**File:** .github/workflows/ Playwright config; Sentry alert config

---

**E-A-55 — Satya Nadella (Additional Future Members)**  
The product optimizes for the urgent searcher. The burned-out executive, the optionality manager, and the transformation operator are mentioned but not deeply served.  
**Change:** Extend the product's empathy to career arc: "Starting Monday doesn't just help you find the next role. It helps you understand which role to want." Serve the person, not just the search.  
**File:** LandingPage.tsx features or about section; long-term product roadmap

---

## Tensions — Decision Required

These 10 items have conflicting recommendations or execution risk. Each needs a call before the item enters a sprint.

---

**T-1 — Stats Bar: Partial vs. Full Replacement**  
E-A-21 (Rams/Stancil) says replace only "$0" with "11 days." E-A-22 (Kozyrkov) says replace all three with outcome metrics.  
- **Option A:** Replace only "$0" → "11 days" stat. Lowest risk, two councils aligned. Keep "10+" and "60s."  
- **Option B:** Replace all three with outcome metrics. Higher impact if you have the data. Requires validated numbers.  
- **Option C:** Replace "$0" now. Revisit the other two after you have outcome data from real users.

---

**T-2 — Hero Additions vs. Hero Length**  
The hero was trimmed to 3 sentences. Four members now want to add something:  
- McMahon (E-A-05): visceral cost-of-inaction scenario  
- Bourgoin (E-A-06): emotional isolation acknowledgment  
- Horowitz (E-A-09): name the resistance  
- Braun (E-A-08): safety line near CTA (different placement, less conflicted)  
You can't add all three. Adding McMahon's scenario + Bourgoin's isolation = two additions max.  
- **Option A:** Add McMahon's scenario only (urgency-first).  
- **Option B:** Add Bourgoin's isolation only (anxiety-first).  
- **Option C:** Add both but cut something else from the hero.  
- **Option D:** Put isolation in hero, scenario in the before/after section where the page already handles consequence.

---

**T-3 — Category Claim: "Operating System" vs. "Campaign Infrastructure"**  
Dunford (E-A-10) argues for "operating system." Neumeier (E-A-11) says commit to one — they both can't coexist.  
- **Option A:** "Operating system" — broader, more recognizable frame. Already in title tag.  
- **Option B:** "Campaign infrastructure" — more specific, more defensible in the executive category. Signals discipline over tooling.  
- **Note:** "Operating system" is already in the JSON-LD schema. Switching requires updating metadata.

---

**T-4 — Named Testimonials vs. Confidentiality Promise**  
McCord and Bock (E-A-16) want one named executive testimonial. The core confidentiality value prop says "your search is completely private — we have no relationship with employers."  
- **Option A:** Named testimonial from someone who completed their search (past tense — no longer in active search). The confidentiality promise protects active searchers; completed-search testimonials don't break it.  
- **Option B:** Named testimonial from a coach or recruiter (not an exec in search). Adds credibility without touching the confidentiality frame.  
- **Option C:** Don't pursue named testimonials until you have executives who volunteer post-placement.

---

**T-5 — Andrew Chen's Network Effect Claim**  
"200 executives are watching Accenture right now" (E-A-43) requires real data. If the platform doesn't yet have enough users to support this claim, using it is misleading.  
- **Option A:** Use aspirational copy now, grow into it. Risk: if users check and Accenture has 0 watchers, trust breaks.  
- **Option B:** Wait until real data supports the specific claim. Launch the copy when the numbers are honest.  
- **Option C:** Frame more carefully: "As more executives track the same companies, patterns surface faster." Plant the concept without a specific number.

---

**T-6 — Annie Duke's Probability Claim**  
"60% first interview rate before posting vs. 18% after" (E-A-30) requires validated data or must be framed as an estimate.  
- **Option A:** Use the numbers if you can validate them from your user base or from public research on executive hiring patterns.  
- **Option B:** Frame as directional: "Research on executive placement consistently shows that candidates who reach a company before a search is formalized get first interviews at dramatically higher rates than applicants."  
- **Option C:** Don't use specific percentages until you have internal data to support them.

---

**T-7 — Pricing Card Visual Treatment**  
Chris Do (E-A-28) wants to flip Executive to slate-900 and put orange border on Active. But Active is currently slate-900 and is the plan most likely driving conversion.  
- **Option A:** Flip as Chris Do recommends. Exec gets slate-900 authority; Active gets orange "most popular" border. Risk: Active buyers may feel demoted.  
- **Option B:** Keep current treatment. The slate-900 card already signals "serious product" for the plan most buyers select.  
- **Option C:** Give Executive a distinct treatment (e.g., gradient or border-2) without changing Active. Let both read as premium.

---

**T-8 — Free Profile Grade: Build vs. Remove vs. Explain**  
Zhuo (E-A-31) says explain it or remove it from the nav. Derek (Round 2 grading) wanted to build it out as a full email-gated CTA lead magnet.  
- **Option A:** Build the Profile Grade as a real email-gated tool. Then explain it on the landing page. Highest impact, highest build cost.  
- **Option B:** Remove from nav now. Re-add when it's built and explained.  
- **Option C:** Add a one-line tooltip or nav description ("Get a free AI-scored review of your exec profile").

---

**T-9 — Situation Card Routing: All 8 vs. 2-3 vs. Low-Cost Acknowledge**  
Norman, Barrows, Dunford, Kahneman all want differentiated routing (E-A-33). Building 8 differentiated onboarding flows is significant scope.  
- **Option A:** Route all 8 to fully differentiated onboarding variants. Highest impact, highest build cost.  
- **Option B:** Route only 2-3 highest-urgency cards (displaced exec, VP-to-CIO, burned-out). Other 5 route to generic signup. Medium cost.  
- **Option C:** Pass the selection to the signup page URL param and acknowledge it: "You said [situation]. Here's what week one looks like for you." Low cost, meaningful impact. Don't build differentiated flows yet.

---

**T-10 — Kahneman: Move Situation Cards Immediately After Hero**  
Kahneman (E-A-34) wants cards right after the hero. Current flow: hero → before/after → intelligence scanner → features → situation cards. Moving cards up skips the rational case.  
- **Option A:** Move cards immediately after hero. Trust System 1 to convert. Rational case follows for those who need it. Potentially higher conversion for the majority.  
- **Option B:** Keep current order. The before/after and features sections do real work setting up the value prop before persona selection.  
- **Option C:** A/B test. Ship the current order and the Kahneman order as a split and let conversion data decide.

---

## Item Count

| Theme | Items |
|---|---|
| Cadence & Habit | E-A-01 to E-A-04 (4) |
| Hero Copy | E-A-05 to E-A-09 (5) |
| Category & Brand | E-A-10 to E-A-11 (2) |
| Founder & About | E-A-12 to E-A-15 (4) |
| Social Proof | E-A-16 to E-A-18 (3) |
| Demo & Product Visibility | E-A-19 to E-A-20 (2) |
| Stats Bar | E-A-21 to E-A-23 (3) |
| Pricing & Economics | E-A-24 to E-A-30 (7) |
| Navigation | E-A-31 to E-A-32 (2) |
| Situation Cards | E-A-33 to E-A-35 (3) |
| Executive Persona Pages | E-A-36 to E-A-41 (6) |
| Growth & Network Effects | E-A-42 to E-A-44 (3) |
| Partner Ecosystem | E-A-45 to E-A-46 (2) |
| Security & Governance | E-A-47 to E-A-49 (3) |
| SRE & Technical | E-A-50 to E-A-55 (6) |
| **Total** | **55 items, 10 tensions** |

---

*Tensions require a decision before the item enters a sprint. All 10 are listed with clear options. No item in this epic was combined or summarized — each represents a distinct, actionable change.*
