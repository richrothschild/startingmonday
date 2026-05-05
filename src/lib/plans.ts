export const PLANS = {
  passive: {
    name: 'Passive',
    amount: 4900,
    quarterlyAmount: 13200,
    description: 'Career page scanning at your target companies, weekly digest, pipeline tracking',
    features: [
      'Pipeline tracking for up to 25 companies',
      'Career page scans 3x per week',
      'Weekly signal digest',
      'Contact tracker',
    ],
  },
  active: {
    name: 'Active',
    amount: 19900,
    quarterlyAmount: 53700,
    description: 'Full search operating system with AI briefs, strategy, and daily briefing',
    features: [
      'Everything in Passive',
      'AI Interview Prep Briefs',
      'Search Strategy Brief',
      'AI Chat advisor',
      'Outreach drafting',
      'Resume tailoring',
      'Daily morning briefing',
    ],
  },
} as const

export const WAITLIST_PLANS = {
  executive: {
    name: 'Executive',
    amount: 49900,
    description: 'For C-suite candidates managing a high-stakes search with board-level targets',
    features: [
      'Everything in Active',
      'Unlimited company pipeline',
      'Priority brief generation',
      'Board and PE firm intelligence',
      'Dedicated account review (coming)',
    ],
    cta: 'Join waitlist',
  },
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
