'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string ?? '').trim()
  const sector = (formData.get('sector') as string ?? '').trim() || null
  const stage = formData.get('stage') as string
  const fitRaw = formData.get('fit_score') as string
  const fitScore = fitRaw ? Number(fitRaw) : null
  const careerPageUrl = (formData.get('career_page_url') as string ?? '').trim() || null
  const notes = (formData.get('notes') as string ?? '').trim() || null

  if (!name) redirect(`/dashboard/companies/${id}?error=required`)

  const { error } = await supabase
    .from('companies')
    .update({ name, sector, stage, fit_score: fitScore, career_page_url: careerPageUrl, notes })
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

  const action = (formData.get('action') as string ?? '').trim()
  const dueDate = formData.get('due_date') as string

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

  const name = (formData.get('name') as string ?? '').trim()
  const title = (formData.get('title') as string ?? '').trim() || null
  const firm = (formData.get('firm') as string ?? '').trim() || null
  const channel = (formData.get('channel') as string) || null
  const notes = (formData.get('notes') as string ?? '').trim() || null

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

  const label = (formData.get('label') as string) || 'other'
  const content = (formData.get('content') as string ?? '').trim()

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
