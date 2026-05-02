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

  return <BillingClient sub={sub} />
}
