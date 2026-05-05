# Starting Monday — Product Backlog

Internal document | Updated May 2026

Items here are validated ideas deferred from the active roadmap. Each entry includes the rationale for deferral and the condition that would move it forward.

---

## Data Gravity

### Career Accomplishment Repository

A structured log of accomplishments tied to role, company, and outcome. Used to generate resume versions, strategy briefs, and interview answers. Freetext format initially; structured schema later as usage patterns emerge.

Deferred because: acquisition is the current priority. Repository is a retention and depth feature that requires an established user base to validate.

Move forward when: first 100 paying users are acquired and pre-offer retention is solved. The repository then becomes the next depth investment.

### Company Intelligence Archive

An ongoing per-company intelligence dossier that accumulates scan results, signals, documents, and notes over time. Creates data gravity proportional to monitoring duration.

Deferred because: the archive accumulates automatically as users add companies. The feature work is in surfacing it meaningfully, which is not the current priority.

Move forward when: user base is large enough that average monitoring duration exceeds 6 months. At that point, the archive's richness becomes a differentiating asset worth surfacing explicitly.

---

## Post-Search and Alumni

### Alumni Mode (Reduced Subscription)

A $49/month post-offer tier with passive monitoring of a small company watchlist, quarterly signal digest, and maintenance of the accomplishment repository.

Deferred because: acquisition is the current priority. Alumni mode has high long-term LTV value (returning users convert immediately for second searches) but requires an established user base to generate meaningful alumni volume.

Move forward when: first 100 paying users are acquired, post-completion email sequence is live, and referral volume from completed searches is measurable.

### Competitive Intelligence for Current Role

Monitoring dashboard for employed users — competitor tracking, industry signal digest, executive movement relevant to their current organization. Repositions Starting Monday as an ongoing strategic intelligence tool beyond active search.

Deferred because: requires a fundamental repositioning of the product beyond "search infrastructure." The product's core message needs to be established and proven before introducing an adjacent use case that could confuse it.

Move forward when: core search product has 500+ users and Alumni mode is live. Competitive intelligence then becomes the adjacent retention layer for alumni.

---

## Network and Social

### Confidential Peer Network

An opt-in anonymized network within Starting Monday. Senior professionals connected by industry, function, and target company overlap. No public profiles. Warm introduction mechanics. Threshold for value: approximately 100 nodes.

Deferred because: insufficient user base to create network value. Trust design for this audience is complex and a single confidentiality failure would be damaging. Requires careful product design before building.

Move forward when: 500+ active users, clear opt-in consent architecture designed, and the data infrastructure can support anonymized matching without exposing individual search activity.

### Recruiter Relationship Layer

Feature allowing trusted executive recruiters to connect with their candidates in Starting Monday — shared prep briefs, limited pipeline visibility with explicit consent.

Deferred because: the perception of recruiter access to candidate data is acutely negative for the confidential search persona. Requires a trust architecture that does not currently exist and a user base large enough to make the recruiter value proposition meaningful.

Move forward when: 1,000+ active users, explicit consent mechanics designed, and product-market fit with the B2B channel is validated through the outplacement integration first.

---

## Engagement and Recognition

### Milestone Recognition

Private acknowledgment of search progress — first call booked, company moved to interviewing, offer received. Not a badge system. A brief, respectful acknowledgment tied to the story capture and referral prompt.

Deferred because: the execution risk of feeling performative is high with this audience, and the current priority is acquisition, not engagement depth.

Move forward when: post-completion email sequence is live and the voice for this type of communication is validated with real users.

---

## Pricing

### Persona-Based Pricing Presentation

Showing different pricing tiers based on which persona the user self-identifies with (e.g., the Transformation CIO sees the Executive tier prominently; the Passive Monitor sees Passive first). Reduces pricing complexity perception without reducing tier count.

Move forward when: tier count reaches four or more paid options and conversion data suggests visitors are confused by the pricing page.

### Promotional Discounts

Time-limited or cohort-specific discounts for specific acquisition contexts (alumni partnerships, outplacement referrals, first 100 users). The current position is no discounting on demand, but structured promotional pricing for defined channels is different.

Move forward when: institutional channels are active and a discount structure can be tied to a defined cohort rather than given on request.

### Additional Subscription Tiers

