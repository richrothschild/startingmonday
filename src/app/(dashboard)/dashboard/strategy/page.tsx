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
    .select('onboarding_completed_at, full_name, current_title, current_company, target_titles, positioning_summary, resume_text')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed_at) redirect('/onboarding')

  const missing: string[] = []
  if (!profile?.current_title && !profile?.current_company)
    missing.push('Current or most recent role')
  if (!profile?.target_titles?.length)
    missing.push('Target titles (e.g. CIO, VP of Technology)')
  if (!profile?.resume_text && !profile?.positioning_summary)
    missing.push('Resume or positioning summary')

  return <StrategyClient missingFields={missing} />
}
