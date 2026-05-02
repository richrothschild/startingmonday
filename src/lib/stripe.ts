import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  monitor: {
    name: 'Monitor',
    priceId: process.env.STRIPE_PRICE_MONITOR!,
    amount: 4900,
    description: 'Career page scanning, weekly digest, pipeline tracking',
  },
  active: {
    name: 'Active',
    priceId: process.env.STRIPE_PRICE_ACTIVE!,
    amount: 12900,
    description: 'Everything in Monitor + AI briefs, strategy, outreach drafting, daily briefing',
  },
} as const

export type PlanKey = keyof typeof PLANS
