# Coach and Outplacement Gap Analysis Report (2026-06-15)

Owner: Product Strategy
Status: draft
Last reviewed: 2026-06-15
Source of truth: no

## 1) Objective

Compare the attached research documents against what Starting Monday already has in product, public positioning, trust materials, and partner workflows.

Goal:
- close the gap between persona pains and what Starting Monday actually delivers
- reduce mismatch between marketed promise and real product capability
- prioritize the work that makes coaches and outplacement teams feel that Starting Monday is a complete solution for executive-transition support

This report uses five relevant synthetic council members:

1. Michael Bungay Stanier
2. Rich Litvin
3. David Peterson
4. John Morgan
5. Meredith Oliva

Why these five:
- Stanier is the best lens for day-to-day coach workflow and between-session behavior design.
- Litvin is the best lens for premium coach offer design and value clarity.
- Peterson is the best lens for repeatable, enterprise-scale coaching systems.
- Morgan is the best lens for outplacement operating model, cohort packaging, and sponsor-facing viability.
- Oliva is the best lens for claims discipline, confidentiality, procurement, and legal trust.

## 2) Material Reviewed

Primary research inputs:
- [docs/coach-and-outplacement-persona-deep-dive-2026-06-15.md](c:/Users/roths/startingmonday/docs/coach-and-outplacement-persona-deep-dive-2026-06-15.md)
- [docs/executive-coaches-market-research-2026-06-14.md](c:/Users/roths/startingmonday/docs/executive-coaches-market-research-2026-06-14.md)

Current Starting Monday surfaces reviewed:
- [src/app/for-coaches/page.tsx](c:/Users/roths/startingmonday/src/app/for-coaches/page.tsx)
- [src/app/for-coaches/page-content.ts](c:/Users/roths/startingmonday/src/app/for-coaches/page-content.ts)
- [src/app/for-coaches/economics/page.tsx](c:/Users/roths/startingmonday/src/app/for-coaches/economics/page.tsx)
- [src/app/for-coaches/trust-pack/page.tsx](c:/Users/roths/startingmonday/src/app/for-coaches/trust-pack/page.tsx)
- [src/app/for-coaches/faq/page.tsx](c:/Users/roths/startingmonday/src/app/for-coaches/faq/page.tsx)
- [src/app/for-outplacement/page.tsx](c:/Users/roths/startingmonday/src/app/for-outplacement/page.tsx)
- [src/app/for-outplacement/economics/page.tsx](c:/Users/roths/startingmonday/src/app/for-outplacement/economics/page.tsx)
- [src/app/for-outplacement/trust-pack/page.tsx](c:/Users/roths/startingmonday/src/app/for-outplacement/trust-pack/page.tsx)
- [src/app/for-outplacement/runbook/page.tsx](c:/Users/roths/startingmonday/src/app/for-outplacement/runbook/page.tsx)
- [src/app/for-outplacement/operating-scorecard/page.tsx](c:/Users/roths/startingmonday/src/app/for-outplacement/operating-scorecard/page.tsx)
- [src/lib/persona-routes.ts](c:/Users/roths/startingmonday/src/lib/persona-routes.ts)
- [src/app/(dashboard)/dashboard/coach/page.tsx](c:/Users/roths/startingmonday/src/app/(dashboard)/dashboard/coach/page.tsx)
- [src/app/(dashboard)/dashboard/coach/[clientId]/page.tsx](c:/Users/roths/startingmonday/src/app/(dashboard)/dashboard/coach/[clientId]/page.tsx)
- [src/components/coach/client-data-view.tsx](c:/Users/roths/startingmonday/src/components/coach/client-data-view.tsx)
- [src/components/client/coach-access-manager.tsx](c:/Users/roths/startingmonday/src/components/client/coach-access-manager.tsx)
- [src/lib/outplacement-cohort-model.ts](c:/Users/roths/startingmonday/src/lib/outplacement-cohort-model.ts)
- [src/app/case-studies/page.tsx](c:/Users/roths/startingmonday/src/app/case-studies/page.tsx)

Supporting strategy artifacts:
- [docs/coach-council-epic.md](c:/Users/roths/startingmonday/docs/coach-council-epic.md)
- [docs/strategy/competitive-positioning-partner-pilot-playbook-2026-06-07.md](c:/Users/roths/startingmonday/docs/strategy/competitive-positioning-partner-pilot-playbook-2026-06-07.md)
- [docs/content/executive-coach-products-experts-council.md](c:/Users/roths/startingmonday/docs/content/executive-coach-products-experts-council.md)
- [docs/content/executive-coaching-synthetic-council.md](c:/Users/roths/startingmonday/docs/content/executive-coaching-synthetic-council.md)
- [docs/content/outplacement-expanded-synthetic-council-2026-05-28.md](c:/Users/roths/startingmonday/docs/content/outplacement-expanded-synthetic-council-2026-05-28.md)

## 3) Executive Summary

Starting Monday is stronger than the raw research docs assume in four areas:

1. It already has distinct public surfaces for coaches and outplacement.
2. It already has real coach workflow product surfaces, not just landing-page copy.
3. It already has partner-oriented trust, economics, runbook, and scorecard artifacts for outplacement.
4. It already has a permission-based coach access model and a useful coach command center.

But the current state still falls short of the research ambition in the places that most determine whether buyers believe this is a complete solution:

1. Persona breadth is narrower than the research model.
2. The product is strongest for active-search coaching, weaker for quiet-search, long-horizon board work, and post-landing continuation.
3. The outplacement story is more complete than the visible outplacement product proof.
4. Named proof, coach peer proof, sponsor proof, and claims discipline are not yet strong enough.
5. Several public trust and compliance claims are materially stronger than what the reviewed repo surfaces substantiate.

