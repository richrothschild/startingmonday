import Stripe from 'stripe'

const STRIPE_API_VERSION = '2026-04-22.dahlia' as const satisfies Stripe.LatestApiVersion

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION })
  }
  return _stripe
}

// Throws immediately if the env var is missing rather than silently using ''
// which would produce a cryptic "No such price" error from Stripe.
export function getPriceId(plan: string): string {
  const envKey = `STRIPE_PRICE_${plan.toUpperCase()}`
  const id = process.env[envKey]
  if (!id) throw new Error(`${envKey} is not set`)
  return id
}
