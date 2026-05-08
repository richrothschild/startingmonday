export const PLANS = {
  passive: {
    name: 'Intelligence',
    amount: 4900,
    quarterlyAmount: 13200,
    description: 'Company signal monitoring, exec moves, funding rounds, and weekly digest',
    features: [
      'Pipeline tracking for up to 25 companies',
      'Signal scans 3x per week',
      'Exec move and funding alerts',
      'Weekly signal digest',
      'Contact tracker',
    ],
  },
  active: {
    name: 'Search',
    amount: 19900,
    quarterlyAmount: 53700,
    description: 'Full search operating system with AI briefs, daily briefing, and outreach',
    features: [
      'Everything in Intelligence',
      'AI Interview Prep Briefs',
      'Search Strategy Brief',
      'AI Chat advisor',
      'Outreach drafting',
      'Resume tailoring',
      'Daily morning briefing',
    ],
  },
  executive: {
    name: 'Executive',
    amount: 24900,
    quarterlyAmount: 67200,
    description: 'For C-suite candidates who need daily intelligence and salary leverage',
    features: [
      'Everything in Search',
      'Unlimited company pipeline',
      'Daily career page scanning (2x/day)',
      'Salary intelligence and negotiation scripts',
      'Recruiter tracker with firm grouping',
      'Priority contact flagging and CSV export',
      'Immediate pattern and exec departure alerts',
      'Opus AI for interview prep briefs',
    ],
  },
} as const

export const WAITLIST_PLANS = {
  campaign: {
    name: 'Campaign',
    amount: 99900,
    description: '90-day managed campaign with human delivery. Built for the search that cannot afford to miss.',
    features: [
      'Everything in Executive',
      '1:1 strategy session with a search expert',
      'Curated recruiter introductions',
      'Concierge brief review and coaching',
      '3-month minimum, limited availability',
    ],
    cta: 'Apply for Campaign',
  },
} as const

export type PlanKey = keyof typeof PLANS
export type BillingInterval = 'monthly' | 'quarterly'
