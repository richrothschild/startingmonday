import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/subscription'
import { BillingClient } from './billing-client'

export const metadata = { title: 'Billing — Starting Monday' }

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sub = await getUserSubscription(user.id)
  const { data: userData } = await supabase.from('users').select('stripe_customer_id').eq('id', user.id).single()
  const hasStripeCustomer = !!userData?.stripe_customer_id

  return <BillingClient sub={sub} hasStripeCustomer={hasStripeCustomer} />
}
