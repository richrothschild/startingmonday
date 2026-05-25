# Executive Coach Newsletters (ESP-Ready Package)

Purpose: production-ready package for 12 issues using one reusable HTML template and per-issue field payloads.

Audience segment: executive coaches.
Cadence: weekly.
Review requirement before send: Human Writing Editorial Review pass plus Executive Coaching Advisory Panel pass.

## A) Reusable HTML Template (Paste Into ESP Template Builder)

Use these merge fields in your ESP:

- {{first_name}}
- {{subject_line}}
- {{preheader}}
- {{hook}}
- {{short_story}}
- {{journey_insight}}
- {{top_pain_insight}}
- {{council_lens}}
- {{research_tidbit}}
- {{research_source}}
- {{world_class_quote}}
- {{one_action}}
- {{learn_more_links}}
- {{reply_prompt}}
- {{subscribe_cta}}
- {{company_legal_name}}
- {{company_postal_address}}
- {{unsubscribe_url}}
- {{manage_preferences_url}}
- {{privacy_policy_url}}

HTML template:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{subject_line}}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Georgia, 'Times New Roman', serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e5e5;">
            <tr>
              <td style="padding:28px 28px 12px 28px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b6b6b;">
                Starting Monday | Executive Coach Brief
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 8px 28px;font-size:30px;line-height:1.2;font-weight:700;">
                {{subject_line}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px 28px;font-size:16px;line-height:1.6;color:#333333;">
                Hi {{first_name | default: "Coach"}},<br /><br />
                {{hook}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px 28px;font-size:16px;line-height:1.7;">
                <strong>Short Story</strong><br />
                {{short_story}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px 28px;font-size:16px;line-height:1.7;">
                <strong>Journey Insight</strong><br />
                {{journey_insight}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px 28px;font-size:16px;line-height:1.7;">
                <strong>Top Coach Pain Insight</strong><br />
                {{top_pain_insight}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px 28px;font-size:16px;line-height:1.7;">
                <strong>What might these experts say?</strong><br />
                {{council_lens}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px 28px;font-size:16px;line-height:1.7;">
                <strong>Research / Insight Tidbit</strong><br />
                {{research_tidbit}}
                <br /><span style="font-size:13px;color:#666666;"><strong>Source:</strong> {{research_source}}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px 28px;font-size:18px;line-height:1.7;font-style:italic;border-left:4px solid #1a1a1a;">
                {{world_class_quote}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px 28px;font-size:16px;line-height:1.7;">
                <strong>One Action This Week</strong><br />
                {{one_action}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 18px 28px;font-size:16px;line-height:1.7;">
                <strong>Learn More</strong><br />
                {{learn_more_links}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px 28px;font-size:16px;line-height:1.7;">
                <strong>Reply Prompt</strong><br />
                {{reply_prompt}}
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px 28px;font-size:16px;line-height:1.7;">
                <strong>Subscribe</strong><br />
                {{subscribe_cta}}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 24px 28px;font-size:12px;line-height:1.6;color:#666666;border-top:1px solid #e5e5e5;">
                You are receiving this because you opted in to Starting Monday updates for executive coaching strategy.<br />
                {{company_legal_name}} | {{company_postal_address}}<br />
                <a href="{{unsubscribe_url}}" style="color:#1a1a1a;text-decoration:underline;">Unsubscribe</a>
                &nbsp;|&nbsp;
                <a href="{{manage_preferences_url}}" style="color:#1a1a1a;text-decoration:underline;">Manage preferences</a>
                &nbsp;|&nbsp;
                <a href="{{privacy_policy_url}}" style="color:#1a1a1a;text-decoration:underline;">Privacy policy</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

### Global Compliance Mapping (Set Once In ESP)

Configure these merge fields as account-level or template-level defaults so all 12 issues inherit the same compliance values:

- `company_legal_name`: `Starting Monday`
- `company_postal_address`: `[REQUIRED: valid physical mailing address]`
- `unsubscribe_url`: ESP system unsubscribe merge tag or hosted unsubscribe URL
- `manage_preferences_url`: ESP preference-center URL
- `privacy_policy_url`: `https://startingmonday.app/privacy`

Recommended: map `unsubscribe_url` and `manage_preferences_url` to the ESP's native suppression and preference endpoints (not custom forms) to ensure opt-outs are automatically enforced.

## B) Per-Issue Payloads (12 Campaigns)

## Issue 1

- Campaign ID: sm-coach-issue-01
- Emotional angle: grounded concern
- Subject A: What strong executive coaches do before momentum appears
- Subject B: The first 14 days after disruption decide everything
- Preheader: Week-two anxiety is expensive. Here is the discipline model that protects outcomes.
- Hook: Most coaching engagements do not fail in month three. They fail in week two, when anxiety gets louder than process.
- Short story: On Tuesday, a coach asked her client a basic question: "How many companies are active right now?" He opened three tabs, hesitated, and guessed: "Twelve, maybe fifteen." She stopped him. No strategy, she said, without a shared account of reality. They spent 18 minutes reconstructing the pipeline by hand. By the next session, they had one tracker, one version of the truth, and strategy started in the first minute instead of the twentieth. Nothing else had changed, except the system. That was enough.
- Journey insight: If stage one lacks structure, every later stage gets taxed by context debt.
- Top coach pain insight: Coaches lose strategic session time when week-one updates are reconstructed from memory instead of tracked daily.
- What might these experts say? Octavia Zahrt: reduce emotional chaos with a simple daily rhythm. Claudio Fernandez-Araoz: define readiness signals early. Cindy Solomon: choose rituals that survive low-energy weeks.
- Research tidbit: Coaching value compounds when behavior between sessions is visible and measurable, not remembered retroactively.
- Research source: [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you)
- Quote: "What gets measured gets managed." - Peter Drucker
- One action: Run a 20-minute end-of-day pipeline check Monday through Friday, and start each session by reviewing last week's completion rate (discipline score = completed checks / 5).
- Learn more links: [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) | [Marshall Goldsmith](https://www.marshallgoldsmith.com/) | [Egon Zehnder](https://www.egonzehnder.com/)
- Expert-focus references: Octavia Zahrt focus (discipline habits under pressure): [Center for Creative Leadership - Leadership Coaching](https://www.ccl.org/leadership-solutions/leadership-coaching/) | Claudio Fernandez-Araoz focus (readiness criteria and talent assessment): [HBR - 21st-Century Talent Spotting (June 2014)](https://hbr.org/2014/06/21st-century-talent-spotting) | Cindy Solomon focus (courageous leadership habits): [Cindy Solomon - Courageous Leadership](https://www.cindysolomon.com/)
- Reply prompt: Which part of week-one coaching most often slips in your practice: emotional stabilization, action discipline, or targeting clarity?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 2

- Campaign ID: sm-coach-issue-02
- Emotional angle: conviction
- Subject A: Your client does not need a better bio, they need a better story
- Subject B: Why market readiness is mostly narrative discipline
- Preheader: The strongest executive narrative is coherent under pressure.
- Hook: Executives with strong resumes still lose momentum when their narrative changes every conversation.
- Short story: A VP aiming for a COO seat gave three different introductions in one week. In one call she was a transformation leader. In another she was an operator. In a third she sounded like a turnaround specialist. All true. None coherent. Her coach drew a simple triangle: context, outcome, operating signature. They rewrote one opening that fit each target role with one variable swapped. Two weeks later, response quality changed. She had not become more qualified. She had become easier to trust.
- Journey insight: Stage two is won by narrative consistency under pressure, not by adding more credentials.
- Top coach pain insight: Coaches report repeated rework when clients cannot deliver one stable leadership narrative across conversations.
- What might these experts say? Octavia Zahrt: keep language human. Claudio Fernandez-Araoz: convert narrative into readiness evidence. Cindy Solomon: make the story durable for long cycles.
- Research tidbit: In executive transitions, perceived coherence often drives confidence faster than additional information volume.
- Research source: [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) and [Herminia Ibarra](https://www.herminiaibarra.com/)
- Quote: "The most important thing in communication is hearing what is not said." - Peter Drucker
- One action: Create one narrative spine, rehearse it in 3 real conversations this week, and review a weekly consistency score (aligned introductions / total introductions).
- Learn more links: [Herminia Ibarra](https://www.herminiaibarra.com/) | [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) | [Egon Zehnder](https://www.egonzehnder.com/)
- Reply prompt: What is the one sentence your best clients can say that instantly clarifies why they are ready for the next seat?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 3

- Campaign ID: sm-coach-issue-03
- Emotional angle: urgency
- Subject A: More opportunities can make executive choices worse
- Subject B: How elite coaches reduce decision noise before interviews
- Preheader: Opportunity volume often hides decision risk.
- Hook: When opportunities increase, executives often confuse activity with strategic progress.
- Short story: A client had four active paths and felt "in demand." Her coach felt danger, not progress. Every prep session started with, "Which stakeholder mattered most in this one?" They built a weighted opportunity scoreboard: role scope, sponsor quality, strategic fit, downside risk, timing. One role dropped from second to fourth despite strong compensation. The client said, "I finally know what I am saying no to." That sentence protected three months of her career.
- Journey insight: Stage three requires a decision system before interview intensity peaks.
- Top coach pain insight: Coaches struggle most when clients chase every opportunity and arrive at prep calls without clear tradeoff criteria.
- What might these experts say? Octavia Zahrt: stabilize confidence. Claudio Fernandez-Araoz: prioritize fit and preparedness over prestige. Cindy Solomon: evaluate against multi-year trajectory.
- Research tidbit: Decision quality improves when criteria are explicit before emotional pressure rises.
- Research source: [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) and [Center for Creative Leadership](https://www.ccl.org/)
- Quote: "You have power over your mind, not outside events. Realize this, and you will find strength." - Marcus Aurelius
- One action: Score each live opportunity on five fixed criteria before every prep call and track weekly decision-discipline score (scored opportunities / active opportunities).
- Learn more links: [Center for Creative Leadership](https://www.ccl.org/) | [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) | [Marshall Goldsmith](https://www.marshallgoldsmith.com/)
- Reply prompt: What is your non-negotiable criterion when helping senior clients choose between two attractive roles?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 4

- Campaign ID: sm-coach-issue-04
- Emotional angle: earned optimism
- Subject A: After placement, most coaching systems go dark and value leaks
- Subject B: Board-path momentum is built in quiet months, not urgent ones
- Preheader: Long-arc value comes from consistent maintenance, not periodic intensity.
- Hook: Many executive coaching engagements end exactly when long-term strategic leverage should begin.
- Short story: Six months after landing a new role, a client said, "I am too busy to think about board positioning right now." Her coach replied, "That is why we start now." They set one monthly ritual: one governance relationship, one signal review, one narrative update. Twelve months later, she had become visible to the right people before openings appeared. Nothing dramatic happened in any single month. That was the point.
- Journey insight: Stage four is where disciplined coaches separate tactical wins from career architecture.
- Top coach pain insight: Coaches often lose long-term momentum when clients stop structured positioning habits immediately after placement.
- What might these experts say? Octavia Zahrt: make habits realistic. Claudio Fernandez-Araoz: keep readiness alive between transitions. Cindy Solomon: optimize for compounding trust.
- Research tidbit: Long-arc outcomes are frequently the result of steady sponsor and signal discipline.
- Research source: [Egon Zehnder](https://www.egonzehnder.com/) and [Manager Tools - Mark Horstman](https://www.manager-tools.com/)
- Quote: "Luck favors the prepared." - Edna Mode (popular modern phrasing)
- One action: Run a monthly governance cadence with three fixed actions and track execution reliability (completed monthly actions / 3).
- Learn more links: [Egon Zehnder](https://www.egonzehnder.com/) | [Herminia Ibarra](https://www.herminiaibarra.com/) | [Center for Creative Leadership](https://www.ccl.org/)
- Reply prompt: What maintenance ritual has given your clients the highest long-term return after they already secured a role?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 5

- Campaign ID: sm-coach-issue-05
- Emotional angle: candid humility
- Subject A: Why your best clients still underinvest in sponsors
- Subject B: Networking did not fail, sponsor strategy did
- Preheader: Contact volume is not advocacy.
- Hook: High-caliber executives rarely lose because they do not know enough people. They lose because too few people will spend political capital when it matters.
- Short story: A client showed 142 contacts. Her coach asked, "How many would risk reputation to recommend you for a stretch role?" She answered, "Maybe three." They stopped expanding and started deepening ten strategic relationships. Three months later, one of those ten made a call that moved her into a late-stage process she would not have found on her own.
- Journey insight: Sponsor depth is a better predictor than contact volume in stages two and three.
- Top coach pain insight: Coaches repeatedly see high-contact clients stall because very few relationships convert into real advocacy.
- What might these experts say? Octavia Zahrt: reduce performative activity. Claudio Fernandez-Araoz: prioritize sponsor quality by relevance. Cindy Solomon: build sponsor relationships that compound.
- Research tidbit: Coaches should track who advocates, not only who responds.
- Research source: [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) and [Herminia Ibarra](https://www.herminiaibarra.com/)
- Quote: "The quality of your life is the quality of your relationships." - Esther Perel
- One action: Rank top 10 relationships by active-advocacy likelihood, execute the top 5 next steps this week, and track advocacy activation rate (completed touches / 5).
- Learn more links: [Herminia Ibarra](https://www.herminiaibarra.com/) | [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) | [Egon Zehnder](https://www.egonzehnder.com/)
- Reply prompt: What differentiates a relationship that is warm from one that is sponsor-ready?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 6

- Campaign ID: sm-coach-issue-06
- Emotional angle: practical relief
- Subject A: The 72 hours before final rounds are where coaches create edge
- Subject B: Why final-round prep fails without a fixed protocol
- Preheader: Sequence beats improvisation.
- Hook: Most final-round mistakes are not intelligence gaps. They are preparation-sequence failures.
- Short story: A client had a final-round panel on Thursday. Monday was stakeholder map. Tuesday was strategic narrative by interviewer. Wednesday was risk rehearsal. Thursday morning was a 12-minute confidence pass. The client said after, "I was not trying to impress five people. I was solving five decision anxieties." The offer followed in six days.
- Journey insight: Late-stage outcomes improve when coaches standardize sequence, not just content.
- Top coach pain insight: Coaches see avoidable final-round misses when prep starts too late and lacks a repeatable rhythm.
- What might these experts say? Octavia Zahrt: lower anxiety with ritual. Claudio Fernandez-Araoz: align prep to decision criteria. Cindy Solomon: reduce cognitive load.
- Research tidbit: Decision quality under pressure improves when preparation is chunked by day and task type.
- Research source: [Center for Creative Leadership](https://www.ccl.org/) and [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you)
- Quote: "Amateurs practice until they get it right. Professionals practice until they cannot get it wrong." - Unknown
- One action: Adopt a fixed 4-day final-round protocol and track protocol adherence this week (completed prep stages / 4).
- Learn more links: [Center for Creative Leadership](https://www.ccl.org/) | [Marshall Goldsmith](https://www.marshallgoldsmith.com/) | [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you)
- Reply prompt: What is the one final-round prep step you will no longer skip?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 7

- Campaign ID: sm-coach-issue-07
- Emotional angle: conviction
- Subject A: If you do not score it, you cannot coach it
- Subject B: A practical scorecard for executive transition progress
- Preheader: Emotional support and instrumentation should coexist.
- Hook: Without shared metrics, coaching risks becoming emotionally supportive but operationally ambiguous.
- Short story: A coach replaced "How did the week go?" with five metrics: strategic conversations, sponsor touches, narrative reps, prep briefs, confidence trend. In week three, one client looked active but had zero sponsor touches for ten days. The next sprint changed immediately.
- Journey insight: Visible progress metrics reduce drift in stages one through three.
- Top coach pain insight: Coaches cannot hold execution accountability without a simple shared scoreboard reviewed every session.
- What might these experts say? Octavia Zahrt: scoreboards should support agency. Claudio Fernandez-Araoz: avoid vanity metrics. Cindy Solomon: include long-horizon indicators.
- Research tidbit: Behavioral consistency improves when goals are visible and reviewed at fixed cadence.
- Research source: [James Clear 3-2-1](https://jamesclear.com/3-2-1) and [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you)
- Quote: "Clarity is kindness." - Brene Brown
- One action: Launch a five-metric weekly scorecard, review it in session minute one, and track scoreboard compliance (weeks reviewed on time / total weeks).
- Learn more links: [James Clear 3-2-1](https://jamesclear.com/3-2-1) | [Center for Creative Leadership](https://www.ccl.org/) | [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you)
- Reply prompt: Which single metric most accurately predicts whether your clients are truly on track?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 8

- Campaign ID: sm-coach-issue-08
- Emotional angle: grounded concern
- Subject A: Board readiness begins before the board search
- Subject B: Why most board paths stall before they start
- Preheader: Board opportunities favor prepared consistency.
- Hook: Board opportunities often look sudden from the outside, but almost never are.
- Short story: A client said she would focus on board work next year. Her coach said that would be one year late. They set a monthly cadence: one governance conversation, one signal review, one narrative update. Nine months later, a committee advisory invitation opened her first formal board pathway.
- Journey insight: Stage four rewards steady governance behavior more than episodic intensity.
- Top coach pain insight: Coaches lose board-path momentum when governance outreach is treated as ad hoc instead of monthly discipline.
- What might these experts say? Octavia Zahrt: keep routines simple. Claudio Fernandez-Araoz: strengthen governance credibility through consistency. Cindy Solomon: optimize for compounding reputation.
- Research tidbit: Long-cycle opportunities convert more often when relationship maintenance is systematic and low-friction.
- Research source: [Egon Zehnder](https://www.egonzehnder.com/) and [Center for Creative Leadership](https://www.ccl.org/)
- Quote: "Luck favors the prepared." - Edna Mode (popular modern phrasing)
- One action: Schedule monthly board-readiness blocks with three fixed actions and track continuity score (months completed in sequence / months planned).
- Learn more links: [Egon Zehnder](https://www.egonzehnder.com/) | [Herminia Ibarra](https://www.herminiaibarra.com/) | [Center for Creative Leadership](https://www.ccl.org/)
- Reply prompt: What is your best low-friction ritual for keeping long-arc positioning alive?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 9

- Campaign ID: sm-coach-issue-09
- Emotional angle: urgency
- Subject A: Retained search does not reward visibility, it rewards readiness
- Subject B: The hidden timing risk in executive search coaching
- Preheader: Perfect roles are often won before they are publicly obvious.
- Hook: By the time many retained searches become visible, meaningful shortlists are already forming.
- Short story: A client saw a perfect role but had no current brief, no complete stakeholder map, and a partial narrative. They moved fast, but too late. Next cycle they pre-built readiness packs for top targets. The next opportunity came with less noise and better timing.
- Journey insight: In stage three, timeliness is often a preparation variable.
- Top coach pain insight: Coaches see qualified clients miss roles because readiness materials are not pre-built before opportunities surface.
- What might these experts say? Octavia Zahrt: channel urgency into focus. Claudio Fernandez-Araoz: keep readiness assets current. Cindy Solomon: make search preparedness a habit.
- Research tidbit: High-stakes opportunities reward those who pre-build decision materials.
- Research source: [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) and [Egon Zehnder](https://www.egonzehnder.com/)
- Quote: "The best way to predict the future is to create it." - Peter Drucker
- One action: Pre-build readiness packs for top five targets this week and track readiness coverage (packs complete / 5).
- Learn more links: [Egon Zehnder](https://www.egonzehnder.com/) | [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) | [Marshall Goldsmith](https://www.marshallgoldsmith.com/)
- Reply prompt: What readiness element is most likely to be missing when a perfect role appears?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 10

- Campaign ID: sm-coach-issue-10
- Emotional angle: earned optimism
- Subject A: Why executive search stamina is a coaching deliverable
- Subject B: Better outcomes start with energy architecture
- Preheader: Sustainable execution is a strategic system.
- Hook: Many coaching plans fail not because strategy is wrong, but because clients cannot execute it consistently for long enough.
- Short story: A coach moved one client’s highest-cognition tasks to two protected morning blocks and capped admin to one evening slot. Four weeks later, output quality improved and anxiety dropped. The plan barely changed. Timing changed everything.
- Journey insight: Stage one and two progress accelerate when coaches design for energy, not only intent.
- Top coach pain insight: Coaches report that clients miss strategic tasks when important work is scheduled outside peak-energy windows.
- What might these experts say? Octavia Zahrt: protect emotional capacity. Claudio Fernandez-Araoz: place high-stakes prep in peak windows. Cindy Solomon: build rhythms that survive quarter pressure.
- Research tidbit: Execution reliability improves when complex tasks match high-energy windows.
- Research source: [James Clear 3-2-1](https://jamesclear.com/3-2-1) and [Farnam Street Newsletter](https://fs.blog/newsletter/)
- Quote: "You do not rise to the level of your goals. You fall to the level of your systems." - James Clear
- One action: Remap top three strategic tasks to peak-energy windows and track execution rate (tasks completed in planned windows / 3 per week).
- Learn more links: [James Clear 3-2-1](https://jamesclear.com/3-2-1) | [Farnam Street Newsletter](https://fs.blog/newsletter/) | [Center for Creative Leadership](https://www.ccl.org/)
- Reply prompt: Where do your clients most often schedule the work that matters most?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 11

- Campaign ID: sm-coach-issue-11
- Emotional angle: candid humility
- Subject A: Why executive negotiation prep cannot start with compensation
- Subject B: The coaching move that protects confidence in high-stakes negotiation
- Preheader: Negotiation quality improves when identity risk is surfaced early.
- Hook: Compensation is visible, but identity risk often drives negotiation behavior behind the scenes.
- Short story: A client said, "I do not want to seem difficult." Her coach asked what she feared losing by negotiating well. They reframed around value, mandate, and role design before discussing money. The package improved, and so did role fit.
- Journey insight: Negotiation quality improves when coaches address identity and role design together.
- Top coach pain insight: Coaches see compensation talks derail when identity anxiety is unaddressed before mandate and value are clarified.
- What might these experts say? Octavia Zahrt: normalize fear. Claudio Fernandez-Araoz: link asks to strategic value. Cindy Solomon: protect long-term positioning.
- Research tidbit: Outcomes improve when role expectations and success conditions are clarified alongside economics.
- Research source: [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) and [Marshall Goldsmith](https://www.marshallgoldsmith.com/)
- Quote: "Let us never negotiate out of fear. But let us never fear to negotiate." - John F. Kennedy
- One action: Add a pre-negotiation worksheet for value case, mandate clarity, and non-negotiables, and track prep completeness (fields completed / total fields).
- Learn more links: [Marshall Goldsmith](https://www.marshallgoldsmith.com/) | [HBR: What Can Coaches Do for You? (January 2009)](https://hbr.org/2009/01/what-can-coaches-do-for-you) | [Herminia Ibarra](https://www.herminiaibarra.com/)
- Reply prompt: What fear most often weakens otherwise strong executive negotiators?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).

## Issue 12

- Campaign ID: sm-coach-issue-12
- Emotional angle: practical relief
- Subject A: Placement is not the finish line, it is the handoff
- Subject B: Build a 90-day coaching loop before day one
- Preheader: Quiet onboarding transitions are often the highest-leverage coaching win.
- Hook: Executives do not just need help landing the role. They need support converting early political capital into durable traction.
- Short story: A coach proposed a light 90-day post-placement cadence: one 20-minute weekly checkpoint on stakeholder trust, decision cadence, and signal reading. By week six, a brewing alignment issue was corrected before it hardened. At day 90, the client called it her least dramatic transition.
- Journey insight: Stage three-to-four handoff quality determines whether placement momentum compounds or decays.
- Top coach pain insight: Coaches often watch first-90-day success drift without a lightweight weekly checkpoint system.
- What might these experts say? Octavia Zahrt: reduce stress with compact accountability. Claudio Fernandez-Araoz: preserve readiness post-acceptance. Cindy Solomon: use early months to build long-arc credibility.
- Research tidbit: Early-role success often depends on disciplined stakeholder sequencing and frequent calibration.
- Research source: [Center for Creative Leadership](https://www.ccl.org/) and [Harvard Business Review Newsletters](https://hbr.org/email-newsletters)
- Quote: "Well begun is half done." - Aristotle
- One action: Implement a 90-day post-placement cadence with weekly indicators and track checkpoint reliability (completed check-ins / planned check-ins).
- Learn more links: [Center for Creative Leadership](https://www.ccl.org/) | [Egon Zehnder](https://www.egonzehnder.com/) | [Harvard Business Review Newsletters](https://hbr.org/email-newsletters)
- Reply prompt: What is your most reliable indicator that a first-90-day transition is drifting?
- Subscribe CTA: Subscribe for free to the Executive Coach Brief at [startingmonday.app](https://startingmonday.app/).
