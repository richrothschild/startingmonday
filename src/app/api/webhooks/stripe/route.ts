import { type NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Idempotency: skip events we've already processed (handles Stripe retries)
  const { error: dupError } = await supabase
    .from('processed_stripe_events')
    .insert({ event_id: event.id })
  if (dupError) {
    // Unique violation = already processed
    if (dupError.code === '23505') return NextResponse.json({ received: true })
    // Any other insert error: fail so Stripe retries
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  let updateError: { message: string } | null = null

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      if (userId && plan) {
        const customerId = typeof session.customer === 'string'
          ? session.customer
          : (session.customer as Stripe.Customer | null)?.id ?? null
        const { error } = await supabase.from('users').update({
          subscription_tier: plan,
          subscription_status: 'active',
          trial_ends_at: null,
          ...(customerId ? { stripe_customer_id: customerId } : {}),
        }).eq('id', userId)
        updateError = error
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (!userId) break
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paused = !!(sub as any).pause_collection?.behavior
      const status = paused ? 'paused'
        : sub.status === 'active' ? 'active'
        : sub.status === 'trialing' ? 'trialing'
        : sub.status === 'past_due' ? 'past_due'
        : sub.status === 'canceled' ? 'canceled'
        : 'inactive'
      const plan = (sub.metadata?.plan ?? 'free') as string
      const update: Record<string, string | null> = {
        subscription_tier: status === 'active' || status === 'trialing' ? plan : 'free',
        subscription_status: status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subscription_period_end: (sub as any).current_period_end
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? new Date((sub as any).current_period_end * 1000).toISOString()
          : null,
      }
      // Clear trial_ends_at when subscription converts from trial to paid
      if (status === 'active' && sub.trial_end) {
        update.trial_ends_at = null
      }
      const { error } = await supabase.from('users').update(update).eq('id', userId)
      updateError = error
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (!userId) break
      const { error } = await supabase.from('users').update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subscription_period_end: (sub as any).current_period_end
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? new Date((sub as any).current_period_end * 1000).toISOString()
          : null,
      }).eq('id', userId)
      updateError = error
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : (invoice.customer as Stripe.Customer | null)?.id
      if (!customerId) break
      const { error } = await supabase.from('users').update({
        subscription_status: 'past_due',
      }).eq('stripe_customer_id', customerId)
      updateError = error

      // Notify the user their payment failed so they can update their card
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('stripe_customer_id', customerId)
        .single()
      if (userData?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
        await sendEmail({
          to: userData.email,
          subject: 'Action required: your Starting Monday payment failed',
          html: `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:560px;margin:40px auto;padding:0 16px;color:#334155">
<p style="font-size:16px;font-weight:700;color:#0f172a">Payment failed</p>
<p>Your most recent Starting Monday payment could not be processed. Your account has been marked past due and AI features may be restricted.</p>
<p><a href="${appUrl}/settings/billing" style="display:inline-block;background:#0f172a;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:14px;font-weight:600">Update payment method</a></p>
<p style="font-size:13px;color:#64748b">If you believe this is an error, reply to this email and we will sort it out.</p>
</body></html>`,
        }).catch(() => {/* non-fatal; DB is already updated */})
      }
      break
    }

    case 'customer.deleted': {
      const customer = event.data.object as Stripe.Customer
      const { error } = await supabase.from('users').update({
        stripe_customer_id: null,
        subscription_status: 'inactive',
        subscription_tier: 'free',
      }).eq('stripe_customer_id', customer.id)
      updateError = error
      break
    }
  }

  if (updateError) {
    // Tell Stripe the event wasn't processed so it retries
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