Bottom line:

Starting Monday is not starting from zero. It already has the skeleton of a complete coach and outplacement operating system. The main gap is no longer basic positioning. The main gap is moving from a strong marketing and pilot-ops concept into a more complete, persona-specific, evidence-backed, and visibly productized system.

## 4) What Starting Monday Already Has

### 4.1 Coach channel strengths

Current coach strengths are real and substantive:

- Coach-specific landing, pricing, trust, and FAQ surfaces exist and are more mature than a typical early-stage B2B motion.
- The public coach story clearly frames Starting Monday as an operating layer that complements coaching rather than replacing it.
- The coach dashboard already includes a multi-client command center, risk scoring, stale-data visibility, upcoming sessions, and action queue views in [src/app/(dashboard)/dashboard/coach/page.tsx](c:/Users/roths/startingmonday/src/app/(dashboard)/dashboard/coach/page.tsx).
- The per-client coach workspace already includes scorecards, companies, signals, briefs, weekly review artifacts, next action tracking, and a session prep snapshot shape in [src/components/coach/client-data-view.tsx](c:/Users/roths/startingmonday/src/components/coach/client-data-view.tsx).
- The client-controlled coach access system is real, permission-based, and logged in [src/components/client/coach-access-manager.tsx](c:/Users/roths/startingmonday/src/components/client/coach-access-manager.tsx).

This matters because the current product already supports the core promise for the independent coach and transition specialist persona: less context rebuild, better session prep, clearer between-session follow-through.

### 4.2 Outplacement channel strengths

Current outplacement strengths are also significant:

- Public outplacement positioning is segmented and commercially serious in [src/app/for-outplacement/page.tsx](c:/Users/roths/startingmonday/src/app/for-outplacement/page.tsx).
- Outplacement economics, governance, runbook, and operating scorecard pages exist and are coherent.
- The repo contains downloadable operator pack artifacts in [public/downloads/outplacement-pilot-operator-pack.md](c:/Users/roths/startingmonday/public/downloads/outplacement-pilot-operator-pack.md), [public/downloads/outplacement-pilot-runbook.md](c:/Users/roths/startingmonday/public/downloads/outplacement-pilot-runbook.md), and [public/downloads/outplacement-counselor-enablement-kit.md](c:/Users/roths/startingmonday/public/downloads/outplacement-counselor-enablement-kit.md).
- There is a real cohort model and sponsor snapshot data shape in [src/lib/outplacement-cohort-model.ts](c:/Users/roths/startingmonday/src/lib/outplacement-cohort-model.ts).

This means the outplacement motion already has solid paper infrastructure for practice leaders, program operations, counselor leads, and procurement.

### 4.3 Strategic and content strengths

The repo already understands several correct truths from the new research:

- Coaches are not a single market.
- Outplacement needs governance-first packaging.
- Trust boundaries matter.
- Pilot packaging must be explicit.
- Session strategy-time and context rebuild are the right operating pains to lead with.

Those ideas are visible in [docs/coach-council-epic.md](c:/Users/roths/startingmonday/docs/coach-council-epic.md), [docs/strategy/competitive-positioning-partner-pilot-playbook-2026-06-07.md](c:/Users/roths/startingmonday/docs/strategy/competitive-positioning-partner-pilot-playbook-2026-06-07.md), and the coach and outplacement public pages.

## 5) Gap Analysis by Persona and Need State

### 5.1 Independent executive coach

Status: mostly covered

Needs from research:
- shared visibility between sessions
- reduced context rebuild
- narrative and prep support
- simple admin model
- preserved trust and coach primacy

What exists now:
- shared coach-client workflow view
- signals, briefs, weekly review, next action
- coach dashboard and client access controls
- public messaging that strongly reinforces "support, not replacement"

Main gaps:
- no named coach proof with before/after session outcomes
- no simple ROI tool tied to hours saved and additional client capacity
- no explicit client confidence trend surfaced as a first-class artifact

### 5.2 Boutique firm coach partner

Status: partially covered

Needs from research:
- standardized coaching quality without flattening craft
- shared scorecards across coaches
- cohort and book-of-business visibility
- firm-level proof assets

What exists now:
- pricing path for team coach and partner lane
- coach command center and shared client views
- some persona-aware content in [src/app/for-coaches/page-content.ts](c:/Users/roths/startingmonday/src/app/for-coaches/page-content.ts)

Main gaps:
- no visible firm-level admin or partner-level portfolio view above the individual coach command center
- no coach-team analytics for adoption variance, session-yield variance, or client cohort comparison
- no firm operations page comparable to outplacement’s runbook and operating scorecard depth

### 5.3 Enterprise-sponsored coach cohort lead

Status: partially covered in messaging, weak in visible proof

Needs from research:
- governance-safe rollout
- standard metric dictionary
- repeatable reporting
- sponsor confidence and legal safety

What exists now:
- trust pack language and role boundaries
- outplacement-style governance artifacts that could be adapted

Main gaps:
- coach channel does not yet show a sponsor-ready metric dictionary or enterprise review packet
- coach public materials still read more like small-practice acquisition than enterprise coaching system packaging
- no clear coach-cohort governance dashboard is visible in current reviewed product surfaces

### 5.4 Search-affiliate transition coach

Status: meaningfully under-covered

Needs from research:
- short intense prep windows
- stakeholder-specific interview arcs
- retained-search-adjacent trust boundary
- proactive visibility into real interview movement

What exists now:
- strong prep-brief infrastructure and session-prep framing

Main gaps:
- no dedicated persona route or message for search-affiliate coaches
- no explicit integration with search-stage workflow, panel prep structure, or negotiation handoff
- no dedicated proof or examples for retained-search-adjacent usage

