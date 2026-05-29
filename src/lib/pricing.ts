// Single source of truth for all pricing display values.
// Update here when prices change - everything else reads from this file.
// Stripe price IDs live in .env.local (STRIPE_PRICE_*).

export const PRICING = {
  passive: {
    key: 'passive' as const,
    name: 'Intelligence',
    monthly: 49,
    quarterly: 132,
    annual: 490,
    annualMonthly: 41,
  },
  active: {
    key: 'active' as const,
    name: 'Active',
    monthly: 199,
    quarterly: 469,
    annual: 1990,
    annualMonthly: 166,
  },
  executive: {
    key: 'executive' as const,
    name: 'Executive',
    monthly: 499,
    quarterly: 1200,
    annual: 5000,
    annualMonthly: 417,
  },
  concierge: {
    key: 'concierge' as const,
    name: 'Concierge',
    monthly: 1299,
    quarterly: null,
    annual: 13999,
    annualMonthly: 1167,
  },
} as const

export type PricingTier = keyof typeof PRICING

export function fmtPrice(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}
