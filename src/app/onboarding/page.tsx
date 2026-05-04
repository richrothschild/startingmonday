import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed_at, full_name, current_title, current_company')
    .eq('user_id', user.id)
    .single()

  if (profile?.onboarding_completed_at) redirect('/dashboard')

  const errorMessage = error === 'resume_too_long'
    ? 'Your resume text is too long (100,000 character limit). Trim it down and try again.'
    : null

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">

        <div className="mb-10">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Set up your profile</h1>
          <p className="text-[14px] text-slate-500 mt-2 leading-relaxed max-w-lg">
            Takes about 5 minutes. Everything here feeds your interview prep briefs, daily briefing, and AI assistant. You can edit any of this later.
          </p>
        </div>

        <OnboardingForm profile={profile} errorMessage={errorMessage} />

      </main>
    </div>
  )
}
