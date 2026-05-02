import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PRICE_IDS: Record<string, string> = {
  monitor: process.env.STRIPE_PRICE_MONITOR!,
  active: process.env.STRIPE_PRICE_ACTIVE!,
}
