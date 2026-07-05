# First-Visit Experience Review: Visits 1-3

Date: 2026-07-04
Scope: The pages a new user encounters on their first one to three visits to Starting Monday.
Standard of record: docs/landing-page-standard.md (canonical, v1.0) plus the editorial standards in repo memory.
Target sensibility: Ritz-Carlton and Four Seasons service posture. Gucci restraint. Vogue editorial structure.

Evidence labels used throughout, per the repo truthfulness contract:
- Verified (source): confirmed by reading the route source code in this repo on 2026-07-04.
- Verified (research): confirmed against a published external source cited in the Sources section.
- Unverified: hypothesis or rendered-state claim not confirmed by a browser or gate run this turn.

---

## 1. Executive Summary

The site already speaks in a confident, editorial register and holds a consistent dark luxury visual system across every public route. Verified (source). What it does not yet do is behave like a luxury service. A Four Seasons does not hand you a map of the property and wish you luck. It anticipates. The current experience is strongest at the top of the funnel (homepage narrative) and weakest exactly where a luxury brand would invest most: the arrival moment after signup, the first empty dashboard, and the second visit.

Three structural findings:

1. The first ten seconds are well served. The hero communicates the value proposition immediately, which research shows is the single highest-leverage moment of a page visit. Verified (source, research: Nielsen/NN/g).
2. Choice load is un-luxury. Six persona cards on the homepage, nine situation options at signup, six FAQs. Luxury brands present few options with total confidence. The current experience presents many options and asks the guest to self-triage. Verified (source).
3. The arrival experience breaks the spell. After a strong editorial funnel, the new user lands on an empty pipeline table with no concierge moment, no guided first action, and no analytics instrumentation to even know where they stall. Verified (source).

---

## 2. Method

- Full source audit of `/`, `/learn-more`, `/pricing`, `/signup`, `/login`, `/onboarding`, `/dashboard`, `/demo`, `/features`, `/search-firms`, including composed shell components, verbatim copy, section order, imagery, and PostHog instrumentation. Verified (source).
- External research pulled and read this turn: NN/g page-dwell research (Weibull analysis of 205,873 pages), NN/g mobile onboarding component analysis, NN/g instructional video guidelines, Userpilot 2024 activation benchmark report (62 B2B companies). Verified (research).
- Rendered-state checks (visual diff, LCP, a11y) were not run this turn. All rendered claims below are Unverified until the standard gates (`npm run gate:standards:staging`, `npm run ux:landing-standard:strict`) are executed.

---

## 3. Page-by-Page Review, Mapped to the First Three Visits

### Visit 1: Discovery (Homepage → Learn-More or Pricing → maybe Demo)

#### Homepage `/`
Verified (source): Hero reads "Be on the shortlist before the role is posted." with eyebrow "Find roles before they are posted. Meet the decision-makers. Start Monday." and trust line "Private by default. You control every signal and every share."

What works:
- Value proposition lands inside the ten-second window. Research: users decide to leave or stay within roughly 10 seconds; pages that survive 30 seconds earn minutes. The hero passes this test on copy alone. Verified (research: NN/g dwell-time).
- Editorial spine is intact: one narrative, hero → situation → how it works → brief teaser → FAQ. Matches the standard's narrative contract. Verified (source).
- Typography contract holds: Playfair Display headlines, Geist body, orange accent CTAs on slate-950. Verified (source).

What fails the luxury bar:
- Six situation cards is a menu, not a concierge. Vogue does not open with six cover stories. Gucci does not show you six handbags on arrival. Recommend a maximum of three, or one rotating editorial "situation of the moment" with a quiet "see other situations" path. Verified (source) for the current count; the recommendation is judgment grounded in choice-load research.
- Body copy at 1.35-2.24rem serif semibold competes with the H1. Luxury typography is hierarchical and restrained; only one voice speaks loudly. Verified (source) for the current sizing.
- Zero social proof. The FAQ says "built by search leaders" and points to the Evidence Hub, but there is no named human anywhere on the first visit. Ritz-Carlton is a brand built entirely on reputation transferred through people. Verified (source).
- Zero PostHog capture calls on the homepage. We are flying blind on the most important page of the funnel. Verified (source).

