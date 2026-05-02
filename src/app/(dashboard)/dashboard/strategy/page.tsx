import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StrategyClient } from './strategy-client'

export const metadata = {
  title: 'Search Strategy Brief — Starting Monday',
}

export default async function StrategyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed_at, positioning_summary, resume_text')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed_at) redirect('/onboarding')

  const hasProfile = !!(profile?.positioning_summary || profile?.resume_text)

  return <StrategyClient hasProfile={hasProfile} />
}
