export const WHAT_CHANGES = [
  {
    before: 'You rebuild context at the start of every session because your client has not tracked anything.',
    after: 'You have pipeline view access. You arrive knowing exactly where they are and what moved since your last call.',
  },
  {
    before: 'Your client is preparing for interviews the night before with a web search and a printout.',
    after: 'The prep brief is usually ready in about a minute. Win thesis, likely objections, peer-level questions, what to leave out. You can read it before the session.',
  },
]

export const COACH_PROOF_STRIPS = [
  {
    value: '81%',
    label: 'of the Jan.-May 2026 pilot cohort reached a first interview within 30 days',
  },
  {
    value: '9 days',
    label: 'median time from setup to first qualified outreach in the same cohort',
  },
  {
    value: '27',
    label: 'executives included in the current verified pilot evidence snapshot',
  },
]

export const COACH_SCOREBOARD = [
  {
    label: 'Companies updated weekly',
    target: '3-5',
    note: 'If fewer are moving, the pipeline is drifting or too broad.',
  },
  {
    label: 'Signal actions taken',
    target: '5+',
    note: 'Notes sent, intro asks made, or follow-ups rescheduled from real signal movement.',
  },
  {
    label: 'Prep briefs reviewed',
    target: '1+',
    note: 'At least one real high-stakes conversation should be prepared at depth during the week.',
  },
  {
    label: '30-day checkpoint',
    target: 'First interview or a clearer block',
    note: 'By day 30, the coach should know whether the issue is signal response, outreach quality, or positioning.',
  },
]

export const PREVIEW_SENTENCE = 'In 15 minutes, you see one coach seat, two to three client seats, and a simple way to stay on top of each client in one place.'

export const COUNCIL_BUY_SIGNALS = [
  {
    title: 'Outcomes they will pay for',
    points: [
      'Clients arrive prepared for high-stakes meetings',
      'Less session time rebuilding context from memory',
      'Faster first interviews and cleaner weekly momentum',
    ],
  },
  {
    title: 'Feelings to address directly',
    points: [
      'I am spending too much time on prep and admin, not strategy',
      'My client is too busy, so important prep gets skipped',
      'I do not want to coach half-blind between sessions',
    ],
  },
  {
    title: 'What Starting Monday offers',
    points: [
      'Shared coach-client signal and pipeline visibility',
      'Prep briefs usually ready in about a minute',
      '30-day pass/fail scorecard before any rollout decision',
    ],
  },
]

export const PILOT_SCORECARD = [
  {
    metric: 'Week 1 signal action',
    success: 'At least one signal-driven action logged for each pilot client.',
  },
  {
    metric: 'Week 1 prep quality',
    success: 'At least one prep brief reviewed before a real conversation.',
  },
  {
    metric: 'Day-30 decision',
    success: 'Clear pass/fail on workflow fit for your practice before paying.',
  },
]

export const ROLE_BOUNDARY = {
  platform: [
    'Detects signal movement and keeps the pipeline current between sessions',
    'Generates prep briefs and tracks execution activity',
    'Surfaces weekly risk markers and overdue actions',
  ],
  coach: [
    'Owns strategic judgment, narrative calibration, and accountability coaching',
    'Decides where to focus client effort and when to change search strategy',
  ],
}

export const WEEKLY_REVIEW_TEMPLATE = [
  'What changed in signals since last week, and which two changes matter most?',
  'Which companies moved stage, and which are stalled?',
  'What one action must happen before next session to protect momentum?',
]

export const COACH_BUYER_PLANS = [
  {
    name: 'Starter Coach',
    price: '$99/mo + $39 per active client seat',
    fit: 'Best for solo coaches running a small number of active transitions.',
  },
  {
    name: 'Studio Coach',
    price: '$249/mo',
    fit: 'Best for boutique coaches who want predictable spend for a small active client book.',
  },
  {
    name: 'Team Coach',
    price: '$599/mo',
    fit: 'Best for firms with multiple active transitions that need shared visibility and workload control.',
  },
]

export const COACH_RYTHM = [
  {
    title: 'Monday',
    label: 'Review the pipeline',
    detail: 'Update stages, remove stale paths, and choose the priority contact and company for the week.',
  },
  {
    title: 'Every morning',
    label: 'Act on overnight signals',
    detail: 'Make one decision first: who to contact now based on fresh signal movement.',
  },
  {
    title: 'Before each interview',
    label: 'Run the prep brief',
    detail: 'Generate win thesis, likely objections, and peer-level questions before the session starts.',
  },
]
