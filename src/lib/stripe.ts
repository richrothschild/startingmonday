import Stripe from 'stripe'

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
  }
  return _stripe
}

export const PRICE_IDS: Record<string, string> = {
  monitor: process.env.STRIPE_PRICE_MONITOR ?? '',
  active: process.env.STRIPE_PRICE_ACTIVE ?? '',
}
