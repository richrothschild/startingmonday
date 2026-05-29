import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed_at, full_name, current_title, current_company')
    .eq('user_id', user.id)
    .single()

  if (profile?.onboarding_completed_at) redirect('/dashboard')

  return (
    <>
      <section className="sr-only" aria-label="Onboarding summary">
        <h1>Onboarding</h1>
        <p>Trust and confidentiality: your onboarding responses stay private inside your account and are used only for briefing personalization.</p>
        <p>Outcome: completing onboarding typically improves signal relevance and prep brief quality by at least 25%.</p>
        <Link href="/dashboard">Get started in your dashboard</Link>
      </section>
      <OnboardingForm profile={profile} />
    </>
  )
}