### 5.5 Board positioning and governance coach

Status: lightly acknowledged, not complete

Needs from research:
- multi-quarter or multi-year rhythm
- board narrative continuity
- governance signal tracking
- relationship maintenance without weekly urgency

What exists now:
- page content mentions board and long-horizon use in limited form
- prep and company signal infrastructure could support parts of this

Main gaps:
- no dedicated board workflow package
- no long-horizon cadence templates surfaced publicly or in reviewed coach UI
- no explicit board-composition, committee-fit, or relationship-continuity operating model

### 5.6 Confidential in-role transition coach

Status: partial

Needs from research:
- confidentiality-safe monitoring
- low-visibility momentum
- controlled access and careful language

What exists now:
- coach trust pack emphasizes client control and no recruiter-side sharing
- private workflow and shared access model support the confidentiality story

Main gaps:
- no dedicated quiet-search workflow framing on the coach pages
- no explicit guardrails for low-visibility target tracking, relationship warming, and selective signal review
- current copy leans more active-search than optionality mode

### 5.7 Outplacement practice leader

Status: well positioned, incompletely proven

Needs from research:
- better cohort outcomes without headcount growth
- sponsor confidence
- differentiation and scalable economics

What exists now:
- strong outplacement economics page
- pilot packaging, scorecards, and governance language
- cohort model and downloadable artifacts

Main gaps:
- no visible named case study with sponsor-facing before/after metrics
- no public ROI calculator tied to placement speed, counselor efficiency, and renewal story
- no visible live product screen showing partner-level cohort command view

### 5.8 Program operations director

Status: strongly covered in artifacts, partially productized

Needs from research:
- workflow architecture
- escalation rules
- data completeness and reporting reliability

What exists now:
- runbook, operator pack, operating scorecard, trust pack, economics pages

Main gaps:
- public materials are strong, but visible product proof of ops workflows appears thinner than the documents imply
- no directly reviewed admin route showing cohort exception queues, reporting latency, or implementation health

### 5.9 Counselor lead and counselor / transition advisor

Status: counselor lead partly covered, front-line counselor under-covered

Needs from research:
- what-changed summary before sessions
- intervention guidance
- emotional-state-aware support without admin overload
- session yield improvement

What exists now:
- downloadable counselor enablement kit
- pre-session snapshot data shape in coach client data view
- role boundary messaging

Main gaps:
- front-line counselor persona is not first-class in route structure
- emotional-state and confidence trend support are weakly surfaced in live product
- there is no visible counselor-native UI distinct from coach UI

### 5.10 Procurement and legal reviewer

Status: surfaced, but credibility risk exists

Needs from research:
- claims discipline
- retention, deletion, permissions, and legal boundaries
- board-safe reporting and no-custom pilot scope

What exists now:
- outplacement trust pack is strong structurally
- coach trust pack is directionally good

Main gaps:
- coach FAQ contains claims that are stronger than what the reviewed repo substantiates, especially SOC 2 Type II, HIPAA-grade language, and NDA-ready diligence assertions in [src/app/for-coaches/faq/page.tsx](c:/Users/roths/startingmonday/src/app/for-coaches/faq/page.tsx)
- this is not just a content issue; it is a trust-risk issue

### 5.11 Employer-side CHRO / sponsor liaison

Status: largely absent as a dedicated motion

Needs from research:
- sponsor-safe outcomes summary
- program risk visibility
- easy-to-understand business case

What exists now:
- outplacement pages indirectly speak to sponsor needs

Main gaps:
- no dedicated CHRO/sponsor page
- no sponsor narrative built around retention of dignity, transition credibility, and board-safe reporting
- no sponsor-targeted case study or executive summary route

### 5.12 Need-state gap summary

By journey phase, Starting Monday is strongest in:
- active search execution
- session prep
- signals and pipeline visibility
- pilot packaging

It is weaker in:
- pre-search optionality mode
- long-horizon board and quiet-search management
- post-landing continuation and 30/60/90 onboarding support
- sponsor-facing and counselor-facing first-class surfaces
- evidence rigor and claims discipline

## 6) Core Gap Themes

### Gap 1: Persona coverage is still narrower than the new research model

The new persona deep dive argues for at least eight coach sub-personas and six outplacement roles. The current public route structure covers only a subset directly. Some are implied, but not fully addressed.

Implication:

Starting Monday currently feels like a strong solution for active-transition coaches and outplacement operators, but not yet a complete solution for every relevant coaching and transition persona.

### Gap 2: Product depth is uneven across the executive journey

The product and messaging are strongest during active search. They are weaker before the search becomes explicit and after a landing occurs.

Implication:

The new research correctly frames executive transition as a three-state system:
- pre-search optionality
- active campaign
- post-landing compounding

Starting Monday today feels much closer to a strong active-campaign system than a full transition lifecycle system.

### Gap 3: Evidence and trust are the main conversion bottlenecks now

The repo already contains enough positioning. The bigger problem is that several high-value claims are not backed with visible, specific, named, or contract-ready proof.

This shows up in three ways:

1. Named coach peer proof is weak.
2. Named partner proof is weak.
3. Security and compliance claims look stronger than their visible substantiation.

Implication:

Without fixing evidence quality, the product can feel more complete in words than in reality.

### Gap 4: Some public materials promise operational systems that are only partially visible in product

Outplacement is the clearest example. The documents and pages describe a mature cohort operating system. The repo does include models and artifacts, but the visible reviewed product surfaces do not yet fully prove the same maturity level for actual partner operators.

Implication:

