export const NEXT_7_DAYS = [
  'Publish one behavior KPI with denominator, timeframe, and confidence annotation.',
  'Make relationship-first language explicit across demo and review pages.',
  'Instrument loop-closure tracking for outreach, conversation, and follow-up actions.',
]

export const WHAT_STARTING_MONDAY_IS = [
  'A weekly execution tool for senior executives in search.',
  'A behavior loop: signal -> person -> outreach -> follow-up -> next action.',
  'A way to make search activity visible, scheduled, and reviewable.',
]

export const WHAT_STARTING_MONDAY_IS_NOT = [
  'Not a news feed for passive monitoring.',
  'Not generic AI writing without company and role context.',
  'Not a replacement for relationships, judgment, or search advocacy.',
]

export const WHO_SHOULD_USE = [
  'Senior executives running an active or near-active search who need more structure, follow-up discipline, and better company-specific preparation.',
  'Coaches or advisors who want a client to execute consistently between sessions instead of restarting every week.',
]

export const WHO_SHOULD_NOT_USE = [
  'Someone who wants a passive job board experience and is not prepared to do regular outreach and follow-up.',
  'Someone looking for a tool to replace relationship-building rather than support it.',
]

export const DETAILED_BEHAVIOR_LOOP = [
  {
    label: 'Monday',
    detail: 'Review new signals and choose the one company that actually merits action this week.',
  },
  {
    label: 'Tuesday',
    detail: 'Identify the person who matters there, write the outreach, and send it.',
  },
  {
    label: 'Wednesday',
    detail: 'Use the prep brief to sharpen the thesis and expected pushback before any conversation starts.',
  },
  {
    label: 'Thursday',
    detail: 'Track follow-up due dates and close the loop on unanswered outreach instead of letting it drift.',
  },
  {
    label: 'Friday',
    detail: 'Review what moved, what stalled, and what the next action is for each live thread.',
  },
]

export const RELATIONSHIP_FIRST = [
  'A company matters only because it gives you a reason to talk to a person with context and timing.',
  'A signal is useful only if it improves an outreach angle, a follow-up, or a real conversation.',
  'The output that matters is not insight. It is more credible conversations with the right people.',
]

export const LOOP_CLOSURE_SCORECARD = [
  {
    metric: 'Signals turned into outreach',
    baseline: 'Not yet published publicly',
    laneOneTarget: 'Show signal-to-outreach rate with denominator and weekly cadence',
  },
  {
    metric: 'Outreach actions per week',
    baseline: 'Tracked in workflow but not used as headline proof',
    laneOneTarget: 'Publish one normalized benchmark for active users',
  },
  {
    metric: 'Follow-up completion rate',
    baseline: 'Concept is present, end-to-end proof is thin',
    laneOneTarget: 'Report weekly so stalled searches are visible',
  },
]

export const FEATURE_CHANNELS = [
  {
    channel: 'Individual executives (direct)',
    audience: 'VP, C-suite, and board-track operators managing their own search campaign.',
    value: 'Turns fragmented search tasks into a repeatable operating system.',
  },
  {
    channel: 'Executive coaches',
    audience: 'Coaches supporting senior clients in transition.',
    value: 'Increases coach leverage and client execution quality between sessions.',
  },
  {
    channel: 'Search firms',
    audience: 'Boutique and retained executive search teams.',
    value: 'Improves readiness and quality of candidate conversations before key interviews.',
  },
  {
    channel: 'Outplacement and transition partners',
    audience: 'Institutional providers managing executive cohorts.',
    value: 'Scales premium transition support without linear service labor.',
  },
]

export const OBSTACLE_AND_COMPETITION_SNAPSHOT = [
  {
    heading: 'Adoption and behavior change risk',
    detail:
      'The model works only if users maintain weekly execution discipline, not just log in. Cadence adherence and loop-closure tracking remain the core adoption risk.',
  },
  {
    heading: 'AI and DIY as baseline competitors',
    detail:
      'General LLMs and personal spreadsheet stacks are the default alternative in every channel. The defense is workflow integration, context continuity, and measurable operating outcomes over one-off prompts.',
  },
  {
    heading: 'Switching costs in incumbent ecosystems',
    detail:
      'Coaches and firms already run on existing CRM, notes, and document systems. Adoption requires low-friction onboarding, clear migration value, and role-safe boundaries.',
  },
  {
    heading: 'Growth constraints: authority, reach, and frequency',
    detail:
      'Domain authority in executive search is still developing, paid reach is expensive, and message frequency needed for trust-building is high. Repeatable partner channels are required to compound distribution.',
  },
]

export const MARK_DILIGENCE_GAPS = [
  'Per-channel week-1 activation benchmark with clear denominator definitions.',
  'Documented retention curves by channel with reason-coded churn.',
  'Channel-level unit economics: CAC, gross margin, payback, and expansion path.',
  'Evidence that AI-supported workflows improve decisions versus DIY baseline, not only speed.',
  'Implementation proof for partner channels: setup time, training burden, and role adoption rates.',
]