#### Learn-More `/learn-more`
Verified (source): H1 "The difference lives in the details." Citation superscripts, comparison table, brief showcase.

What works: This is the most editorially mature page on the site. The citations pattern is a genuine luxury differentiator; it reads like a well-reported magazine feature rather than a landing page. Verified (source).

What fails: The comparison table labeled "Typical spray-and-pray" is beneath the brand's register. Naming the alternative disdainfully is not how Four Seasons talks about Marriott. The comparison content is fine; the label needs the same composure as the rest of the page. Verified (source) for the copy.

#### Pricing `/pricing`
Verified (source): H1 is the single word "Pricing." Body: "30-day free trial. No credit card. Choose based on search intensity, not job-board volume."

What works: The "first-week outcomes by buyer mode" section is excellent. It answers "how do I get value" before the user has paid anything. Verified (source).

What fails: "Pricing" as an H1 is the only generic headline on the site, and it appears at the moment of highest commercial anxiety. This is where the editorial voice should be strongest, not absent. A luxury house frames price as membership and consideration, not as a rate card. Verified (source) for the current copy.

#### Demo `/demo`
Verified (source): Interactive brief generator, five roles against a Salesforce example, streamed output, 5-run limit.

This is the strongest proof asset on the site and it is under-merchandised. The homepage brief teaser exists, but the live demo is not woven into the primary narrative as the first-skepticism-moment proof CTA that the standard requires ("Proof/evidence CTA appears at first skepticism moment, not only at footer depth"). Verified (source).

### Visit 2: Commitment (Signup → Onboarding → First Dashboard)

#### Signup `/signup`
Verified (source): Situation handoff copy varies by entry source (pricing, concierge, motion-signal). Nine situation options, each with tailored first-step copy and CTA. Google/Apple/email auth. `signup_completed` is captured.

What works: The handoff copy ("You are continuing from pricing. You do not need to finalize tier selection right now.") is genuinely anticipatory, the single most Ritz-Carlton moment on the site. Verified (source).

What fails: Nine situation options at the moment of account creation is the heaviest cognitive load in the entire funnel, placed at the most fragile moment. NN/g's onboarding research is explicit that customization questions during onboarding must be brief and only what is needed to start. Verified (source) for the count; Verified (research: NN/g onboarding) for the principle.

#### Onboarding `/onboarding`
Verified (source): 5-7 steps (name, status/timeline, role, three target companies, positioning summary, streamed intel brief, briefing preferences). Low-energy mode skips to companies. Events: `onboarding_started`, `onboarding_step_completed`, `onboarding_first_value_ready` with `under_ten_minutes` flag, `onboarding_nudge_shown` at 8 minutes.

What works: This is a legitimately well-designed activation flow. It matches NN/g's criteria for when onboarding is warranted (user information required, experience tailored to context) and it delivers real value (the streamed intel brief) inside the flow itself, before the dashboard. The `under_ten_minutes` flag shows the team already thinks in time-to-value terms. Verified (source, research: NN/g onboarding).

What fails: Nothing structural. Two refinements: the 8-minute nudge fires without offering a shortcut ("finish the rest later, see your brief now"), and step 5 (positioning summary) is the likeliest abandonment point because it demands the most typing. Verified (source) for the mechanics; the abandonment hypothesis is Unverified until funnel data exists.

#### First Dashboard `/dashboard`
Verified (source): Redirect gates work. Sections: welcome nudge, profile intelligence, pipeline (empty), activity chart (empty), velocity (empty), momentum plan, decision timeline. No first-run overlay, no guided first action, no PostHog instrumentation.

This is the biggest failure of the review. The user has just completed a beautifully choreographed arrival and is shown an empty hotel lobby. Three empty data visualizations on first run actively communicate "you have not done enough yet," which is the emotional opposite of the brand promise. A luxury arrival would be: your first brief is already here, your three companies are already being watched, here is the one thing to do before Monday. Verified (source) for the empty state composition; the emotional read is expert judgment.