The story is ahead of the product proof. That is manageable for early pilots, but dangerous if not corrected before broader B2B selling.

## 7) Five Council Member Analyses

## 7.1 Michael Bungay Stanier Analysis

### What he would say Starting Monday gets right

Starting Monday correctly understands that the real enemy in executive transition coaching is not lack of insight. It is fragmentation between sessions. The coach page already states the right core promise: sessions should start at decision level instead of context rebuild. That is exactly the right frame.

He would like four things in the current state:

1. The operating-layer positioning is strong.
2. The coach-client shared visibility concept is correct.
3. The weekly review and next-action structures are moving in the right direction.
4. The client-controlled access model protects the coaching relationship rather than subordinating it to software.

He would specifically approve of the fact that the product does not frame itself as an AI coach. It frames itself as workflow support for coaching. That is strategically correct.

### What he would say is still missing

He would argue that the product still needs to make between-session behavior change more concrete and simpler.

From his lens, the platform should not just show information. It should reinforce a repeatable coaching rhythm.

Today the coach surface says the right things, but the system still looks more like a good shared workspace than a fully opinionated coaching operating system.

He would point to these specific holes:

1. No first-class coach ritual engine.
The research document describes a coaching cadence with before, during, after, and between-session structure. The current product exposes parts of this, but does not yet make it feel like a crisp recurring method.

2. Weak emotional-state integration.
The research makes clear that executive transition is emotional as well as operational. The current reviewed product surfaces capture actions and movement much more clearly than confidence, fear, or narrative wobble.

3. Incomplete what-changed compression.
The session prep snapshot data model is promising, but the UX is not yet obviously built around "What changed since last touch?" as the dominant session-opening question.

4. No tight behavior loop for the client.
The system still risks becoming a rich interface rather than a minimal behavior loop: see today’s priorities, act, log movement, prepare for next session.

### What he would want Starting Monday to do

He would want the product to become much more explicit about a coach’s recurring operating loop:

1. Before session: show exactly what changed, what is stuck, and what decision matters.
2. During session: capture one strategic decision, one narrative adjustment, one next action.
3. After session: produce a clean decision memo.
4. Between sessions: reinforce only the smallest set of commitments that preserve momentum.

He would also want a visible confidence or state field. Not because the software should coach feelings, but because the coach needs a lightweight signal when emotional state is starting to degrade execution quality.

### What he would want Starting Monday not to do

1. Do not turn the coach experience into a CRM clone.
2. Do not flood the coach with dashboards that weaken judgment.
3. Do not make session prep a multi-tab scavenger hunt.
4. Do not imply that data visibility alone equals coaching effectiveness.

### His required changes

1. Build a first-class pre-session "what changed" screen as the main coach artifact.
2. Add session artifacts that map directly to the coaching rhythm: decision, risk, narrative shift, next action.
3. Add a lightweight confidence or momentum check-in that helps the coach interpret movement quality.
4. Simplify the experience around one weekly loop instead of many adjacent features.

### Stanier conclusion

Starting Monday is already valuable for coaches. But from Stanier’s lens it is not yet a complete coaching operating system. It is a good workflow substrate that still needs stronger ritual design.

## 7.2 Rich Litvin Analysis

### What he would say Starting Monday gets right

He would recognize that Starting Monday is aiming at a premium coaching problem, not a commodity software problem. The copy repeatedly emphasizes strategic session quality, readiness, and judgment protection. That is directionally right for high-end coaches.

He would also like that the product is not sold as generic career-tech. It is sold as executive-transition infrastructure. That is a more premium category position.

He would probably agree with the assertion that one hour of executive coaching is too expensive to waste on admin and recap. That is an excellent premium-value anchor.

### What he would say is still wrong or underdeveloped

From Litvin’s perspective, the biggest weakness is that the coach offer still mixes too many value stories:

1. practice leverage
2. client outcomes
3. referral economics
4. partner commission
5. product tiers

That muddies the premium promise.

He would say premium buyers do not want to buy a monetization lane. They want to buy a transformation in how they work and how their clients show up.

He would see several issues:

1. The economics page is still too operationally correct and not aspirationally sharp.
2. The named proof is too thin for a premium coach buyer.
3. The current social proof is more platform-style than peer-authority style.
4. The offer feels more pilot-safe than premium-inevitable.

### What he would want Starting Monday to do

He would push for a simpler premium offer hierarchy:

1. Starting Monday makes your clients arrive prepared.
2. That gives you more strategic session time.
3. That lets you support more clients or serve your current clients at a higher level.
4. The economics then become obvious rather than central.

He would want three kinds of proof:

1. a named solo coach proof asset
2. a named boutique firm proof asset
3. a named high-stakes executive transition story where the coach credits the system for preserving strategic depth

He would also want the product to look more like a coach’s elite operating environment and less like a capable internal toolset.

### What he would want Starting Monday not to do

1. Do not lead with commissions when selling to premium coaches.
2. Do not over-explain mechanics before the buyer believes the transformation.
3. Do not use too much generic software language around seat counts and plan packaging without outcome contrast.
4. Do not let anonymity dominate the proof layer.

### His required changes

1. Rebuild the coach offer around transformation, not monetization lane logic.
2. Add named peer proof from coaches by practice type.
3. Add a premium before/after story about what changes in the coach’s week.
4. Make the team and studio packages feel like practice-design decisions, not pricing math.

### Litvin conclusion

Starting Monday has the right raw material for a premium coach offer. The gap is not category direction. The gap is that the premium transformation promise is not yet expressed with enough authority, simplicity, and peer proof.

## 7.3 David Peterson Analysis

### What he would say Starting Monday gets right

