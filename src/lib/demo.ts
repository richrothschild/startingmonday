export const DEMO_USER_ID = process.env.DEMO_USER_ID ?? ''

export function isDemoUser(userId: string): boolean {
  return !!DEMO_USER_ID && userId === DEMO_USER_ID
}

export function streamDemoText(text: string): ReadableStream {
  const encoder = new TextEncoder()
  const CHUNK = 30
  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < text.length; i += CHUNK) {
        controller.enqueue(encoder.encode(text.slice(i, i + CHUNK)))
        await new Promise(r => setTimeout(r, 8))
      }
      controller.close()
    },
  })
}

export const DEMO_PREP_BRIEFS: Record<string, string> = {
  cotiviti: `## Bottom Line

Your PE-delivery track record at Revvity and your healthcare data fluency are a combination Cotiviti cannot find off the shelf. The objection they will raise is that your background is instruments and diagnostics, not payer analytics -- you need to draw the regulatory and data-complexity parallel before they do. Walk in with a clear 45-day listening plan and you close the deal.

## The Situation

Cotiviti processes quality analytics and risk adjustment data for over 200 health plans, under significant PE pressure from Apax Partners since 2021 to modernize a platform built for fee-for-service era assumptions. The previous SVP Engineering role was vacated following a delivery miss on a major client integration. Jennifer Walsh (CTO, hired 10 months ago) is rebuilding the technology leadership team with people who can execute under investor scrutiny. The role exists to own platform modernization while keeping a complex, mission-critical client portfolio intact.

## Win Thesis

Most candidates at this level have scale or domain or PE-cycle experience. You have all three. The Revvity chapter -- building an 18-to-72 engineering team while integrating acquisitions and migrating a core platform under PE ownership -- is a near-exact analogue to what Cotiviti needs done. Jennifer Walsh took this CTO role to execute a technology transformation under investor pressure. She needs a peer who has done that specific thing, not someone who has theorized about it. That peer is you.

## The Narrative

Lead with the Revvity arc, not your job title. Open by framing the environment: "I joined as Director and built the engineering function during four years of PE ownership, two acquisitions, and a core platform migration. The company changed around me completely -- I stayed because I was building something, not maintaining it." Then connect to their situation explicitly: "What I understand about Cotiviti is that the platform question and the delivery credibility question are happening simultaneously. That is the specific problem I have spent five years solving."

Your opening positioning statement, ready verbatim: "I build engineering organizations in healthcare data environments where the platform has to evolve without the business stopping -- and I have done it under the kind of investor scrutiny that Cotiviti is operating under right now."

## Anticipated Pushback

**They push:** Your domain is instruments and diagnostics, not payer analytics. How do you come up to speed?
**You say:** "The regulatory complexity maps closer than it looks. IVDR compliance work at Revvity -- validating data integrity across federated instrument networks with FDA audit trails -- is the same class of problem as HIPAA-compliant claims processing. The underlying challenge is real-time data integrity at scale across heterogeneous sources. I have been doing that. The vocabulary is different; the engineering discipline is identical."

**They push:** What happened in your delivery misses?
**You say:** "I have had quarters where we slipped. The most important lesson I took from each one: surface the problem 60 days early, not 60 days late. I now build explicit leading indicators into every major delivery -- when a milestone starts drifting, I want to know in week 3, not week 10. That discipline is a non-negotiable part of how I run an organization."

**They push:** You have been at one company six years -- can you adapt to a new environment quickly?
**You say:** "The company changed around me more than most people change companies. New PE sponsor, new CEO, two acquisition integrations, a product pivot. The continuity was me, not the organization. I have built the muscle for operating in transition -- that is what this role requires."

**They push:** What is your approach to an inherited organization?
**You say:** "45 days of listening before any structural changes. I want to understand who delivers, who knows where the bodies are buried, and what the real blockers are before I touch anything. The decisions I make in month two are better decisions than the ones I would make in week one."

## Talking Points

**Healthcare data scale without the rewrite** "We scaled our SaaS platform from 500K to 4M active devices without a rewrite -- we had to thread the needle between stability and modernization under active client load. I understand what it costs to get that wrong."

**PE delivery discipline** "My last two years at Revvity I owned a $23M engineering budget and delivered within 3% annually. Apax was in the room for quarterly business reviews. I know what that environment feels like and what it demands."

**Team building at scale, from scratch** "I went from 18 engineers to 72 in four years -- and I did it during two acquisitions, which means onboarding teams that did not choose to join. The organizational challenges are as hard as the technical ones."

**Regulatory credibility** "I led our IVDR compliance initiative -- 18 months, $4M project, audited by three regulatory bodies. That kind of structured delivery under external scrutiny is directly transferable to what payer clients expect."

**The client problem** "I understand what it means when a client integration miss has downstream consequences for a health plan's member data. The stakes are not abstract to me -- I have operated in regulated environments where a system error has real-world consequences."

## Questions to Ask

"How is the technology investment thesis being framed with Apax right now -- build mode or efficiency mode?" *Signals you understand PE dynamics and that the job description may shift based on investor priorities.*

"When Jennifer came in 10 months ago, what did she find that surprised her most about the technology organization?" *Surfaces the real state of things without asking directly -- and shows you have done your homework on the CTO hire.*

"Where does the bottleneck actually live today -- is it architecture, talent density, or delivery sequencing?" *Shows engineering systems thinking, not just people management instincts.*

"What does a successful first 90 days look like from the board's perspective -- not the job description, but what would make the investment committee feel the hire is working?" *Demonstrates PE-environment fluency and helps you calibrate.*

"How does the client portfolio influence technology roadmap prioritization?" *Critical question for a payer analytics company -- shows you understand the tension between client commitments and platform modernization.*

## First 90 Days Signal

Bring this up naturally: "My first instinct in any new organization is to map who delivers, not just who is senior. I would spend the first three weeks in listening sessions -- one-on-ones with every team lead, not just the directors." *This signals discipline and shows you will not disrupt the organization before you understand it.*

"I would want to understand the three platform decisions that are most contested internally right now. Not so I can adjudicate them immediately, but so I know what the technical debt looks like and where the disagreements live." *Shows intellectual curiosity and that you are not going to pretend the hard decisions do not exist.*

"Delivery credibility with clients is the first thing I would want to establish. I would map every client commitment in flight and personally review the red ones in week two." *Directly addresses the context of why the previous leader left -- shows you take it seriously without making it awkward.*

## What to Leave Out

**Do not lead with your MBA.** This is an execution-credibility conversation. A credentials-forward opener signals you are not sure your delivery record speaks for itself. It does.

**Do not mention Epic or Optum positively.** In a payer analytics context, competitive sensitivity is real. If either comes up, respond neutrally and redirect to your work.

**Do not volunteer specifics about delivery misses unprompted.** If they ask, answer directly and specifically. If they do not, the story you tell about leading indicators and early warning systems covers the lesson without reopening the wound.

**Do not undersell the regulatory work.** Candidates from outside pure payer or provider backgrounds often discount their compliance experience because they think it does not transfer. It does, and it is a differentiator here.

## People

**Jennifer Walsh (CTO)** She is 10 months in and still building her leadership team. She took this role to fix something, not maintain it. Reference your shared context when it fits: "I understand building under that kind of investor timeline." Do not position yourself as knowing her situation better than she does.

**Michael Torres (Chief People Officer)** If he is in the interview process, he is vetting culture fit and change management instincts. Emphasize the listening tour, the 45-day no-restructuring commitment, and how you build trust with inherited teams. Do not lead with headcount reduction stories.`,

  'kyruus health': `## Bottom Line

This is a relationship conversation, not an interview -- but how you show up in it determines whether Kyruus Health becomes an active opportunity. David Park is SVP Product, not the hiring manager, which means he is evaluating you as a potential peer and as someone worth introducing to the CTO. The goal of this meeting is one thing: a warm introduction to the right person before a role is ever posted.

## The Situation

Kyruus Health builds patient access software for health systems -- scheduling, referral management, directory accuracy. They hired a new CTO in January, which typically signals a technology transformation mandate. David Park (SVP Product, your LinkedIn connection) knows you are in the market. No open engineering leadership role is currently posted, which means either it is being sourced quietly or it has not been created yet. Either way, you are six to eight weeks ahead of the field.

## Win Thesis

You are talking to the right person at the right moment. David Park will have visibility into what the new CTO is building and who they are looking for. You do not need to convince him you are qualified -- you need to make him want to put you in a room with the right people. Your healthcare data background and PE-delivery track record are directly relevant to what a newly hired CTO at an 800-person health tech company is facing. Make that connection clearly in this meeting.

## The Narrative

Do not show up with a pitch deck or a prepared monologue. Come in curious. "I have been tracking Kyruus since the new CTO hire in January -- the patient access problem feels like the right size of challenge for where I am." Then ask about what David is seeing in the engineering organization. Listen twice as much as you talk.

One sentence for when he asks about your background: "I have spent six years building engineering at scale in healthcare data environments -- I understand the compliance constraints, the data complexity, and what it takes to modernize a platform while keeping clients intact."

## Anticipated Pushback

**He says:** "I am not sure we have anything open right now."
**You say:** "I am not here about a specific opening. I am mapping companies where I would want to work -- Kyruus is on that list. I would love to understand what the engineering org looks like under the new CTO and whether there are people worth meeting."

**He says:** "You should reach out to our recruiter."
**You say:** "I will. But I find the most valuable conversations happen before the recruiting process starts, not during it. Can you point me to the right person internally, or share a bit about what the CTO is prioritizing?"

## Talking Points

**Why Kyruus specifically** "Patient access is a genuinely hard problem -- data quality, multi-system integration, the provider directory accuracy issue. I have been in adjacent problem spaces. I understand the complexity."

**Your healthcare data experience** "I have built engineering teams in regulated healthcare environments -- the compliance constraints and data integrity requirements are not new to me. I understand why they matter operationally."

**Your timing awareness** "I know it is early. That is intentional. I would rather have this conversation now than wait for a posting and compete with 200 candidates."

## Questions to Ask

"What is the engineering organization building toward over the next 18 months, under the new CTO?" *Shows you have done your homework and you are thinking at the right level.*

"Where does the technology organization sit relative to the product roadmap -- mostly in execution mode or more involved in strategy?" *Helps you understand the scope of the role that would fit you.*

"Is there someone in the engineering leadership you think I should meet, regardless of what is open right now?" *Direct ask for the referral. Earns more respect than you would expect.*

## First 90 Days Signal

Not applicable for this meeting -- save the first 90 days talk for when there is a specific role.

## What to Leave Out

**Do not ask about compensation or benefits.** This is a relationship conversation.

**Do not send a resume before the meeting.** It shifts the dynamic in the wrong direction.

**Do not name other companies in your pipeline.** Even Cotiviti, even if things are going well there. Keeps the conversation clean.`,
}