Tiers beyond Passive and Active (Alumni, Competitive Intelligence subscription, Board Positioning). Each requires a distinct value proposition, distinct user segment, and a pricing rationale that does not undermine adjacent tiers.

Move forward when: core tiers have stable conversion rates and the use cases for additional tiers are validated by user research, not by hypothesis.

---

## B2B

### Full Outplacement Integration

White-label or co-branded experience for outplacement partner firms. Bulk seat provisioning, partner admin portal, per-seat monthly revenue model. Target partners: Lee Hecht Harrison, Right Management, Challenger Gray, boutiques.

Deferred from full integration because: enterprise sales cycle is 12-18 months. Procurement, legal, and account management capabilities do not yet exist. Lightweight approaches (see active roadmap) validate demand first.

Move forward when: lightweight outplacement channel produces 20+ paying users and at least one firm expresses intent to formalize the relationship.

### University Alumni Platform Integration

Preferred partner arrangement with business school alumni career offices. Co-branded or co-funded access for alumni cohorts.

Deferred from formal integration because: decision cycle at universities is bureaucratically long. Individual career director relationships are the entry point; formal partnership follows adoption.

Move forward when: career director referral program produces 20+ paying users from at least two schools.

### Recruiter Subscription (B2B)

A recruiter-facing subscription — candidate list management, brief access, milestone visibility. Revenue model: per-recruiter fee, not per-candidate.

Deferred because: distinct product from the candidate-facing application. Requires separate product design, separate go-to-market, and LinkedIn Recruiter as the primary competitive framing.

Move forward when: Recruiter Relationship Layer (candidate-side) is live and recruiter usage is measurable.

---

## Analytics and Visualization

### Internal Analytics Dashboard

A founder-facing dashboard that visualizes the event data collected by the data product infrastructure. Not a third-party analytics tool — a purpose-built internal view that answers the specific questions the product team needs to make decisions.

Key views needed:

- Six-actions completion rate by cohort (signup month, acquisition channel, plan type)
- Trial-to-paid conversion funnel with drop-off at each step
- Signal-to-action conversion rate by signal type (which signals produce outreach within 48 hours)
- Brief quality score distribution over time (does context richness correlate with user rating?)
- Company watch demographics — which industries, company sizes, and geographies are most watched
- Referral source attribution — which acquisition channels produce users who complete all six actions
- Churn prediction signals — what does the event history of a churned user look like vs. a retained user in the first 14 days?

Deferred because: the event logging infrastructure must be live and collecting data before visualization adds value. Building the dashboard before the data exists produces nothing useful.

Move forward when: data product infrastructure sprint is complete and at least 30 days of event data is in the system. At that point, the dashboard is the next sprint.

Implementation notes when built:

- Build as an authenticated admin-only route within the existing Next.js application — not a separate tool
- Use a charting library (Recharts or similar — already common in Next.js stacks) for visualizations
- Source from Supabase directly via server-side queries — no intermediate data warehouse needed at this scale
- PostHog provides supplemental session-level data; the internal dashboard provides cohort and business-level views that PostHog's free tier does not support cleanly

---

## Adjacent Product Candidates

These ideas are strong enough to build but belong in a separate product rather than Starting Monday's core. Starting Monday's data and user relationships provide distribution advantage for launching them.

### Executive Market Intelligence Subscription

A market intelligence product for employed senior executives — competitor tracking, industry signal digest, executive movement relevant to their current role. Different from Starting Monday's search focus: the buyer is an employed executive, not a candidate. Pricing likely $99-149/month. Competes with Bloomberg, industry newsletters, and nothing that does exactly this.

### Board Positioning Platform

Tracks board vacancies, governance changes, and PE board composition shifts. Helps executives build and maintain the relationships and positioning needed for board candidacy. The search is qualitatively different from an executive search — longer timeline, entirely relationship-driven, no postings. Could be built as a feature of the Executive tier or as a standalone product for a narrower, higher-willingness-to-pay audience.

### Confidential Executive Network

A peer-to-peer confidential network for senior professionals in and between searches. No public profiles, no feed, action-oriented connections around shared target companies and industry signals. Different from Starting Monday's core in that it is a social product, not a search infrastructure product. Network effects make it either very valuable or worthless — no middle ground.