Peterson would appreciate that Starting Monday is already thinking about repeatable coaching systems rather than only individual usage. The existence of persona routes, trust-pack thinking, pilot scorecards, and standardized review structures shows the right instinct.

He would especially like:

1. the notion of pilot scorecards
2. the role-boundary framing between platform and coach
3. the early evidence of multi-client coach command views
4. the attempt to make enterprise-sponsored coaching legible

### What he would say is incomplete

He would argue that Starting Monday still lacks enough visible systemization for enterprise or scaled coaching environments.

In the research document, enterprise-sponsored coaching needs:
- metric definitions
- repeatable cohort operations
- intervention thresholds
- sponsor reporting
- consistency across many coaches and many participants

The current outplacement motion is closer to that standard than the coach motion.

For the coach channel, he would flag:

1. No clear firm-admin or program-admin layer.
2. No visible standard coaching plan templates by journey state.
3. No strong evidence that practice leaders can compare coach adoption or client movement across the book.
4. No clear enterprise sponsor reporting artifact for coach-led cohorts.

He would likely say that the product today is credible for an independent coach and promising for a boutique firm, but not yet convincingly complete for enterprise-sponsored coaching programs.

### What he would want Starting Monday to do

He would push for explicit systemization around three constructs:

1. program design
2. cohort monitoring
3. sponsor reporting

That means:

- standard template libraries by transition state
- coach adoption and variance reporting
- explicit intervention triggers
- coach-portfolio and cohort comparisons
- sponsor-ready monthly review outputs

He would also want clearer outcome definitions. The research document names many metrics, but the product and public pages do not yet make it obvious which are operational metrics, which are behavioral metrics, and which are business metrics.

### What he would want Starting Monday not to do

1. Do not overfit the product to solo-coach workflows if enterprise coaching is strategic.
2. Do not claim scale readiness before showing administrative and reporting depth.
3. Do not mix consumer-style subscription logic with enterprise program logic on the same decision path.
4. Do not let the outplacement governance model remain richer than the enterprise coach model if both are target channels.

### His required changes

1. Create a true firm-admin and cohort-admin layer for coach organizations.
2. Publish a standardized coach-program metric dictionary and review cadence.
3. Add template packs for optionality, active search, and post-landing transitions.
4. Add reporting views that let program owners compare adoption, risk, and progress across coaches and cohorts.

### Peterson conclusion

Starting Monday is already structurally aligned with scaled coaching logic, but it is not yet complete enough to sell confidently into enterprise-sponsored coaching programs as a mature system.

## 7.4 John Morgan Analysis

### What he would say Starting Monday gets right

Morgan would likely say the outplacement channel is the most strategically coherent B2B motion in the repo today. The public surfaces correctly lead with cohort consistency, counselor yield, governance, and no-custom pilot packaging. Those are the right buyer themes.

He would specifically approve of:

1. the outplacement operator pack and runbook
2. the staged 30/60/90 governance model
3. the board-safe claim discipline language in the trust pack
4. the repeated message that the software does not replace counselors

This is real progress because most early-stage products pitch generic productivity rather than operational leverage inside a service model.

### What he would say is still missing

Morgan would be less impressed by content alone. He would want proof that the operating model is visible, repeatable, and commercially usable.

He would see these major gaps:

1. The partner-facing story is more mature than the visible product proof.
2. The case studies are still light relative to enterprise buying needs.
3. The product does not yet visibly demonstrate a rich operator console for cohort management.
4. The ROI model is still too directional and not enough tied to sponsor-level outcomes or renewal logic.

He would likely say that the documents look like a good consulting package, but the product still needs more visible operator-grade evidence.

### What he would want Starting Monday to do

He would want three things built or surfaced clearly:

1. A partner operations view showing cohort health, exceptions, and intervention queue.
2. A sponsor pack that turns operational data into executive-safe monthly narrative.
3. Better economic framing around differentiation, counselor leverage, and client outcome quality.

He would also want a cleaner distinction between what is available today versus what is planned. Enterprise buyers punish ambiguity here.

### What he would want Starting Monday not to do

1. Do not pretend the partner operating system is more finished than it is.
2. Do not rely on anonymous or overly directional proof for enterprise selling.
3. Do not bury the no-custom pilot path under too many optional commercial motions.
4. Do not talk like a software startup when the buyer thinks like a service operator.

### His required changes

1. Expose a real or demo outplacement operator console with cohort and intervention visibility.
2. Build a sponsor-facing executive readout artifact with decision-grade KPI narrative.
3. Add stronger case evidence tied to counselor efficiency and cohort consistency.
4. Keep the pilot motion highly templated and visibly non-custom.

### Morgan conclusion

Starting Monday has a credible outplacement concept and surprisingly strong collateral. The remaining gap is not whether the idea is understandable. The gap is whether the product proof is enterprise-serious enough to support the selling motion.

## 7.5 Meredith Oliva Analysis

### What she would say Starting Monday gets right

Oliva would appreciate that the repo is unusually aware of legal and procurement concerns for an early-stage product. The trust packs, legal boundaries, decision-gate language, access controls, and measurement caveats are directionally mature.

She would especially like:

1. permission-based visibility
2. role-boundary language
3. pilot scope discipline
4. explicit claims-policy concepts in the outplacement materials

### What she would say is risky

Her strongest critique would be that the legal seriousness of some public claims exceeds the visible substantiation in the repo.

The clearest examples are in the coach FAQ:
- SOC 2 Type II certified
- HIPAA-grade encryption
- detailed security documentation available under NDA
- language that strongly implies broad compliance maturity

If those things are true, they need a consistent, contract-linked evidence path. If they are not yet true or not fully documented, they should not appear as plain factual assertions.

