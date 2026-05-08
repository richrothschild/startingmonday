'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { str } from '@/lib/form-utils'

export async function updateContact(contactId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = str(formData, 'name')
  if (!name) return

  const title        = str(formData, 'title') || null
  const firm         = str(formData, 'firm') || null
  const channel      = str(formData, 'channel') || null
  const email        = str(formData, 'email') || null
  const linkedin_url = str(formData, 'linkedin_url') || null
  const notes        = str(formData, 'notes') || null
  const rawCompanyId = str(formData, 'company_id') || null

  let companyId: string | null = null
  if (rawCompanyId) {
    const { data: co } = await supabase
      .from('companies')
      .select('id')
      .eq('id', rawCompanyId)
      .eq('user_id', user.id)
      .maybeSingle()
    companyId = co?.id ?? null
  }

  await supabase
    .from('contacts')
    .update({ name, title, firm, channel, email, linkedin_url, notes, company_id: companyId })
    .eq('id', contactId)
    .eq('user_id', user.id)

  revalidatePath(`/dashboard/contacts/${contactId}`)
  redirect(`/dashboard/contacts/${contactId}`)
}

export async function addContactFollowUp(contactId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const action  = (formData.get('action') as string ?? '').trim()
  const dueDate = (formData.get('due_date') as string ?? '').trim()
  if (!action || !dueDate) return

  await supabase.from('follow_ups').insert({
    user_id:    user.id,
    contact_id: contactId,
    action,
    due_date:   dueDate,
    status:     'pending',
  })

  revalidatePath(`/dashboard/contacts/${contactId}`)
  redirect(`/dashboard/contacts/${contactId}`)
}
