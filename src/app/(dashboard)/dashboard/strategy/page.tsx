import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { StrategyClient } from './strategy-client'

export const metadata = {
  title: 'Search Strategy Brief - Starting Monday',
}

export default async function StrategyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed_at, current_title, current_company, target_titles, positioning_summary, resume_text')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed_at) redirect('/onboarding')

  const missing: { label: string; anchor: string }[] = []
  if (!profile?.current_title && !profile?.current_company)
    missing.push({ label: 'Current or most recent role', anchor: 'current_title' })
  if (!profile?.target_titles?.length)
    missing.push({ label: 'Target titles (e.g. CIO, VP of Technology)', anchor: 'target_titles' })
  if (!profile?.resume_text && !profile?.positioning_summary)
    missing.push({ label: 'Resume or positioning summary', anchor: 'resume_text' })

  return (
    <main>
      <Breadcrumbs
        className="mb-4 px-4 sm:px-6 pt-6 max-w-6xl mx-auto"
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Search Strategy' },
        ]}
      />
      <h1 className="sr-only">Search Strategy Brief</h1>
      <nav className="sr-only" aria-label="Strategy quick actions">
        <Link href="/dashboard">Back to dashboard</Link>
        <Link href="/dashboard">Review target companies</Link>
        <Link href="/onboarding">Complete onboarding inputs</Link>
      </nav>
      <StrategyClient missingFields={missing} />
    </main>
  )
}