From her perspective, this is the most important trust gap in the whole coach and outplacement motion because it can damage buyer trust faster than any missing feature.

She would also want tighter governance around:

1. what claims are public
2. what claims require diligence process
3. what language is directional versus verified
4. who owns upkeep of trust materials

### What she would want Starting Monday to do

She would demand a formal claims taxonomy:

1. Verified public claims
2. Diligence-gated claims
3. Directional or pilot-only claims
4. Planned capabilities not yet sold as present fact

She would also want explicit artifact ownership and freshness cadence for:

- trust pack
- security summary
- metric dictionary
- pilot claims sheet
- partner reporting definitions

### What she would want Starting Monday not to do

1. Do not let marketing copy outrun diligence readiness.
2. Do not mix verified and aspirational compliance statements in the same voice.
3. Do not assume procurement buyers will interpret nuance generously.
4. Do not create a trust pack that feels legally serious but operationally ungoverned.

### Her required changes

1. Audit all public trust, compliance, and evidence claims.
2. Remove or downgrade any claim not fully substantiated.
3. Publish a formal public claims policy and internal owner cadence.
4. Tie trust and metric artifacts to named owners and refresh dates.

### Oliva conclusion

The trust architecture is promising, but the claims-governance layer is not yet strong enough. Fixing this is urgent because it affects both conversion and legal risk.

## 8) Cross-Council Synthesis

### What the five members broadly agree on

1. Starting Monday’s fundamental insight is right.
The real pain is not generic job search help. It is preserving strategic quality between sessions and across cohorts.

2. The current product is already useful.
This is not a blank slate. The coach command center, per-client workspace, access model, and outplacement pack all show meaningful substance.

3. The biggest remaining issues are completeness, proof, and trust.
The main question is no longer whether the product has a thesis. It is whether the thesis is fully expressed and credibly evidenced for each persona.

4. Persona-specific packaging must increase.
The research documents are right that different coach and outplacement personas buy for different reasons.

5. Claims discipline is non-negotiable.
Strong legal and evidence hygiene is a prerequisite for enterprise trust and premium coach trust.

### Where they would disagree

1. Premium simplicity vs operational specificity.
- Litvin wants cleaner premium transformation language.
- Morgan and Peterson want deeper operational detail and systems proof.

Resolution:
- use layered packaging
- premium top-line promise for coaches
- operational detail one click deeper
- enterprise proof pack for institutional buyers

2. Broad persona coverage vs focused wedge.
- The research invites broad coverage.
- Peterson and Morgan would warn against selling all segments equally before the product depth exists.

Resolution:
- keep active-transition coaches and outplacement operators as the primary wedge
- add secondary surfaces for quiet-search, board, and sponsor personas without pretending equal maturity

3. Human depth vs dashboard density.
- Stanier worries about over-instrumentation.
- Peterson wants more standardization and reporting.

Resolution:
- keep coach-facing UX simple and ritual-driven
- push heavier reporting and comparison views into admin, partner, or sponsor layers

## 9) Conflict Resolution and Strategic Decision

### Chosen direction

Starting Monday should not try to become all things for all coaching and transition contexts immediately.

It should pursue a two-layer strategy:

Layer 1: primary wedge
- independent and boutique transition coaches
- outplacement practice leaders and program operators
- active-search executive transitions

Layer 2: strategic adjacencies
- confidential in-role search
- board and governance coaches
- enterprise-sponsored coaching cohorts
- CHRO / sponsor-facing reporting

Why this is the right resolution:

1. It preserves focus where product truth is strongest today.
2. It allows persona expansion without breaking credibility.
3. It keeps the research ambition alive while acknowledging current product maturity.

### What Starting Monday should change and why

1. Tighten the public trust and evidence layer.
Why: the biggest credibility risk is overclaiming.

2. Productize the pre-session and weekly coach operating loop more explicitly.
Why: this is the most important lived coach value.

3. Add named peer proof and partner proof.
Why: anonymous proof is insufficient for premium coaches and enterprise operators.

4. Add persona-specific surfaces for the most under-covered high-value personas.
Why: the research shows meaningful differences in needs, economics, and buying logic.

5. Surface real partner/operator product views, not just supporting docs.
Why: outplacement credibility depends on visible operating-system proof.

6. Extend the lifecycle beyond active search.
Why: the research is correct that buyers think across optionality, active transition, and post-landing continuity.

## 10) Prioritized Work to Close Chosen Gaps

## P0: Must do now

1. Run a full claims and trust audit across coach and outplacement public pages.
Why: this is the highest trust-risk item.
Scope:
- review all compliance, security, proof, and outcome claims
- downgrade or remove anything not substantiated
- split verified vs directional vs diligence-gated claims

2. Build and surface a first-class coach pre-session snapshot.
Why: this is the core product promise for coaches.
Scope:
- what changed since last session
- stalled lanes
- overdue actions
- prep reviewed
- one recommended decision for today

3. Add named proof assets.
Why: current proof is too anonymous.
Scope:
- at least 2 named coach stories
- at least 1 named or permissioned outplacement-style partner story
- before/after session-yield or cohort-yield metrics

4. Separate present capability from roadmap on all partner pages.
Why: ambiguity weakens trust.

## P1: Next highest leverage

5. Add persona-specific public pages or modules for:
- search-affiliate transition coach
- confidential in-role transition coach
- board and governance coach
- CHRO / sponsor liaison

6. Add firm-admin and cohort-admin views for coach organizations.
Why: current coach product looks strongest for solo and small-roster use.

7. Create a sponsor-ready reporting pack for both enterprise coaching and outplacement.
Why: sponsor-facing confidence is currently implied more than fully operationalized.

