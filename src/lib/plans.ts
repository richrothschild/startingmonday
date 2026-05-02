export const PLANS = {
  monitor: {
    name: 'Monitor',
    amount: 4900,
    description: 'Career page scanning, weekly digest, pipeline tracking',
  },
  active: {
    name: 'Active',
    amount: 12900,
    description: 'Everything in Monitor + AI briefs, strategy, outreach drafting, daily briefing',
  },
} as const

export type PlanKey = keyof typeof PLANS
