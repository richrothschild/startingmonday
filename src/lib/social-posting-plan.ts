type Pillar = 'search_craft' | 'market_intel' | 'behind_build' | 'user_story' | 'engagement'

type Audience = 'executives' | 'search_firms' | 'executive_coaches' | 'outplacement_firms'

export type SocialPlan = {
  audience: Audience
  pillar: Pillar
  audienceLabel: string
  pillarLabel: string
  recommendedTimeCt: string
  draftText: string
}

const PILLAR_LABELS: Record<Pillar, string> = {
  search_craft: 'Search Craft',
  market_intel: 'Market Intelligence',
  behind_build: 'Behind the Build',
  user_story: 'User Story',
  engagement: 'Engagement',
}

const AUDIENCE_LABELS: Record<Audience, string> = {
  executives: 'Senior Executives',
  search_firms: 'Search Firms',
  executive_coaches: 'Executive Coaches',
  outplacement_firms: 'Outplacement Firms',
}

const WEEKDAY_SLOTS: Record<number, { audience: Audience; pillar: Pillar; recommendedTimeCt: string }> = {
  1: { audience: 'executives', pillar: 'search_craft', recommendedTimeCt: '8:35 AM CT' },
  2: { audience: 'search_firms', pillar: 'market_intel', recommendedTimeCt: '9:05 AM CT' },
  3: { audience: 'executive_coaches', pillar: 'user_story', recommendedTimeCt: '8:45 AM CT' },
  4: { audience: 'outplacement_firms', pillar: 'behind_build', recommendedTimeCt: '9:10 AM CT' },
  5: { audience: 'executives', pillar: 'engagement', recommendedTimeCt: '8:35 AM CT' },
}