8. Add lifecycle templates for three transition states:
- pre-search optionality
- active campaign
- post-landing 30/60/90

## P2: Important but after the above

9. Add confidence, state, and narrative-drift markers as structured fields.
Why: the research is right that transition quality is not only operational.

10. Add stronger trend reporting in coach views.
Why: current scorecards are useful, but week-over-week change needs to be more explicit.

11. Add a visible outplacement operator console or high-fidelity demo.
Why: the outplacement selling motion currently outpaces the visible product proof.

12. Build a real ROI calculator by persona.
Why: independent coach, boutique firm, outplacement leader, and sponsor do not evaluate value the same way.

## P3: Scale investments

13. Formalize benchmark reports by persona and channel.
14. Add partner-level activation and renewal analytics.
15. Build region-aware legal and governance variants if enterprise distribution broadens.

## 11) Recommended 90-Day Sequence

### Days 1-30

1. Complete claims audit.
2. Ship coach pre-session snapshot UX.
3. Collect and publish first named coach proof assets.
4. Add a capability-vs-roadmap disclosure pattern to partner pages.

### Days 31-60

1. Launch sponsor-ready reporting pack.
2. Add first new persona pages: confidential in-role coach and board/governance coach.
3. Build coach firm-admin comparison view.
4. Build or stage a demo partner operations console for outplacement.

### Days 61-90

1. Launch transition-state templates across optionality, active search, and post-landing.
2. Add structured confidence and narrative-drift fields.
3. Publish second wave of proof assets and one benchmark note.
4. Re-run council review against the updated system.

## 12) Final Recommendation

Starting Monday should not reposition itself again in broad strokes. The core positioning is already mostly correct.

The work now is to make the product and evidence base catch up to the sophistication of the research.

The right near-term ambition is not "say more things to more personas."

It is:

1. prove the current wedge more rigorously
2. productize the coach loop more explicitly
3. strengthen trust discipline
4. add the highest-value missing personas and lifecycle states in a controlled order

If that happens, users will not just understand Starting Monday as an executive-transition tool. They will experience it as a real operating system for the people who guide executives through transition.

## 13) Formal Executive Addendum

### 13.1 Purpose of this addendum

This addendum extends the report from a coach-and-outplacement analysis into an integrated system analysis that also covers the executive user directly.

Without this executive layer, the report remains only half-complete. Coaches and outplacement teams do not buy Starting Monday in isolation. They buy it because they believe it improves the executive journey before search, during active transition, and after landing.

### 13.2 Executive material reviewed

Executive-facing strategy and product surfaces reviewed for this addendum:

- [src/app/for-executives/page.tsx](c:/Users/roths/startingmonday/src/app/for-executives/page.tsx)
- [src/app/executives/personas/page.tsx](c:/Users/roths/startingmonday/src/app/executives/personas/page.tsx)
- [src/lib/persona-routes.ts](c:/Users/roths/startingmonday/src/lib/persona-routes.ts)
- [docs/executive-search-playbook.md](c:/Users/roths/startingmonday/docs/executive-search-playbook.md)
- [docs/staying-sharp-between-searches.md](c:/Users/roths/startingmonday/docs/staying-sharp-between-searches.md)
- [docs/90-day-campaign-plan.md](c:/Users/roths/startingmonday/docs/90-day-campaign-plan.md)
- [docs/business-plan.md](c:/Users/roths/startingmonday/docs/business-plan.md)
- [docs/business-plan-working.md](c:/Users/roths/startingmonday/docs/business-plan-working.md)
- [src/app/case-studies/page.tsx](c:/Users/roths/startingmonday/src/app/case-studies/page.tsx)

### 13.3 What Starting Monday already has for executives

Starting Monday already has a credible executive-transition core.

Executive strengths visible today:

1. Strong active-search positioning.
The public executive page in [src/app/for-executives/page.tsx](c:/Users/roths/startingmonday/src/app/for-executives/page.tsx) clearly frames Starting Monday as mandate-level executive search infrastructure rather than generic job-search help.

2. Good role-route segmentation.
The persona map in [src/lib/persona-routes.ts](c:/Users/roths/startingmonday/src/lib/persona-routes.ts) covers multiple executive role paths including CIO/CTO, VP-to-C-suite, VP technology, CDO, CISO, CPO, and COO.

3. Strong operating guidance for active search.
The playbooks in [docs/executive-search-playbook.md](c:/Users/roths/startingmonday/docs/executive-search-playbook.md) and [docs/90-day-campaign-plan.md](c:/Users/roths/startingmonday/docs/90-day-campaign-plan.md) show a disciplined campaign model with target lists, monitoring, follow-up, prep, and pipeline review.

4. Early support for passive continuity.
The continuity framing in [docs/staying-sharp-between-searches.md](c:/Users/roths/startingmonday/docs/staying-sharp-between-searches.md) correctly identifies the value of staying warm between searches.

5. Some executive proof paths.
The case study pack in [src/app/case-studies/page.tsx](c:/Users/roths/startingmonday/src/app/case-studies/page.tsx) includes several executive scenarios such as CIO quiet search, board-facing CISO transition, and VP-to-CTO movement.

### 13.4 What the executive document changes

The executive market research in [docs/executive-coaches-market-research-2026-06-14.md](c:/Users/roths/startingmonday/docs/executive-coaches-market-research-2026-06-14.md) sharpens one key strategic truth:

Starting Monday is currently much stronger for transition-support executives than for the broader executive market.

That is not a flaw by itself. It is a focus choice. But it means the product should be described internally as:

- strong active executive transition infrastructure today
- partial pre-search optionality support
- partial board-track support
- weak post-landing support as a first-class system

This distinction matters because coaches and outplacement partners will feel the gap if executive lifecycle support remains uneven.