### Visit 3: Return (Login → Briefing)

Verified (source): Login redirects to `/dashboard/briefing` by default. The daily brief is the return-visit hook, promised as "a daily three-minute brief and one weekly update."

What works: Routing the returning user straight to the brief, not the dashboard, is exactly right. The brief is the product's ritual, and rituals are what luxury brands sell. Verified (source).

What fails (Unverified, requires session data): There is no instrumentation to know whether visit-2-to-visit-3 return actually happens, at what rate, or whether the brief was consumed. The dashboard and briefing routes have zero PostHog capture. We cannot manage what we do not measure, and right now day-1 and day-7 retention for this funnel is unmeasurable from product analytics.

---

## 4. Luxury and Editorial Assessment

Scored against the sensibility brief (Ritz-Carlton, Four Seasons, Gucci, Vogue):

| Dimension | Current state | Grade |
|---|---|---|
| Voice and copy register | Confident, specific, unhurried on `/` and `/learn-more`; generic on `/pricing` | B+ |
| Typographic discipline | Contract honored; hero body competes with H1 | B |
| Restraint / choice curation | 6 cards + 9 situations + 6 FAQs = department store, not boutique | C |
| Anticipatory service | Signup handoff copy excellent; arrival (dashboard) absent | C+ |
| Photography / art direction | One static sketch image sitewide; no photographic identity | D |
| Proof through people | No named humans, no testimonials, no editor's-letter voice | D |
| Ritual and return | Daily brief concept is strong; unmeasured and unmerchandised | B- |

The gap is not in the words. It is in imagery, curation, and the arrival moment.

---

## 5. Opinion: Visuals and Video

### Visuals
The site currently has one hero image (`/hero-previews/hero-final-locked.png`, a stylized leadership sketch) and two SVG charts. Verified (source). That is not an editorial visual identity; Vogue is a photography brand that happens to contain text. Recommendation:

1. Commission or curate a small photographic system (4-6 images maximum): dark, architectural, human-but-anonymous. Think a hallway at dawn, a hand on a folio, a skyline from a corner office. No stock-photo executives shaking hands. Shot or graded to sit on slate-950.
2. One image per scroll band, not galleries. Editorial pages breathe; each image earns a full-bleed or half-bleed moment.
3. Keep the SVG charts. They are the "reporting graphics" of the magazine metaphor and they carry proof. Restyle captions in the mono micro-label voice.

### Video
My opinion, grounded in the research: do not lead with video, and do not build a hero video. Build one 60-90 second "the brief, made" film placed at the top of the demo/proof section only.

Rationale, all Verified (research: NN/g instructional video study):
- Video must be supplementary to text, never the only path to information. A meaningful share of users avoid video entirely; 26 percent of views on NN/g's own channel run with subtitles.
- Top-of-page videos are the most watched but must be comprehensive; a partial hero video creates expectation debt.
- Duration must be displayed before play, captions are mandatory, and the thumbnail must honestly set style expectations.
- People turn to video when content is complex or multistep, and when reading motivation is fatigued. Our one genuinely multistep, unfamiliar concept is "what a Monday brief is and how it gets made." That is the one video worth making.

