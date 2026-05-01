'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function addContact(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string ?? '').trim()
  if (!name) {
    revalidatePath('/dashboard/contacts')
    return
  }

  const title = (formData.get('title') as string ?? '').trim() || null
  const firm = (formData.get('firm') as string ?? '').trim() || null
  const companyId = (formData.get('company_id') as string ?? '').trim() || null
  const channel = (formData.get('channel') as string) || null
  const notes = (formData.get('notes') as string ?? '').trim() || null

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

  revalidatePath('/dashboard/contacts')
  redirect('/dashboard/contacts?saved=1')
}

export async function archiveContact(contactId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('contacts')
    .update({ status: 'archived' })
    .eq('id', contactId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/contacts')
}