### 13.5 Executive persona and lifecycle gaps

#### Executive gap 1: in-seat optimization is largely outside current product truth

The executive research splits the market into:

1. in-seat optimization
2. transition support

Current Starting Monday is optimized far more for transition support. It should not pretend equal strength in broad in-seat coaching or generic leadership development.

Implication:

Starting Monday should stay narrow and precise. It should target:

- executives approaching transition
- executives in active transition
- executives maintaining optionality after landing

It should not broaden into generic executive development tooling without a separate strategy.

#### Executive gap 2: pre-search optionality mode is under-productized

The passive and optionality story is directionally present, but it is still lighter than the active-search system.

Missing elements:

- low-visibility watch mode with explicit confidentiality posture
- relationship warming cadence as a first-class loop
- accomplishment record capture as a durable executive memory system
- optionality-to-urgency state transition support

Implication:

Starting Monday does not yet fully feel like a complete optionality system for seated executives.

#### Executive gap 3: post-landing continuation is mostly conceptual

The research and executive coaching market note both point to post-acceptance and first-90-days support as meaningful value. The repo has references to 30/60/90 in multiple places, but not yet a visibly integrated post-landing mode.

Missing elements:

- 30/60/90 onboarding narrative as a first-class executive workflow
- stakeholder trust map for new mandate entry
- post-search retrospective and optionality carry-forward
- stay-sharp continuity linked to the new role

Implication:

Starting Monday still feels more like a search operating system than a broader executive career operating system.

#### Executive gap 4: board and governance journey is still incomplete

The product and public docs acknowledge board-track value, but the system is not yet visibly built around long-horizon governance pursuit.

Missing elements:

- board narrative continuity pack
- governance signal watchlist model
- committee-fit preparation workflow
- relationship-cadence continuity over quarters and years

Implication:

Starting Monday can speak to board-track value, but it is not yet a complete board-seeking operating system.

#### Executive gap 5: executive-side decision quality artifacts are still thinner than coach-side workflow framing

Current executive positioning is strong on cadence and search discipline, but weaker on visible artifacts that improve executive self-management directly.

Missing elements:

- executive decision cockpit for active tradeoffs
- confidence and narrative-drift indicators
- mandate-fit calibration views
- post-conversation decision memo as a first-class artifact

Implication:

The system still leans more operational than decisional for the executive user.

### 13.6 Integrated system conclusion

When coaches, outplacement teams, and executives are analyzed as one system, the integrated picture becomes clear:

1. Coaches need a stronger ritual-driven layer.
2. Outplacement needs stronger visible operator-grade product proof.
3. Executives need a more complete lifecycle system spanning optionality, active transition, and post-landing.

The shared product core is still correct:

- signals
- prep
- execution rhythm
- shared visibility
- trust boundaries

But the expression of that core must become more state-aware and role-aware.

### 13.7 Executive recommendations

Executive-side recommendations that should now be considered part of the integrated gap closure plan:

1. Add a true optionality mode for in-role executives.
2. Add a first-class post-landing mode with 30/60/90 support.
3. Add a board and governance continuity workflow.
4. Add executive decision-quality artifacts, not just activity infrastructure.
5. Keep market focus narrow: executive transitions and adjacent optionality, not generic executive development.

## 14) Integrated Delivery Epics, Sprints, and Tickets

The integrated execution plan for coaches, outplacement, and executives is captured in:

- [docs/strategy/integrated-transition-system-gap-closure-plan-2026-06-15.md](c:/Users/roths/startingmonday/docs/strategy/integrated-transition-system-gap-closure-plan-2026-06-15.md)
- [docs/jira/integrated-transition-system-gap-closure-import.csv](c:/Users/roths/startingmonday/docs/jira/integrated-transition-system-gap-closure-import.csv)

Execution model:

1. Epic 1: Trust, Proof, and Claims Discipline Hardening
2. Epic 2: Coach and Counselor Operating System Completion
3. Epic 3: Executive Lifecycle Expansion
4. Epic 4: Partner Operating System and Sponsor Reporting

Sprint sequence:

1. Sprint ITS-1: trust and proof foundation
2. Sprint ITS-2: coach operating loop and public trust remediation
3. Sprint ITS-3: executive optionality and decision cockpit foundation
4. Sprint ITS-4: partner operating system and sponsor reporting
5. Sprint ITS-5: post-landing and board/governance expansion
6. Sprint ITS-6: benchmarks, analytics, closeout, and re-review

Epic 3 implementation guardrails (added for execution quality):

1. Require persona-variant acceptance criteria so in-role optionality, active transition, post-landing, and board-track executives do not receive one generic flow.
2. Require subtle external-positioning guidance for confidentiality-safe branding updates and outreach posture.
3. Include an executive branding profile artifact and a weighted "what matters" profile to drive target-company and offer scoring tradeoff decisions.

## 15) Jira Import Status

Jira-ready import artifact created:

- [docs/jira/integrated-transition-system-gap-closure-import.csv](c:/Users/roths/startingmonday/docs/jira/integrated-transition-system-gap-closure-import.csv)

Current blocker to direct upload from this environment:

- local Jira credentials are not present in the current shell environment
- `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, and `JIRA_PROJECT_KEY` are all missing

That means this session can create the import package, but it cannot directly post issues to Jira from the local script right now.

Available next-step import paths:

1. Run the local import script after setting the four Jira environment variables.
2. Commit and push the CSV so the repo’s Jira import workflow can process it if GitHub secrets are configured.

Recommended command once credentials are available:

`node scripts/jira/import-csv-to-jira.mjs docs/jira/integrated-transition-system-gap-closure-import.csv`
