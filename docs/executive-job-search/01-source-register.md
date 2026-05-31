# Executive Job Search Source Register

Updated: 2026-05-31
Purpose: verified source stack for executive job-search behavior modeling.

## Source Tiers

- Tier A: public, directly verifiable source with clear summary text
- Tier B: public source with useful summary text, but narrower methodological detail
- Tier C: accessible but incomplete for direct quotation; used only for directional framing

## Verified Sources Used

### Occupational Taxonomy and Work Activity Structure

1. [BLS Occupational Outlook Handbook: Top Executives](https://www.bls.gov/ooh/management/top-executives.htm)
- Tier: A
- Use: role boundary, entry expectations, travel/availability, succession timing, labor-market openings.
- Key verified signals: top executives plan strategies and policies; travel is common; irregular schedules are common; considerable work experience is expected.

2. [BLS Occupational Outlook Handbook: Financial Managers](https://www.bls.gov/ooh/management/financial-managers.htm)
- Tier: A
- Use: finance-specific transition behavior, diligence style, upside/downside framing.
- Key verified signals: create financial reports, direct investment activities, long-term financial goals; typical background includes finance-related progression and 5+ years of experience.

3. [BLS Occupational Outlook Handbook: Sales Managers](https://www.bls.gov/ooh/management/sales-managers.htm)
- Tier: A
- Use: external-facing search behavior, travel, relationship activation.
- Key verified signals: plan/direct delivery to customer; travel common; sales-rep experience is common entry path.

4. [BLS Occupational Outlook Handbook: Human Resources Managers](https://www.bls.gov/ooh/management/human-resources-managers.htm)
- Tier: A
- Use: people-leadership, talent, and change-management transition behavior.
- Key verified signals: plan/coordinate/direct administrative functions; some travel to recruit employees; office-based work; 5+ years related experience common.

5. [BLS Occupational Outlook Handbook: Computer and Information Systems Managers](https://www.bls.gov/ooh/management/computer-and-information-systems-managers.htm)
- Tier: A
- Use: transformation, systems, and stakeholder translation behavior.
- Key verified signals: plan/coordinate/direct computer-related activities; 15% projected growth; related work experience in tech fields expected.

6. [BLS Occupational Outlook Handbook: Public Relations and Fundraising Managers](https://www.bls.gov/ooh/management/public-relations-managers.htm)
- Tier: A
- Use: narrative, reputation, and influence behavior.
- Key verified signals: enhance public image / coordinate fundraising campaigns; frequent travel to speeches/meetings; many years of experience required.

7. [O*NET Browse by Work Activities](https://www.onetonline.org/find/descriptor/browse/4.A/)
- Tier: A
- Use: work-activity ontology for executive search behaviors.
- Key verified signals: work activities cluster into Information Input, Interacting With Others, Mental Processes, and Work Output.

### Opportunity, Signaling, and Labor-Market Perception

8. [LinkedIn Economic Graph: Opportunity Index 2020](https://economicgraph.linkedin.com/research/opportunity-index-2020)
- Tier: A
- Use: opportunity perception, network activation, age/financial constraint, learning orientation.
- Key verified signals: strong networks matter; only a minority actively seek networking opportunities; job-related opportunity is the top attractor; learning culture matters.

9. [LinkedIn Economic Graph: Skills Gap or Signaling Gap?](https://economicgraph.linkedin.com/research/skills-gap-or-signalling-gap)
- Tier: B
- Use: signaling behavior, résumé/credential translation, cross-market mobility.
- Key verified signals: LinkedIn framed the research as using platform data to examine skills-gap and signaling-gap dynamics in Brazil, India, Indonesia, and South Africa.

### Executive Transition and Decision-Making Guidance

10. [Spencer Stuart: The 4Cs: A framework for career decisions](https://www.spencerstuart.com/research-and-insight/the-4cs-a-framework-for-career-decisions)
- Tier: A
- Use: executive decision criteria and emotional process model.
- Key verified signals: company, challenge, compensation, context; passive candidates need strong pull; decisions are emotional and rational; interviews reveal fit over time.

11. [Spencer Stuart: The CEO Moment](https://www.spencerstuart.com/research-and-insight/the-ceo-moment)
- Tier: A
- Use: CEO transition timing, board communication, transition plan behavior.
- Key verified signals: only a quarter of CEOs say they shared a transition timeline with the board; more than half of former CEOs say transitions were smooth; fewer than 10% took another CEO role.

12. [Spencer Stuart: 5 Pitfalls That Derail CEOs in the First 24 Months](https://www.spencerstuart.com/research-and-insight/five-pitfalls-that-derail-ceos-in-the-first-24-months)
- Tier: A
- Use: early transition derailers and levers.
- Key verified signals: early wins matter; nearly 40% lose board confidence midway through year two; five predictable traps include talent delays, insufficient momentum, weak activation, board mismanagement, and personal-transition neglect.

### Additional Research Stack Not Yet Fully Extracted

13. APA PsycNET record: [record 2008-10055-015](https://psycnet.apa.org/record/2008-10055-015)
- Tier: C
- Use: directional academic source in search behavior / transition psychology.
- Status: accessible metadata page only; deeper abstract extraction blocked by site controls.

## Evidence Rule

- Core product logic should prefer Tier A/B findings.
- Tier C may inspire hypotheses but should not drive default product behavior without independent confirmation.

## Refresh Loop

- The verified source catalog is refreshed weekly by the internal cron job at `/api/cron/executive-research-refresh`.
- The cron job stores current snapshots in the internal executive research library and records a run history entry.
