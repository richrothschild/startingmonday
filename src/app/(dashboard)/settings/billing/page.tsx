import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/subscription'
import { BillingClient } from './billing-client'

export const metadata = { title: 'Billing — Starting Monday' }

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [sub, profileResult] = await Promise.all([
    getUserSubscription(user.id),
    supabase.from('user_profiles').select('full_name').eq('user_id', user.id).single(),
  ])

  const accountName = profileResult.data?.full_name ?? null

  return <BillingClient sub={sub} hasStripeCustomer={sub.isPaid} accountEmail={user.email ?? ''} accountName={accountName} />
}
