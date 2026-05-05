'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const searchPersona = (['csuite', 'vp', 'board'] as const).find(v => v === formData.get('search_persona')) ?? null
  const fullName      = (formData.get('full_name')      as string ?? '').trim() || null
  const currentTitle  = (formData.get('current_title')  as string ?? '').trim() || null
  const currentCompany = (formData.get('current_company') as string ?? '').trim() || null
  const briefingTime  = (formData.get('briefing_time')  as string) || null
  const briefingDays  = formData.getAll('briefing_days') as string[]

  const parseCsv = (raw: string) =>
    raw.split(',').map(s => s.trim()).filter(Boolean)

  const targetTitles    = parseCsv(formData.get('target_titles')    as string ?? '')
  const targetSectors   = parseCsv(formData.get('target_sectors')   as string ?? '')
  const targetLocations = parseCsv(formData.get('target_locations') as string ?? '')
  const positioningSummary = (formData.get('positioning_summary') as string ?? '').trim() || null
  const resumeText = (formData.get('resume_text') as string ?? '').trim() || null
  const beyondResume = (formData.get('beyond_resume') as string ?? '').trim() || null
  const linkedinUrl = (formData.get('linkedin_url') as string ?? '').trim() || null

  const { error: upsertError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: user.id,
        full_name: fullName,
        current_title: currentTitle,
        current_company: currentCompany,
        briefing_time: briefingTime,
        briefing_days: briefingDays.length > 0 ? briefingDays : null,
        target_titles:    targetTitles.length    > 0 ? targetTitles    : null,
        target_sectors:   targetSectors.length   > 0 ? targetSectors   : null,
        target_locations: targetLocations.length > 0 ? targetLocations : null,
        positioning_summary: positioningSummary,
        resume_text: resumeText,
        beyond_resume: beyondResume,
        linkedin_url: linkedinUrl,
        search_persona: searchPersona,
      },
      { onConflict: 'user_id' }
    )

  if (upsertError) redirect('/dashboard/profile?error=save-failed')

  if (resumeText) {
    await logEvent(user.id, 'resume_uploaded', {})
    captureServerEvent(user.id, 'resume_uploaded', {})
  }

  if (briefingTime) {
    await logEvent(user.id, 'briefing_configured', { briefing_time: briefingTime })
    captureServerEvent(user.id, 'briefing_configured', { briefing_time: briefingTime })
  }

  revalidatePath('/dashboard')
  redirect('/dashboard/profile?saved=1')
}
