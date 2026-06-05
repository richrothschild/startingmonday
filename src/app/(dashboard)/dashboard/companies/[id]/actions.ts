'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'
import { markOfferAccepted, logEvent } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'
import { PMF_EVENTS } from '@/lib/pmf-event-taxonomy'
import { str, numOrNull } from '@/lib/form-utils'

function normalizeUrl(raw: string | null): string | null {
  if (!raw) return null
  const t = raw.trim()
  if (!t) return null
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}

function isMissingCompetitiveContextColumn(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  const msg = error.message?.toLowerCase() ?? ''
  return error.code === '42703' || (msg.includes('competitive_context') && msg.includes('does not exist'))
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (isDemoUser(user.id)) redirect(`/signup?from=demo`)

  const name = str(formData, 'name')
  const sector = str(formData, 'sector') || null
  const stage = str(formData, 'stage') || 'watching'
  const fitScore = numOrNull(formData, 'fit_score')
  const companyUrl = normalizeUrl(str(formData, 'company_url'))
  const careerPageUrl = normalizeUrl(str(formData, 'career_page_url'))
  const linkedinUrl = normalizeUrl(str(formData, 'linkedin_url'))
  const crunchbaseId = str(formData, 'crunchbase_id')?.trim().replace(/^https?:\/\/(www\.)?crunchbase\.com\/organization\//i, '').replace(/\/$/, '') || null
  const notes = str(formData, 'notes') || null
  const competitiveContext = str(formData, 'competitive_context') || null
  const interviewNotes = str(formData, 'interview_notes') || null
  const validSizes = ['startup', 'midmarket', 'enterprise'] as const
  const companySize = validSizes.find(v => v === str(formData, 'company_size')) ?? null
  const roleWatchDescription = str(formData, 'role_watch_description') || null
  const offerRoleTitle = str(formData, 'offer_role_title') || null
  const offerBase      = numOrNull(formData, 'offer_base')
  const offerBonusPct  = numOrNull(formData, 'offer_bonus_pct')
  const offerSigning   = numOrNull(formData, 'offer_signing')
  const offerEquity           = str(formData, 'offer_equity') || null
  const offerNotes            = str(formData, 'offer_notes') || null
  const offerDecisionFactors  = str(formData, 'offer_decision_factors') || null

  if (!name) redirect(`/dashboard/companies/${id}?error=required`)

  // Fetch current stage before updating so we can detect advancement
  const { data: current } = await supabase
    .from('companies')
    .select('stage')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  const prevStage = current?.stage ?? 'watching'

  const fullUpdatePayload = {
    name,
    sector,
    stage,
    fit_score: fitScore,
    company_url: companyUrl,
    career_page_url: careerPageUrl,
    linkedin_url: linkedinUrl,
    crunchbase_id: crunchbaseId,
    notes,
    competitive_context: competitiveContext,
    interview_notes: interviewNotes,
    company_size: companySize,
    role_watch_description: roleWatchDescription,
    offer_role_title: offerRoleTitle,
    offer_base: offerBase,
    offer_bonus_pct: offerBonusPct,
    offer_signing: offerSigning,
    offer_equity: offerEquity,
    offer_notes: offerNotes,
    offer_decision_factors: offerDecisionFactors,
  }

  let { error } = await supabase
    .from('companies')
    .update(fullUpdatePayload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (isMissingCompetitiveContextColumn(error)) {
    const { competitive_context: _omitCompetitiveContext, ...fallbackPayload } = fullUpdatePayload
    const retry = await supabase
      .from('companies')
      .update(fallbackPayload)
      .eq('id', id)
      .eq('user_id', user.id)
    error = retry.error
  }

  if (error?.code === '23505') redirect(`/dashboard/companies/${id}?error=duplicate`)
  if (error) throw error

  if (stage === 'offer') {
    await markOfferAccepted(user.id)
    await logEvent(user.id, 'offer_accepted', { company_id: id })
    captureServerEvent(user.id, 'offer_accepted', { company_id: id })
    await logEvent(user.id, PMF_EVENTS.outcomes.offer_stage_reached, { company_id: id })
    captureServerEvent(user.id, PMF_EVENTS.outcomes.offer_stage_reached, { company_id: id })
  }

  if (stage === 'interviewing' && prevStage !== 'interviewing') {
    await logEvent(user.id, PMF_EVENTS.outcomes.first_interview_reached, { company_id: id, source: 'company_update' })
    captureServerEvent(user.id, PMF_EVENTS.outcomes.first_interview_reached, { company_id: id, source: 'company_update' })
  }

  captureServerEvent(user.id, 'pipeline_stage_changed', { company_id: id, stage })

  revalidatePath(`/dashboard/companies/${id}`)
  revalidatePath('/dashboard')

  // Detect stage advancement and surface a milestone moment
  const STAGE_ORDER = ['watching', 'researching', 'applied', 'interviewing', 'offer']
  const advanced = STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(prevStage)
  if (advanced) {
    redirect(`/dashboard/companies/${id}?saved=1&stage_up=${encodeURIComponent(stage)}`)
  }
  redirect(`/dashboard/companies/${id}?saved=1`)
}

export async function archiveCompany(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('companies')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  redirect('/dashboard')
}

export async function addFollowUp(companyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const action = str(formData, 'action')
  const dueDate = str(formData, 'due_date')

  if (!action || !dueDate) redirect(`/dashboard/companies/${companyId}`)

  await supabase.from('follow_ups').insert({
    user_id: user.id,
    company_id: companyId,
    action,
    due_date: dueDate,
    status: 'pending',
  })

  await logEvent(user.id, 'follow_up_set', { company_id: companyId })
  captureServerEvent(user.id, 'follow_up_set', { company_id: companyId })
  await logEvent(user.id, PMF_EVENTS.cadence.follow_up_logged, { company_id: companyId })
  captureServerEvent(user.id, PMF_EVENTS.cadence.follow_up_logged, { company_id: companyId })

  revalidatePath(`/dashboard/companies/${companyId}`)
  revalidatePath('/dashboard')
  redirect(`/dashboard/companies/${companyId}`)
}

export async function addContact(companyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name         = str(formData, 'name')
  const title        = str(formData, 'title') || null
  const firm         = str(formData, 'firm') || null
  const channel      = str(formData, 'channel') || null
  const email        = str(formData, 'email') || null
  const linkedin_url = str(formData, 'linkedin_url') || null
  const notes        = str(formData, 'notes') || null

  if (!name) redirect(`/dashboard/companies/${companyId}`)

  await supabase.from('contacts').insert({
    user_id: user.id,
    company_id: companyId,
    name,
    title,
    firm,
    channel,
    email,
    linkedin_url,
    notes,
    status: 'active',
  })

  revalidatePath(`/dashboard/companies/${companyId}`)
  redirect(`/dashboard/companies/${companyId}`)
}

export async function archiveContact(contactId: string, companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('contacts')
    .update({ status: 'archived' })
    .eq('id', contactId)
    .eq('user_id', user.id)

  revalidatePath(`/dashboard/companies/${companyId}`)
}

export async function markFollowUpDone(followUpId: string, companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('follow_ups')
    .update({ status: 'completed' })
    .eq('id', followUpId)
    .eq('user_id', user.id)

  revalidatePath(`/dashboard/companies/${companyId}`)
  revalidatePath('/dashboard')
}

export async function addDocument(companyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const label = str(formData, 'label') || 'other'
  const content = str(formData, 'content')

  if (!content) redirect(`/dashboard/companies/${companyId}`)

  await supabase.from('company_documents').insert({
    user_id: user.id,
    company_id: companyId,
    label,
    content,
  })

  revalidatePath(`/dashboard/companies/${companyId}`)
  redirect(`/dashboard/companies/${companyId}`)
}

export async function addInterviewLog(companyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const interviewDate   = str(formData, 'interview_date') || null
  const interviewStage  = str(formData, 'interview_stage') || null
  const questionsAsked  = str(formData, 'questions_asked') || null
  const whatLanded      = str(formData, 'what_landed') || null
  const whatSurprised   = str(formData, 'what_surprised') || null
  const followUpNeeded  = str(formData, 'follow_up_needed') || null

  await supabase.from('company_interview_logs').insert({
    user_id: user.id,
    company_id: companyId,
    interview_date: interviewDate,
    interview_stage: interviewStage,
    questions_asked: questionsAsked,
    what_landed: whatLanded,
    what_surprised: whatSurprised,
    follow_up_needed: followUpNeeded,
  })

  await logEvent(user.id, PMF_EVENTS.cadence.weekly_session_completed, {
    company_id: companyId,
    interview_stage: interviewStage,
  })
  captureServerEvent(user.id, PMF_EVENTS.cadence.weekly_session_completed, {
    company_id: companyId,
    interview_stage: interviewStage,
  })

  revalidatePath(`/dashboard/companies/${companyId}`)
}

export async function deleteInterviewLog(logId: string, companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('company_interview_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', user.id)

  revalidatePath(`/dashboard/companies/${companyId}`)
}

export async function removeDocument(documentId: string, companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('company_documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id)

  revalidatePath(`/dashboard/companies/${companyId}`)
}