export const DEMO_EXECUTIVE = {
  name: 'Michael Torres',
  currentTitle: 'VP, IT Transformation',
  currentCompany: 'Humana',
  targetRole: 'CIO',
  targetCompany: 'Salesforce',
}

export const INTERVIEW_BRIEF_SECTIONS = [
  {
    title: 'Bottom line',
    points: [
      'The case for Michael is straightforward: he has run messy, acquisition-heavy IT estates and can explain the operating and financial tradeoffs in language a CFO and board will trust.',
      'The main risk is that he gets framed as a transformation executive instead of the person who can run internal IT as a disciplined operating function inside a scrutinized public company.',
      'What he needs to do in the conversation is make the first 90 days concrete: governance reset, adoption priorities, and a small number of operating metrics leadership can inspect quickly.',
    ],
  },
  {
    title: 'What Salesforce actually needs',
    points: [
      'Internal IT is carrying activist pressure, margin pressure, and accumulated platform complexity at the same time. That is the real operating context.',
      'This is not an architecture discussion. It is a senior business-technology leadership role where internal IT has to function as both cost center and credibility layer for the Salesforce platform story.',
      'The useful frame for the meeting is governance, adoption, vendor control, and executive trust. Deep technical detail only matters if it advances one of those four points.',
    ],
  },
  {
    title: 'Likely pushback and the right answer shape',
    points: [
      'You have done major transformations, but can you operate inside a quarterly public-company drumbeat? Good answer: start with decision cadence, operating controls, and what gets measured in the first month.',
      'How do you deal with a collaboration platform the company sells proudly but employees do not fully live in? Good answer: treat Slack as an adoption, workflow, and leadership-model problem, not just a tool rollout issue.',
      'How do you avoid launching another expensive transformation program? Good answer: sequence cost control and simplification first, then earn room for modernization through visible operating wins.',
    ],
  },
  {
    title: 'Questions he should ask in the room',
    points: [
      'Where does leadership think internal IT currently strengthens the Salesforce product story, and where does it quietly weaken it?',
      'Which two or three operating measures would tell you within 90 days that this role is restoring confidence with Marc, finance, and functional leaders?',
      'What decisions around Slack, data flow, and platform sprawl are taking too long today because ownership is not crisp?',
    ],
  },
]

export const ONBOARDING_STEPS = [
  {
    step: '1. Set the search perimeter',
    timing: '10 minutes',
    detail:
      'The executive names target role, target company list, and real constraints. No personality quiz, no journey language, no soft setup. The goal is immediate operating clarity.',
  },
  {
    step: '2. Load proof and positioning inputs',
    timing: '15 minutes',
    detail:
      'The user confirms career facts, operating wins, and target narrative. We want authoritative inputs fast so every brief and outreach draft starts from facts rather than vague resume text.',
  },
  {
    step: '3. Build the first action stack',
    timing: '10 minutes',
    detail:
      'Starting Monday creates the first company watchlist, first prep brief, and first follow-up queue. The user leaves setup with work ready to execute, not a dashboard waiting to be explored.',
  },
  {
    step: '4. Install the cadence',
    timing: '5 minutes',
    detail:
      'The daily briefing and weekly review are turned on immediately. The product should feel like an execution system that tells a senior operator what matters now.',
  },
]

export const STRATEGY_BRIEF = [
  {
    title: 'Search thesis',
    detail:
      'Position Michael as the CIO who can reduce complexity, tighten controls, and make internal IT more credible under margin pressure.',
  },
  {
    title: 'Proof to lead with',
    detail:
      'Lead with integration work, budget discipline, and governance wins. Use architecture detail only when it clearly supports a business outcome or control point.',
  },
  {
    title: 'Relationship strategy',
    detail:
      'Prioritize current or former Salesforce technology leaders, retained search partners covering enterprise SaaS, and operators who can vouch for his ability to run control and change at the same time.',
  },
  {
    title: 'Weekly operating rhythm',
    detail:
      'Each week: review company signals, move one meaningful relationship forward, sharpen one company-specific thesis, and end with explicit next actions and owners.',
  },
]

export const WHAT_TO_DEMO_NEXT = [
  'The interview brief itself, with one section expanded live so Mark can see the difference between generic AI output and role-specific prep.',
  'The new-user onboarding flow, especially how quickly a senior executive gets from signup to first actionable company brief.',
  'The daily briefing and follow-up queue, because cadence and loop closure are the behavior engine of the product.',
  'The company-intelligence layer on Salesforce and a small peer set, so the system looks like an operating tool rather than a writing tool.',
]

export const CAREER_TOOLS_LINKS = [
  {
    href: '/career-tools',
    label: 'Career Tools overview for senior executive search',
  },
  {
    href: '/blog/how-cios-find-jobs',
    label: 'How CIOs actually find new jobs',
  },
  {
    href: '/blog/executive-search-firms-cio',
    label: 'What executive search firms actually want from CIO candidates',
  },
  {
    href: '/blog/cio-job-search-timeline',
    label: 'How long a CIO search really takes',
  },
]