'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFormSchema } from '@/lib/schemas'
import { captureServerEvent } from '@/lib/posthog-server'
import { logEvent } from '@/lib/events'
import { computeElapsedSeconds, isTransitionFirstCohort, normalizeOnboardingChannel } from '@/lib/onboarding-speed'

function parseCsv(raw: string) {
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const searchPersona       = (formData.get('search_persona') as string) || null
  const onboardingChannel   = normalizeOnboardingChannel((formData.get('onboarding_channel') as string) || null)
  const onboardingLowEnergy = (formData.get('onboarding_low_energy') as string) === 'true'
  const onboardingStartedAt = (formData.get('onboarding_started_at') as string ?? '').trim() || null
  const elapsedSecondsRaw   = Number(formData.get('onboarding_elapsed_seconds') as string ?? '0')
  const elapsedSeconds      = Number.isFinite(elapsedSecondsRaw) && elapsedSecondsRaw > 0
    ? Math.round(elapsedSecondsRaw)
    : computeElapsedSeconds(onboardingStartedAt)
  const manualFieldsBaseline = Number(formData.get('manual_fields_baseline') as string ?? '0')
  const manualFieldsRequired = Number(formData.get('manual_fields_required') as string ?? '0')
  const manualFieldsReductionRate = Number(formData.get('manual_fields_reduction_rate') as string ?? '0')
  const fullName            = (formData.get('full_name') as string ?? '').trim() || null
  const currentTitle        = (formData.get('current_title') as string ?? '').trim() || null
  const currentCompany      = (formData.get('current_company') as string ?? '').trim() || null
  const employmentStatus    = (formData.get('employment_status') as string) || null
  const searchTimeline      = (formData.get('search_timeline') as string) || null
  const searchDriver        = (formData.get('search_driver') as string ?? '').trim() || null
  const linkedinUrl         = (formData.get('linkedin_url') as string ?? '').trim() || null
  const targetTitles        = parseCsv(formData.get('target_titles') as string ?? '')
  const targetSectors       = parseCsv(formData.get('target_sectors') as string ?? '')
  const targetLocations     = parseCsv(formData.get('target_locations') as string ?? '')
  const dreamCompanies      = (formData.get('dream_companies') as string ?? '').trim() || null
  const dreamJob            = (formData.get('dream_job') as string ?? '').trim() || null
  const positioningSummary  = (formData.get('positioning_summary') as string ?? '').trim() || null
  const resumeText          = (formData.get('resume_text') as string ?? '').trim() || null
  const beyondResume        = (formData.get('beyond_resume') as string ?? '').trim() || null
  const careerHistoryRaw    = (formData.get('career_history_json') as string ?? '').trim()
  let careerHistoryJson: unknown = null
  if (careerHistoryRaw) {
    try { careerHistoryJson = JSON.parse(careerHistoryRaw) } catch { /* ignore malformed */ }
  }

  const briefingTime        = (formData.get('briefing_time') as string ?? '').trim() || null
  const briefingFrequency   = (formData.get('briefing_frequency') as string ?? '').trim() || 'daily'
  const companyNamesRaw     = (formData.get('company_names') as string ?? '').trim()
  let companyNamesList: string[] = []
  if (companyNamesRaw) {
    try {
      const parsed = JSON.parse(companyNamesRaw)
      if (Array.isArray(parsed)) companyNamesList = parsed.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).slice(0, 8)
    } catch { /* ignore */ }
  }

  const validation = OnboardingFormSchema.safeParse({ full_name: fullName, search_persona: searchPersona })
  if (!validation.success) {
    const msg = validation.error.issues[0]?.message ?? 'Required fields missing'
    redirect(`/onboarding?error=${encodeURIComponent(msg)}`)
  }

  if (resumeText && resumeText.length > 100_000) redirect('/onboarding?error=resume_too_long')

  const searchPath =
    (employmentStatus === 'employed_exploring' && searchTimeline === 'opportunistic') ? 'watcher' :
    (employmentStatus === 'between_roles' && searchTimeline === 'immediately') ? 'nurture' :
    'campaign'
  const transitionFirst = isTransitionFirstCohort(employmentStatus, searchTimeline)
  const underTenMinutes = elapsedSeconds > 0 && elapsedSeconds <= 600

  const now = new Date().toISOString()

  await supabase.from('user_profiles').upsert(
    {
      user_id:                  user.id,
      search_persona:           searchPersona,
      full_name:                fullName,
      current_title:            currentTitle,
      current_company:          currentCompany,
      employment_status:        employmentStatus,
      search_timeline:          searchTimeline,
      search_driver:            searchDriver,
      search_path:              searchPath,
      linkedin_url:             linkedinUrl,
      target_titles:            targetTitles.length > 0 ? targetTitles : null,
      target_sectors:           targetSectors.length > 0 ? targetSectors : null,
      target_locations:         targetLocations.length > 0 ? targetLocations : null,
      dream_companies:          dreamCompanies,
      dream_job:                dreamJob,
      positioning_summary:      positioningSummary,
      resume_text:              resumeText,
      beyond_resume:            beyondResume,
      career_history_json:      careerHistoryJson,
      briefing_time:            briefingTime,
      briefing_frequency:       briefingFrequency,
      onboarding_completed_at:  now,
    },
    { onConflict: 'user_id' }
  )

  // Create basic company records from wizard. No career page URL yet; user adds those from the dashboard.
  if (companyNamesList.length > 0) {
    const rows = companyNamesList.map(name => ({
      user_id: user.id,
      name: name.trim(),
      stage: 'target',
    }))
    await supabase.from('companies').upsert(rows, { onConflict: 'user_id,name', ignoreDuplicates: true })
  }

  // Set search_started_at only on first completion; don't overwrite if already set
  await supabase
    .from('user_profiles')
    .update({ search_started_at: now })
    .eq('user_id', user.id)
    .is('search_started_at', null)

  captureServerEvent(user.id, 'onboarding_completed', {
    search_path: searchPath,
    search_persona: searchPersona ?? '',
    employment_status: employmentStatus ?? '',
    company_count: companyNamesList.length,
    onboarding_channel: onboardingChannel,
    onboarding_low_energy: onboardingLowEnergy,
    onboarding_elapsed_seconds: elapsedSeconds,
    onboarding_under_ten_minutes: underTenMinutes,
    transition_first: transitionFirst,
    manual_fields_baseline: Number.isFinite(manualFieldsBaseline) ? manualFieldsBaseline : null,
    manual_fields_required: Number.isFinite(manualFieldsRequired) ? manualFieldsRequired : null,
    manual_fields_reduction_rate: Number.isFinite(manualFieldsReductionRate) ? manualFieldsReductionRate : null,
  })
  await logEvent(user.id, 'onboarding_completed', {
    search_path: searchPath,
    search_persona: searchPersona ?? '',
    employment_status: employmentStatus ?? '',
    company_count: companyNamesList.length,
    onboarding_channel: onboardingChannel,
    onboarding_low_energy: onboardingLowEnergy,
    onboarding_elapsed_seconds: elapsedSeconds,
    onboarding_under_ten_minutes: underTenMinutes,
    transition_first: transitionFirst,
    manual_fields_baseline: Number.isFinite(manualFieldsBaseline) ? manualFieldsBaseline : null,
    manual_fields_required: Number.isFinite(manualFieldsRequired) ? manualFieldsRequired : null,
    manual_fields_reduction_rate: Number.isFinite(manualFieldsReductionRate) ? manualFieldsReductionRate : null,
  })

  redirect('/dashboard/start')
}

export async function skipOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date().toISOString()

  await supabase.from('user_profiles').upsert(
    { user_id: user.id, onboarding_completed_at: now },
    { onConflict: 'user_id' }
  )

  await supabase
    .from('user_profiles')
    .update({ search_started_at: now })
    .eq('user_id', user.id)
    .is('search_started_at', null)

  redirect('/dashboard/start')
}
