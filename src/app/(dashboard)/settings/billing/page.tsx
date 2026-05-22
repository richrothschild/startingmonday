import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/subscription'
import { canUserSeeAdminHeader } from '@/lib/staff'
import { BillingClient } from './billing-client'

export const metadata = { title: 'Billing - Starting Monday' }

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [sub, profileResult] = await Promise.all([
    getUserSubscription(user.id),
    supabase.from('user_profiles').select('full_name, placed_at').eq('user_id', user.id).single(),
  ])

  const accountName = profileResult.data?.full_name ?? null
  const isPlaced = !!profileResult.data?.placed_at
  const canSeeAdminHeader = await canUserSeeAdminHeader(user.email ?? '')

  return (
    <main>
      <h1 className="sr-only">Billing Settings</h1>
      <nav className="sr-only" aria-label="Billing quick actions">
        <Link href="/settings/security">Back to settings</Link>
        <Link href="/settings/security">Open security settings</Link>
        <Link href="/dashboard">Return to dashboard</Link>
      </nav>
      <BillingClient sub={sub} hasStripeCustomer={sub.isPaid} accountEmail={user.email ?? ''} accountName={accountName} isPlaced={isPlaced} canSeeAdminHeader={canSeeAdminHeader} />
    </main>
  )
}
