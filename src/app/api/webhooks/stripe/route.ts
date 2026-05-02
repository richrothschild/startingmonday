import { type NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      const userId = session.subscription_data?.metadata?.userId
        ?? (session.metadata?.userId as string | undefined)
      const plan = session.subscription_data?.metadata?.plan as string | undefined
      if (userId && plan) {
        await supabase.from('users').update({
          subscription_tier: plan,
          subscription_status: 'active',
          trial_ends_at: null,
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (!userId) break
      const status = sub.status === 'active' ? 'active'
        : sub.status === 'past_due' ? 'past_due'
        : sub.status === 'canceled' ? 'canceled'
        : 'inactive'
      const plan = (sub.metadata?.plan ?? 'free') as string
      await supabase.from('users').update({
        subscription_tier: status === 'active' ? plan : 'free',
        subscription_status: status,
        subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq('id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (!userId) break
      await supabase.from('users').update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq('id', userId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
      if (!customerId) break
      await supabase.from('users').update({
        subscription_status: 'past_due',
      }).eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
