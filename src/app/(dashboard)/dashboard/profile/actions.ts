'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'

export async function deleteNotes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('user_profiles')
    .update({
      positioning_summary: null,
      beyond_resume: null,
      career_history_json: null,
    })
    .eq('user_id', user.id)

  revalidatePath('/dashboard/profile')
  redirect('/dashboard/profile?saved=1')
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const searchPersona = (['csuite', 'vp', 'board'] as const).find(v => v === formData.get('search_persona')) ?? null
  const validRoleTypes = ['cio', 'cto', 'cdo_data', 'cdo_digital', 'ciso', 'cpo', 'coo', 'vp_technology', 'other_csuite'] as const
  const roleType = validRoleTypes.find(v => v === formData.get('role_type')) ?? null
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
  const briefingEmail = (formData.get('briefing_email') as string ?? '').trim() || null
  const careerHistoryRaw = (formData.get('career_history_json') as string ?? '').trim()
  let careerHistoryJson: unknown = null
  if (careerHistoryRaw) {
    try { careerHistoryJson = JSON.parse(careerHistoryRaw) } catch { /* ignore malformed */ }
  }

  const securityFrameworks   = parseCsv(formData.get('security_frameworks') as string ?? '')
  const boardSecurityMaturity = (formData.get('board_security_maturity') as string ?? '').trim() || null
  const productTypeExp        = (formData.get('product_type_exp') as string ?? '').trim() || null
  const productAchievement    = (formData.get('product_achievement') as string ?? '').trim() || null
  const productMetric         = (formData.get('product_metric') as string ?? '').trim() || null
  const cooMandateTypes       = formData.getAll('coo_mandate_types') as string[]
  const cooCeoPartnership     = (formData.get('coo_ceo_partnership') as string ?? '').trim() || null
  const ctoTechnicalFlavor    = formData.getAll('cto_technical_flavor') as string[]
  const ctoArchitectureDecision = (formData.get('cto_architecture_decision') as string ?? '').trim() || null
  const dataMaturityOrientation = (formData.get('data_maturity_orientation') as string ?? '').trim() || null
  const dataPlatformBuilt     = (formData.get('data_platform_built') as string ?? '').trim() || null
  const digitalBackgroundType = (formData.get('digital_background_type') as string ?? '').trim() || null
  const digitalTransformationDelivered = (formData.get('digital_transformation_delivered') as string ?? '').trim() || null

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
        briefing_email: briefingEmail,
        target_titles:    targetTitles.length    > 0 ? targetTitles    : null,
        target_sectors:   targetSectors.length   > 0 ? targetSectors   : null,
        target_locations: targetLocations.length > 0 ? targetLocations : null,
        positioning_summary: positioningSummary,
        resume_text: resumeText,
        beyond_resume: beyondResume,
        linkedin_url: linkedinUrl,
        search_persona: searchPersona,
        role_type: roleType,
        career_history_json: careerHistoryJson,
        security_frameworks:   securityFrameworks.length   > 0 ? securityFrameworks   : null,
        board_security_maturity: boardSecurityMaturity,
        product_type_exp:     productTypeExp,
        product_achievement:  productAchievement,
        product_metric:       productMetric,
        coo_mandate_types:    cooMandateTypes.length  > 0 ? cooMandateTypes  : null,
        coo_ceo_partnership:  cooCeoPartnership,
        cto_technical_flavor: ctoTechnicalFlavor.length > 0 ? ctoTechnicalFlavor : null,
        cto_architecture_decision: ctoArchitectureDecision,
        data_maturity_orientation: dataMaturityOrientation,
        data_platform_built:  dataPlatformBuilt,
        digital_background_type: digitalBackgroundType,
        digital_transformation_delivered: digitalTransformationDelivered,
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
