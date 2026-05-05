'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function parseCsv(raw: string) {
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const searchPersona       = (formData.get('search_persona') as string) || null
  const fullName            = (formData.get('full_name') as string ?? '').trim() || null
  const currentTitle        = (formData.get('current_title') as string ?? '').trim() || null
  const currentCompany      = (formData.get('current_company') as string ?? '').trim() || null
  const employmentStatus    = (formData.get('employment_status') as string) || null
  const searchTimeline      = (formData.get('search_timeline') as string) || null
  const linkedinUrl         = (formData.get('linkedin_url') as string ?? '').trim() || null
  const targetTitles        = parseCsv(formData.get('target_titles') as string ?? '')
  const targetSectors       = parseCsv(formData.get('target_sectors') as string ?? '')
  const targetLocations     = parseCsv(formData.get('target_locations') as string ?? '')
  const dreamCompanies      = (formData.get('dream_companies') as string ?? '').trim() || null
  const dreamJob            = (formData.get('dream_job') as string ?? '').trim() || null
  const positioningSummary  = (formData.get('positioning_summary') as string ?? '').trim() || null
  const resumeText          = (formData.get('resume_text') as string ?? '').trim() || null
  const beyondResume        = (formData.get('beyond_resume') as string ?? '').trim() || null

  if (resumeText && resumeText.length > 100_000) redirect('/onboarding?error=resume_too_long')

  await supabase.from('user_profiles').upsert(
    {
      user_id:                  user.id,
      search_persona:           searchPersona,
      full_name:                fullName,
      current_title:            currentTitle,
      current_company:          currentCompany,
      employment_status:        employmentStatus,
      search_timeline:          searchTimeline,
      linkedin_url:             linkedinUrl,
      target_titles:            targetTitles.length > 0 ? targetTitles : null,
      target_sectors:           targetSectors.length > 0 ? targetSectors : null,
      target_locations:         targetLocations.length > 0 ? targetLocations : null,
      dream_companies:          dreamCompanies,
      dream_job:                dreamJob,
      positioning_summary:      positioningSummary,
      resume_text:              resumeText,
      beyond_resume:            beyondResume,
      onboarding_completed_at:  new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  redirect('/dashboard/start')
}

export async function skipOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('user_profiles').upsert(
    { user_id: user.id, onboarding_completed_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )

  redirect('/dashboard/start')
}
