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

export const SAMPLE_SIGNAL_ITEMS = [
  'CFO departure disclosed in an 8-K after market close',
  'Two VP-level technology openings posted within 48 hours',
  'Private equity operating partner added to the board this week',
]

export const FULL_SAMPLE_SIGNAL_BRIEF = {
  company: 'Meridian Systems',
  date: 'March 14, 2026',
  signals: [
    'CFO departure disclosed in an 8-K after market close',
    'Two VP-level technology openings posted within 48 hours',
    'Private equity operating partner added to the board this week',
  ],
  impact: 'Post-acquisition integration risk visible.',
  recommendedAction: 'Send one reconnection note today and move status to Active Outreach.',
  waitlistAction: 'Monitor for formal CFO mandate details.',
}

export const SAMPLE_PREP_BRIEF_POINTS = [
  'Win thesis: stabilize a post-acquisition technology stack without slowing revenue operations.',
  'Likely objection: concern that your turnaround depth outweighs product-led growth experience.',
  'Peer-level question: how is the board measuring integration success across the first two operating reviews?',
]

export const FULL_SAMPLE_PREP_BRIEF = {
  company: 'Meridian Systems',
  role: 'EVP, Technology Integration',
  search: 'PE-backed post-acquisition integration lead',
  winThesis: 'Stabilize post-acquisition technology without slowing revenue operations.',
  yourBackground: '12 years leading technology consolidation across four acquisitions.',
  likelyObjections: [
    'Is your turnaround depth balanced with product-led growth needs?',
    'Can you balance pace with risk?',
  ],
  peerLevelQuestions: [
    'How is the board measuring integration success this quarter?',
    'What is the appetite for replacing vs consolidating inherited systems?',
  ],
  whatToLeaveOut: 'Do not lead with timeline detail. Lead with integration outcomes.',
  preparedTalking: 'Two-minute summary ready before session.',
}

export const PROOF_METRICS = [
  {
    value: '81%',
    label: 'of the Jan-May 2026 executive pilot cohort reached a first interview within 30 days',
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

export const COACH_FIT = [
  {
    title: 'Career transition coaches',
    detail: 'Best fit when clients need speed, accountability, and earlier signal visibility in the first 30-90 days.',
  },
  {
    title: 'VP-to-CXO coaches',
    detail: 'Best fit when clients need long-cycle narrative discipline and shared context across months, not just weeks.',
  },
  {
    title: 'Search-affiliate coaches',
    detail: 'Best fit when interview prep quality and pipeline visibility affect placement outcomes immediately.',
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

export const PREVIEW_SENTENCE = 'In 15 minutes, you see one coach seat, two to three client seats, and a simple way to easily stay on top of each client in one place.'

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
      '"I am spending too much time on prep and admin, not strategy"',
      '"My client is too busy, so important prep gets skipped"',
      '"I do not want to coach half-blind between sessions"',
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
