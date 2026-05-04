'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoUser } from '@/lib/demo'

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}
function numOrNull(formData: FormData, key: string): number | null {
  const raw = formData.get(key)
  if (!raw) return null
  const v = Number(raw)
  return Number.isFinite(v) ? v : null
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
  const careerPageUrl = str(formData, 'career_page_url') || null
  const crunchbaseId = str(formData, 'crunchbase_id') || null
  const notes = str(formData, 'notes') || null

  if (!name) redirect(`/dashboard/companies/${id}?error=required`)

  const { error } = await supabase
    .from('companies')
    .update({ name, sector, stage, fit_score: fitScore, career_page_url: careerPageUrl, crunchbase_id: crunchbaseId, notes })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error?.code === '23505') redirect(`/dashboard/companies/${id}?error=duplicate`)
  if (error) throw error

  revalidatePath(`/dashboard/companies/${id}`)
  revalidatePath('/dashboard')
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

  revalidatePath(`/dashboard/companies/${companyId}`)
  revalidatePath('/dashboard')
  redirect(`/dashboard/companies/${companyId}`)
}

export async function addContact(companyId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = str(formData, 'name')
  const title = str(formData, 'title') || null
  const firm = str(formData, 'firm') || null
  const channel = str(formData, 'channel') || null
  const notes = str(formData, 'notes') || null

  if (!name) redirect(`/dashboard/companies/${companyId}`)

  await supabase.from('contacts').insert({
    user_id: user.id,
    company_id: companyId,
    name,
    title,
    firm,
    channel,
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
    .update({ status: 'done' })
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