export const DEMO_STRATEGY_BRIEF = `## Bottom Line

Your execution track record at Revvity -- building at scale under PE ownership -- is your decisive advantage in this market. The gap is network density in the Boston and New York health tech ecosystem: you have five active targets but you need 20 conversations running in parallel, and right now you do not. The move that accelerates everything in the next 30 days is getting into three warm rooms with health tech CTOs who can either hire you or refer you to someone who will.

## Your Position

You are competitive for CTO at 500-3,000 person companies in health tech, and for SVP Engineering at larger organizations. Your profile is genuinely differentiated: VP at a real company with PE-cycle delivery experience, a track record of scaling teams from scratch, and healthcare data fluency that most pure-software candidates do not have. The market for this profile is real. The challenge is surface area -- executive roles at this level do not move through job boards. They fill through networks, and right now your network is narrower than your qualifications deserve.

Your target role range is realistic, not aspirational. The titles you listed (CTO, SVP Engineering) are the right range. One caution: VP of Engineering at a large enterprise may feel like a lateral move -- be deliberate about which VP roles you pursue and which you skip.

## Target Role Profile

Primary targets: CTO (300-2,000 employees), SVP or VP Engineering (1,500-5,000 employees).

Adjacent alternatives worth pursuing: Chief Technology Officer at a PE-backed healthcare services company (your sweet spot -- operators, not just pure software), Head of Engineering at a Series C or D digital health startup (you would be building the function, which you have done), VP Technology at a payer or health system on a modernization mandate.

Likely low-yield: Director of Engineering roles at large enterprises (miscalibrated), CTO at seed-stage startups (you have earned beyond that stage), VP Engineering titles at companies where the VP means individual contributor team lead.

## Target Company Profile

Best opportunity surface: PE-backed healthcare IT companies (200-3,000 employees) in transformation, Series B through D digital health companies with $20M or more raised, health plans and provider groups with technology modernization mandates, payer analytics and quality measurement companies.

Where candidates at your level waste time: applying to posted roles at public tech companies (slow process, different culture), pursuing Fortune 500 health systems (long sales cycles, different dynamics), chasing startup CTO titles where the equity is thin and the role requires individual contributor work you have grown past.

## Your Narrative

Your through-line: you build engineering organizations in healthcare data environments where the business cannot stop while the platform evolves. You have done it under PE pressure, through acquisitions, and at scale. That is a specific thing, not a generality.

One sentence, ready verbatim: "I build engineering organizations in regulated healthcare data environments where the technical transformation has to happen without the business stopping -- and I have done it under the kind of investor scrutiny that most companies encounter once."

Lead with environment, not title. The Revvity chapter is not about being VP of Engineering -- it is about building something real under real constraints with real stakes. That is the story.

## Outreach Framework

**Warm network (highest leverage):** You have former colleagues, advisors, and investors from the Revvity orbit. Identify 15 of them who are now at health tech companies or PE funds. Not to ask for a job -- to ask for 20 minutes and one referral. One good introduction from a Revvity connection is worth 20 cold applications.

**Cold outreach (specific, not generic):** Target CTOs and CPOs at your 15-20 priority companies. One paragraph, no attachments. Lead with a specific observation about their company. No templates.

**Executive search firms:** Two or three firms focus on VP-plus technology roles in healthcare IT -- Heidrick and Struggles, Spencer Stuart (healthcare practice), and several boutiques. A conversation with a partner there is worth your time with this profile. Do not apply through their job postings; contact the partner directly.

**Direct approach:** The companies where you have warm contacts -- press these. One warm contact is a qualitatively different conversation than a cold application.

## Gaps to Get Ahead Of

**Domain specificity:** "You are in instruments and diagnostics, not payer or provider software." Frame it before they do: "The regulatory rigor and data complexity are directly comparable -- IVDR compliance maps to HIPAA-scale problems. The healthcare data challenge is the same; the vocabulary is different."

**Tenure concentration:** "You have been at one company for six years." Counter: "The company changed around me four times. PE transition, two acquisitions, CEO change, product pivot. The continuity was me building something. I have the adaptability track record -- it is just less visible than a resume with five companies in six years."

**Network gap:** You may face situations where candidates with deeper Boston health tech relationships get the first call. The mitigation is getting in front of the right people now, before specific roles open, not after.

## First 30 Days

1. Map your Revvity network -- who went where, who is in health tech, who can open a door.
2. Set a weekly meeting target: five conversations per week, 20 calls and meetings in 30 days.
3. Draft your two-paragraph cold outreach note -- test it on three people who know your work well.
4. Get a brief with one executive search partner at a healthcare IT firm.
5. Add 10 more companies to your target list -- you have five; you need 20.
6. Follow up with David Park at Kyruus Health -- it has been eight days.
7. Refresh your LinkedIn summary to match your new positioning statement.
8. Identify three conferences or events in the next 60 days where health tech CTOs gather.
9. Ask Jennifer Walsh at Cotiviti for one referral, regardless of how that process goes.
10. Set Google Alerts for your 10 highest-priority companies -- executive departures and funding rounds are the leading signal.`