Luxury framing: a single, beautifully produced film (think a fashion house's campaign film: quiet, no voice-over hype, captioned) is on-brand. A talking-head explainer or animated SaaS demo reel is not. If we cannot produce it at campaign quality, ship no video; the streamed live demo already outperforms mediocre video as proof.

---

## 6. Industry-Standard Metrics for New-User Learning

Benchmarks and targets, each tied to an instrumentable event:

| Metric | Definition | Industry benchmark | Starting Monday target | Instrument |
|---|---|---|---|---|
| 10-second survival | Visitors still on `/` at 10s | First 10s is peak abandonment; clear value prop is the gate (NN/g) | ≥ 65% of non-bounce sessions reach 30s | New `landing_dwell` events |
| Homepage → signup click-through | CTA clicks / homepage sessions | Typically low single digits for cold traffic; no verified universal number, treat as baseline-and-improve | Establish baseline in weeks 1-2, then +20% | New `landing_cta_clicked` |
| Signup completion | `signup_completed` / signup page sessions | n/a (form-length dependent) | ≥ 60% | Exists (partial) |
| Onboarding completion | Completed step 7 / `onboarding_started` | n/a | ≥ 75%; low-energy path ≥ 85% | Exists |
| Time to first value | `onboarding_first_value_ready` elapsed | "Reduce time to value" is the consensus activation lever (Userpilot) | Median ≤ 8 minutes, `under_ten_minutes` ≥ 80% | Exists |
| Activation rate | New users reaching the activation milestone (first brief viewed + ≥1 company tracked) | Median 37% across 62 B2B SaaS companies; ~36% per Lenny Rachitsky's report; PLG average 34.6% (Userpilot 2024) | ≥ 45% (we are high-intent, niche, personalized) | New `activation_reached` |
| Visit-2 return (D1-D3) | Users who return within 72h of signup | No single verified benchmark; measure and improve | ≥ 50% of activated users | New `briefing_viewed` |
| Week-1 ritual adoption | ≥3 brief views in first 7 days | n/a | ≥ 35% of activated users | New `briefing_viewed` |

All benchmark figures above are Verified (research) where a source is named; targets are proposals for approval.

---

## 7. Devil's Advocate View

Argued as strongly as I can against the direction of this review:

1. "Luxury polish is procrastination. The funnel converts on trust and timing, not photography." The buyer is a displaced or ambitious executive in a hurry. They want signal, price, and privacy answered in one scroll. Every dollar spent on campaign films and photo systems is a dollar not spent on the brief's actual intelligence quality, which is the real product. Gucci sells objects where the aesthetic IS the product; here the aesthetic is packaging.
2. "Reducing choice will reduce conversion." The six situation cards and nine signup situations exist because the audience is genuinely heterogeneous. An urgent laid-off VP and a quiet optionality-tracker need different first sentences. Collapse them to three and you force half your visitors to read someone else's story; personalization research (Userpilot) says segmenting by job-to-be-done raises activation, not lowers it.
3. "The empty dashboard is honest." The product needs the user's companies to produce value. Faking a 'concierge arrival' with pre-populated content risks feeling like a hollow theme-park trick to exactly the skeptical, senior audience we serve, and NN/g itself warns against onboarding theater that does not improve task performance.
4. "Video is a trap for a two-person team." NN/g's own guidance says inconsistent or mediocre video damages expectations. A campaign-grade film costs real money, ages fast as the product changes, and the live streamed demo is already stronger proof. Shipping no video is not a gap; it is discipline.
5. "You have no baseline, so this plan is astrology." With zero homepage and dashboard instrumentation, every prioritization claim in this review is a guess. The only defensible first move is instrumentation and two weeks of data, not a redesign.
6. "Testimonials are impossible in this category." The core promise is confidentiality. No sitting executive will publicly say "I used a stealth job-search tool." Chasing social proof here fights the brand's own privacy positioning.

## 8. Response: Overcoming the Objections

1. Polish vs. procrastination: Partially conceded, and the plan is sequenced accordingly. Phase 1 is instrumentation and copy, near-zero cost. The photographic system is Phase 3, capped at 4-6 images, and exists because the current single-sketch identity is measurably thin against the brand's own canonical standard ("every route must look intentionally part of one product"). We are not choosing packaging over product; we are fixing the arrival moment, which IS product.
2. Choice reduction: The objection conflates curation with deletion. The plan keeps all nine situations but stops presenting them as a wall. Progressive disclosure: show three, tuned by entry source (which the signup page already detects, Verified source), with "more situations" one click away. Personalization is preserved; the shelf display is curated. This is exactly the NN/g guidance: gather only what is needed to start, defer the rest.
3. Empty dashboard: The concierge arrival proposed is not fake. By the end of onboarding the system already possesses three target companies and has already streamed a real intel brief (Verified source). The arrival moment simply carries that real value forward: "Your brief on {Company} is ready. Two more are being prepared." Nothing is fabricated; the existing value is merchandised instead of discarded at the door.
4. Video: Conceded in structure. The plan makes video explicitly optional and gated: it ships only if it can be produced at campaign quality, only at the proof section, only with captions and displayed duration, per the verified NN/g guidelines. Default path is no video, and the live demo gets promoted instead.
5. No baseline: Conceded and adopted as the plan's spine. Phase 1 is measurement. Every subsequent phase carries a kill criterion tied to the baseline. This objection improved the plan; see refinement log, pass 3.
6. Testimonials: Correct that named customer quotes are off-limits. But luxury brands solve exactly this with editorial voice instead of user reviews: a founder's letter (the "editor's letter" pattern), named builders ("built by search leaders who ran their own campaigns", currently anonymous, Verified source), and anonymized composite outcomes with methodology links. Hermès does not publish customer reviews either.

---

## 8.5 The First Mile: Setup as the First Taste of Value (added in revision 6)

Deep source audit of the onboarding and week-1 product surfaces, 2026-07-04. All findings Verified (source) unless noted.

### What a day-1 user actually experiences today

| Setup moment | Current reality | Value felt by the user |
|---|---|---|
| Suggested companies (step 4) | Static persona-seeded lists in onboarding-helpers.ts (csuite: Microsoft, Salesforce, ServiceNow...; vp: Stripe, Snowflake, Figma...) | Low. Generic lists, no "why", no personalization beyond persona pick |
| Resume upload | Claude extracts raw text, stores it, shows "Resume extracted - text populated below." | Near zero. Extraction is not understanding; no reflection back to the user |
| LinkedIn upload | Same: raw text extraction, no synthesis shown | Near zero |
| Unposted roles | Career-page scans run 2x daily only AFTER manual company add; signals page shows company events, not role hypotheses | Zero on day 1. The flagship feature is invisible at the moment of highest attention |
| Relationships | Apollo decision-maker enrichment, scanner-suggested people, and outreach templates all exist, but none is surfaced during setup | Zero during onboarding; discoverable later only by navigating |
| Intel brief (step 6) | Real streamed 3-paragraph brief: company focus, org dynamics, opportunity timing | High. The one genuine value moment in setup, and it works |

### The integrity flag (important)

The positioning says "find roles before they are posted." The mechanism today is reactive: add companies, scan career pages twice daily, detect company-level events (departures, funding, expansion) from the 8-source signal catalog. There is no role-prediction surface. Verified (source). A luxury brand cannot overclaim; the fix is to build the bridge surface (below) that honestly translates real signals into role hypotheses, so the claim becomes experientially true in week 1.

### Would "step 1, step 2, step 3" visuals help?

Yes, in one specific form, and no in another. Verified (research: NN/g onboarding study):

- NO to instructional tutorial cards (deck-of-cards walkthroughs, feature-promotion carousels). NN/g's research found they do not improve task performance and add interaction cost.
- YES to a named value-milestone spine: a visible, numbered path where each step is labeled by the value it unlocks, not the data it collects. Progress indicators and learn-by-doing are the patterns that work. This also matches the Userpilot activation finding that onboarding checklists (Zeigarnik effect) measurably lift activation.

The luxury execution is an itinerary, not a tutorial. A Four Seasons hands you a printed card with your evening planned. The setup spine should read as four numbered promises:

1. Tell us who you are → "Here is what we understood about your positioning."
2. Choose your companies → "We are already watching them. Here is what we see."
3. Meet the people → "Three decision-makers at {Company}, mapped."
4. Your first brief → "Monday, 7:00 am. It is already being prepared."

Each step ends with a payoff screen, never with a bare form submission.

### The "these are great choices for me!" moment

Static persona lists cannot produce that reaction; an executive recognizes a generic list instantly. Three ingredients make it real:

1. Inputs: suggestions derived from the resume/LinkedIn text we already extract (industry, level, function, geography) plus persona, not persona alone.
2. The "why" line: every suggested company carries one specific sentence, sourced from the signal catalog where possible ("CFO departure announced in May; finance leadership bench is thin"). The why line, not the logo, creates recognition.
3. Immediate watching: on acceptance, show the live signal snapshot for that company in the same screen ("what we are already seeing"), pulling from existing signal data. The flagship feature becomes visible at minute five instead of day two.

Present five to seven suggestions with one-tap accept and quiet edit. Blank fields become the fallback, not the default.

### Relationships and communications in week 1

The machinery exists (Apollo enrichment, scanner-suggested people, message templates with two follow-up sequences) but is unmerchandised. Fold it into the itinerary: day 2's single suggested action is "Meet the people": show the three enriched decision-makers for the user's first company and open a pre-structured first note draft. One relationship, one draft, one day. The user experiences building a relationship, not configuring a CRM.

### Choice-load simplification map

| Surface | Today | Proposed |
|---|---|---|
| Homepage situations | 6 cards | 3, entry-source aware, "more situations" behind one tap |
| Signup situations | 9 options | 3 shown + "more"; all tailored copy retained |
| Onboarding role selection | 10 flat role-track options | Grouped into 3 altitude bands, then one refinement |
| Company entry | 3 blank fields + seeds | 5-7 curated suggestions with why-lines, one-tap accept |
| First dashboard | Full nav + 7 sections, 3 empty charts | Itinerary view: today's one action, this week's four steps; full nav progressively revealed |
| Daily guidance | None | Exactly one suggested action per day, always |

---

## 9. The Plan (Version 6, Delivered)

Sequencing rule: measure → words → first mile → arrival → image → film. Each phase has an owner-assignable scope, a success gate, and a kill criterion.

### Phase 1: See Clearly (Week 1-2)
1. Instrument the funnel end to end: `landing_dwell` (10s/30s heartbeats), `landing_cta_clicked`, `situation_card_selected`, `demo_started` / `demo_completed`, `activation_reached` (first brief viewed + ≥1 company tracked), `briefing_viewed` on the dashboard/briefing routes. The dashboard currently has zero capture calls (Verified source).
2. Run the existing standard gates (`gate:standards:staging`, `ux:landing-standard:strict`, mobile visual suite) to convert this review's rendered-state Unverifieds into Verifieds.
3. Two-week baseline read. Publish a one-page metrics baseline against the Section 6 table.
- Success gate: every Section 6 metric has a live number.
- Kill criterion: none; this phase is unconditional.

### Phase 2: Say Less, More Beautifully (Week 2-4)
1. Pricing page: replace the H1 "Pricing" with an editorial headline in the house voice (candidate: "The terms of engagement." or "What membership costs."), keep the existing first-week-outcomes section, add the trust line before the decision point per the narrative contract.
2. Learn-more: rename "Typical spray-and-pray" column to a composed label ("The conventional search").
3. Homepage: reduce hero body copy weight/size so one voice leads; curate situation cards from six visible to three (entry-source aware), with a quiet path to the rest.
4. Signup: same curation, nine situations presented as three plus "more"; keep all tailored first-step copy.
- Success gate: signup completion and homepage→signup CTR at or above baseline after 2 weeks; visual diff within Tier 0 threshold (≤0.5%).
- Kill criterion: if curated cards drop situation-selection rate by >15% vs. baseline, restore density on that surface and keep the typography fix.

### Phase 3: The First Mile (Week 3-7)
The setup flow becomes the first taste of the product, structured as the four-step itinerary from Section 8.5.
1. Positioning reflection: after resume/LinkedIn upload, synthesize and show "what we understood about you" (level, function, positioning angle) instead of raw text alone. First personalization payoff; also feeds company suggestions. The extraction pipeline already exists (Verified source); this adds the synthesis-and-display step.
2. Suggested companies, upgraded: replace static persona lists with resume-plus-persona informed suggestions, each carrying a one-line signal-sourced "why". Five to seven suggestions, one-tap accept. Success is the user thinking "these are great choices for me."
3. Flagship made visible: on company acceptance, render the live signal snapshot for that company in-flow ("what we are already seeing"), reusing existing signal-catalog data. Kick off career-page scans at acceptance, not after dashboard arrival.
4. Roles Forming surface: a new day-1-populated view that translates company signals into role hypotheses with honest confidence language ("VP Engineering departed in June; backfill likely within 90 days"). This is the bridge that makes "roles before they are posted" experientially true without fabricating predictions.
5. Itinerary spine and step visuals: numbered value-milestone progress (the four promises), payoff screen at each step, no tutorial cards. Persistent week-1 checklist on the dashboard.
6. Relationship moment: day 2's suggested action surfaces three Apollo-enriched decision-makers for the first company and opens a structured first-note draft from the existing templates.
7. Choice-load reductions per the Section 8.5 map: signup 9→3+more, role selection grouped to 3 altitude bands, one suggested action per day.
- Success gate: suggested-company acceptance ≥ 60% (proxy for "great choices for me"); onboarding completion ≥ 75%; activation rate ≥ 45%.
- Kill criterion: if resume-informed suggestions do not beat the static lists on acceptance rate within 4 weeks, keep the why-lines and revert the suggestion engine.

### Phase 4: The Arrival (Week 5-8)
1. First-run dashboard state: replace the three empty visualizations with the itinerary view. Your first brief (already generated in onboarding, Verified source) front and center; your companies "now being watched" with their signal snapshots; exactly one suggested action. Empty charts appear only after there is data to chart. Full navigation progressively revealed across week 1.
2. Onboarding nudge upgrade: at 8 minutes, offer the shortcut ("See your brief now, finish setup later") instead of a bare nudge.
3. Step-5 friction reduction: make LinkedIn import the visually primary path, manual paste secondary.
4. Return ritual: after first brief view, one quiet line sets the next appointment ("Your next brief arrives Monday, 7:00 am"). Anticipation is the luxury mechanic.
- Success gate: D1-D3 return ≥ 50% of activated users; week-1 ritual adoption ≥ 35%.
- Kill criterion: if arrival redesign moves activation by <3 points after 4 weeks, stop investing in first-run surface polish and move budget to brief quality.

### Phase 5: The Image System (Week 7-10, budget-gated)
1. Commission/curate 4-6 photographs to the art direction in Section 5. Grade for slate-950. One per scroll band on `/`, `/learn-more`, `/pricing`.
2. Performance budget is non-negotiable: LCP ≤ 2.5s P75 on public Tier 0/1 per the canonical standard; images ship AVIF/WebP with strict sizing.
- Success gate: 10s→30s dwell survival improves vs. Phase 1 baseline; LCP budget holds.
- Kill criterion: any LCP P75 regression beyond budget reverts the offending image the same business day (Tier 0 SLA).

### Phase 6: The Film (Week 10+, optional, quality-gated)
1. One 60-90 second captioned film, "a Monday brief, made," placed at the top of the proof/demo section only. Duration displayed, honest thumbnail, never the sole carrier of any information (all per verified NN/g video guidelines).
2. Ships only if production quality reaches campaign grade. Default outcome is that this phase does not ship and the live demo remains the proof centerpiece, promoted to the first-skepticism position on `/` per the narrative contract.
- Success gate: demo/proof section engagement up, with no drop in CTA progression.
- Kill criterion: if a draft cut would embarrass a fashion house, it does not ship. No B-minus video.

### Standards Refinements Proposed (pending your approval before edits to docs/landing-page-standard.md)
- Add a Choice Curation Contract: no more than three primary options visible per decision moment on Tier 0 routes; additional options behind one intentional interaction.
- Add an Arrival Contract: no Tier 0 authenticated first-run surface may present more than one empty data visualization; first-run must surface at least one piece of already-generated value and exactly one suggested action.
- Add an Imagery Contract: photographic assets must pass the art-direction spec and route-tier LCP budgets; no stock corporate imagery.
- Add a Video Contract: video is supplementary, captioned, duration-visible, comprehensive for its placement, campaign-grade or absent.
- Add a Value-Moment Contract: every setup step on Tier 0 authenticated routes must end with a payoff shown to the user, never a bare form submission; each first-week day surfaces exactly one suggested action.
- Add a Claim-Integrity Contract: any capability stated on public routes must be experientially visible within the first session (the "roles before they are posted" claim requires the Roles Forming surface or softened copy).
- Correct the stale hero copy in repo memory (memory file still records "Be the conversation before the posting"; live source is "Be on the shortlist before the role is posted", Verified source).

---

## 10. Refinement Log (Six Passes)

- Pass 1 (draft): Four workstreams (copy, social proof, dashboard, video) run in parallel. Rejected: no measurement phase, no sequencing, testimonial workstream ignored the privacy positioning conflict.
- Pass 2: Added the metrics table and activation benchmarks; made video its own phase. Rejected in part: still assumed testimonials were obtainable; devil's advocate objection 6 forced replacement with editorial-voice proof (founder's letter, named builders, anonymized composites).
- Pass 3: Devil's advocate objection 5 ("no baseline, astrology") adopted wholesale: instrumentation promoted to Phase 1 and made unconditional; every later phase given a success gate tied to baseline. This is the largest structural change across the five passes.
- Pass 4: Added kill criteria to every phase (the standard's anti-pattern list forbids waiving failures without owner/rationale/expiry; kill criteria are the proactive version). Video demoted from "recommended" to "optional, quality-gated, default no-ship" after re-reading the NN/g video findings against team production capacity.
- Pass 5: Reconciled the plan with the canonical standard's existing gates and SLAs so nothing in the plan invents parallel process: visual diff thresholds, LCP budgets, and Tier 0 same-day SLA are cited from docs/landing-page-standard.md rather than restated ad hoc. Added the standards-refinement proposals as explicit approval items rather than silent edits.
- Pass 6 (delivered): Deep audit of the actual first-mile product surfaces (suggested-company seeding, resume/LinkedIn extraction, signal surfaces, relationship features). Found the flagship "roles before posted" experience invisible on day 1 and the company suggestions static; added Section 8.5, a new Phase 3 (The First Mile) built around four value-milestone steps, the Roles Forming bridge surface, the "great choices for me" suggestion upgrade, a relationship/communication moment in week 1, the choice-load simplification map, and two new standards contracts (Value-Moment, Claim-Integrity). Answered the step-visuals question: itinerary-style value milestones yes, tutorial cards no (NN/g-verified distinction).

---

## 11. Sources

Verified (research), fetched and read 2026-07-04:
1. Nielsen, J. "How Long Do Users Stay on Web Pages?" Nielsen Norman Group, 2011; built on Liu, C., White, R.W., Dumais, S., "Understanding web browsing behaviors through Weibull analysis of dwell time," SIGIR 2010 (205,873 pages, >2B dwell times). Key finding: peak abandonment in the first 10 seconds; pages that hold users ~30 seconds often earn minutes; value proposition must communicate within 10 seconds.
2. Kendrick, A. "Mobile-App Onboarding: An Analysis of Components and Techniques." Nielsen Norman Group, 2020. Key findings: skip onboarding when possible; onboarding is justified when user information is required or the experience is tailored to context; deck-of-cards tutorials did not improve task performance; keep customization brief and explain why data is needed; contextual tips beat upfront tutorials.
3. Harley, A. "Videos as Instructional Content: User Behaviors and UX Guidelines." Nielsen Norman Group, 2020. Key findings: video must be supplementary to text; top-of-page video must be comprehensive; display duration; caption everything (26% of NN/g's own video views use subtitles); split multistep content; thumbnails must set honest style expectations.
4. Korczynska, E. "User Activation Rate Benchmark Report 2024." Userpilot (62 B2B companies). Key findings: average activation 37.5%, median 37%; PLG average 34.6% vs. sales-led 41.6%; consistent with Lenny Rachitsky's reported ~36%; levers: JTBD-personalized onboarding, checklists, friction removal, reduced time to value.

Verified (source), this repository, 2026-07-04: route audits of src/app/page.tsx and LandingPage.tsx, learn-more, pricing, (auth)/signup and login, onboarding/onboarding-form.tsx, (dashboard)/dashboard/page.tsx, demo, features, search-firms; PostHog capture inventory; onboarding event API.

Unverified pending gate runs: rendered visual parity, live LCP/CLS/INP, current funnel conversion numbers.