const POSTS: Record<Audience, string[]> = {
  executives: [
    `The role was already in motion before it was posted.\n\nThat is the part most senior executives do not see until it costs them. By the time the listing hits LinkedIn, the board has context, the search partner has calibration, and someone is already in a quiet first conversation.\n\nThis is why executive search is won on timing, not volume.\n\nThe people who move first are usually not better candidates. They are running a better signal system.\n\n#executivesearch #cio #cto #careertiming`,
    `Most executive searches do not break in the interview. They break in the middle.\n\nWeek three is where good intentions turn into drift. Follow-up slips. Company tracking gets messy. Strong leads cool off for avoidable reasons.\n\nThe executives who keep momentum are not winging it. They are running cadence on purpose.\n\nStrategy matters. Cadence decides.\n\n#executivesearch #leadership #careerstrategy #ciso`,
    `A recruiter call is not a pipeline.\n\nA spreadsheet of names is not a pipeline either. A pipeline has priorities, next actions, owners, and deadlines. It tells you what to do next, not just what already happened.\n\nA lot of senior candidates are more qualified than their search process.\n\nIf it is not tracked, it will drift.\n\n#executivesearch #operations #jobsearch #leadership`,
    `The expensive miss is not one role. It is one quarter.\n\nSenior transitions are lumpy. One missed timing window can push the whole search back by months. That is why "I will get to it tomorrow" is more costly at this level than people think.\n\nThe executives who move faster are usually seeing the signal earlier and acting before the market gets loud.\n\nPreparation creates speed.\n\n#executivesearch #careertransition #ciojobs #marketintel`,
    `You do not need more opportunities. You need earlier ones.\n\nMore volume feels productive. At the senior level it usually means your targeting is weak. One early, well-positioned conversation can outperform twenty late applications.\n\nThe real edge is not hustle. It is knowing where pressure is building before everyone else starts reacting.\n\nEarlier signal beats higher volume.\n\n#executivesearch #careerstrategy #leadershipsearch #ctojobs`,
  ],
  search_firms: [
    `Search firms are asked to move faster with less signal every quarter.\n\nBy the time a role is broadly visible, candidate behavior has already shifted. The strongest prospects are already in private conversations.\n\nThe firms that win are combining relationship judgment with earlier market signal. That creates better shortlists and fewer late stage surprises.\n\nProcess still matters. Signal now matters just as much.\n\n#executivesearch #searchfirm #talentstrategy #recruiting`,
    `Most retained searches lose time before kickoff.\n\nNot because the search partner is weak. Because the market context is incomplete on day one.\n\nWhen you start with leadership movement, org pressure, and hiring velocity in hand, calibration is faster and candidate conversations get sharper immediately.\n\nThe first week sets the whole arc of the search.\n\n#executivesearch #retainedsearch #talentacquisition #marketintel`,
    `Candidate quality is usually blamed on pipeline. The real issue is timing.\n\nWhen outreach starts after broad posting, everyone is contacting the same people at the same moment.\n\nFirms that initiate before public noise hits can focus on fit instead of speed triage.\n\nEarlier signal creates better search economics.\n\n#searchfirm #executivesearch #hiringstrategy #talentops`,
    `A stronger intake meeting changes search outcomes.\n\nThe best teams walk in with current signal, not just role requirements. What changed in leadership? Where is pressure building? What is likely to open next?\n\nThat context improves candidate calibration from the first outreach wave.\n\nSearch quality begins before the brief is finalized.\n\n#executivesearch #retainedsearch #leadershiphiring #talentintelligence`,
    `Search credibility compounds when clients see the market before competitors do.\n\nBoards and CEOs do not pay for activity. They pay for informed judgment under uncertainty.\n\nSignal plus operator discipline gives firms a measurable edge in speed and confidence.\n\nWhat would your close rate look like with earlier market visibility?\n\n#searchfirm #executivesearch #boardsearch #recruiting`,
  ],
  executive_coaches: [
    `Most coaching value is created between sessions.\n\nThat is also where most transitions break down. The session is good. The intent is real. Then execution gets soft, prep gets delayed, and the week disappears.\n\nThe strongest coaches are not just giving insight. They are protecting momentum between meetings.\n\nThat is where results start compounding.\n\n#executivecoaching #executivesearch #careertransition #leadership`,
    `Your client does not need more advice. They need fewer dropped balls.\n\nMost senior candidates already know the theory. The problem is consistent execution under uncertainty.\n\nWhen a coach can see pipeline movement, follow-up rhythm, and signal context, the conversation changes. Less recap. Better judgment. More traction.\n\nCoaching impact rises when execution is visible.\n\n#executivecoaching #leadershipcoach #executivesearch #careerstrategy`,
    `The quiet middle of a transition decides the outcome.\n\nEarly urgency is easy. Final interview energy is easy. Week four through week ten is where confidence and consistency get tested.\n\nCoaches who bring structure to that middle window create better decisions and better offers for clients.\n\nMomentum is a coaching outcome.\n\n#executivecoaching #careertransition #leadershipdevelopment #executivesearch`,
    `Clients rarely fail because they are unqualified. They fail because timing drifts.\n\nA delayed follow up, an unprepared conversation, a missed signal window. Small misses that compound.\n\nWhen coaching is supported by daily context and accountability, those misses drop fast.\n\nExecution quality is career leverage.\n\n#executivecoaching #searchstrategy #leadership #cxo`,
    `Great coaches already know this pattern.\n\nThe biggest unlock is not another framework. It is giving clients an operating system they can run every day between sessions.\n\nThat turns insight into behavior and behavior into outcomes.\n\nWhat would change if every client arrived fully prepared every week?\n\n#executivecoaching #leadershipcoach #executivesearch #careers`,
  ],
  outplacement_firms: [
    `Outplacement quality is now measured by speed to traction, not program completion.\n\nExecutives do not judge support by how polished the workbook is. They judge it by whether real opportunities move faster.\n\nFirms that add market signal and daily execution support are creating better outcomes in the first 30 days.\n\nModern transition support is operational, not ceremonial.\n\n#outplacement #executivesearch #careertransition #leadership`,
    `A revised resume is necessary. It is not sufficient.\n\nSenior clients need timing intelligence, structured outreach rhythm, and sharper prep between advisory meetings.\n\nOutplacement firms that provide that infrastructure are differentiating in a crowded market and proving value earlier in engagements.\n\nSupport quality now includes execution quality.\n\n#outplacement #executivecoaching #talenttransition #careerstrategy`,
    `The biggest outplacement risk is invisible drift.\n\nClients appear active but momentum is weak, targeting is fuzzy, and conversations are late.\n\nWhen firms track execution signals weekly, intervention is faster and outcomes improve.\n\nWhat gets measured in transition gets improved.\n\n#outplacement #executivesearch #workforce #leadershiptransition`,
    `Boards and CHROs are asking a harder question now.\n\nNot \"did we provide support?\" but \"did support accelerate results?\"\n\nOutplacement partners who combine coaching with market intelligence can answer that question with evidence, not anecdotes.\n\nThat is where premium trust is won.\n\n#outplacement #chro #executivecareer #talentstrategy`,
    `Outplacement firms already have trust. The next step is proving operating impact.\n\nWhen clients get daily signal, clear priorities, and better interview prep cadence, confidence climbs and cycle time compresses.\n\nThe market does not need louder transition services. It needs stronger ones.\n\n#outplacement #careertransition #executivesearch #leadership`,
  ],
}

export function isSocialPostDay(date: Date): boolean {
  const dow = date.getUTCDay()
  return dow >= 1 && dow <= 5
}

function getWeekIndex(date: Date): number {
  const jan1 = Date.UTC(date.getUTCFullYear(), 0, 1)
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const day = Math.floor((current - jan1) / 86400000)
  return Math.floor(day / 7)
}

export function getSocialPlanForDate(date: Date): SocialPlan | null {
  const dow = date.getUTCDay()
  const slot = WEEKDAY_SLOTS[dow]
  if (!slot) return null

  const variants = POSTS[slot.audience]
  const variantIndex = getWeekIndex(date) % variants.length

  return {
    audience: slot.audience,
    pillar: slot.pillar,
    audienceLabel: AUDIENCE_LABELS[slot.audience],
    pillarLabel: PILLAR_LABELS[slot.pillar],
    recommendedTimeCt: slot.recommendedTimeCt,
    draftText: variants[variantIndex],
  }
}

export function getNextSocialPostDays(from: Date, count = 5): string[] {
  const dates: string[] = []
  const cursor = new Date(from)

  while (dates.length < count) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    if (isSocialPostDay(cursor)) {
      dates.push(cursor.toISOString().split('T')[0])
    }
  }

  return dates
}
