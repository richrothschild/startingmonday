import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('onboarding_completed_at, full_name, current_title, current_company')
    .eq('user_id', user.id)
    .single()

  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    event: 'onboarding_render',
    userId: user.id,
    profileFound: !!profile,
    onboardingCompleted: profile?.onboarding_completed_at ?? null,
    profileError: profileError?.message ?? null,
    profileErrorCode: profileError?.code ?? null,
  }))

  if (profile?.onboarding_completed_at) redirect('/dashboard')

  return <OnboardingForm profile={profile} />
}
