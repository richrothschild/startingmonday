'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateContact(contactId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string ?? '').trim()
  if (!name) return

  const title       = (formData.get('title') as string ?? '').trim() || null
  const firm        = (formData.get('firm') as string ?? '').trim() || null
  const channel     = (formData.get('channel') as string) || null
  const email       = (formData.get('email') as string ?? '').trim() || null
  const linkedin_url = (formData.get('linkedin_url') as string ?? '').trim() || null
  const notes       = (formData.get('notes') as string ?? '').trim() || null
  const rawCompanyId = (formData.get('company_id') as string ?? '').trim() || null

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
