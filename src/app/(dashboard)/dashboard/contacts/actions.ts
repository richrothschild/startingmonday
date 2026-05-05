'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/events'

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
  const rawCompanyId = (formData.get('company_id') as string ?? '').trim() || null
  const channel = (formData.get('channel') as string) || null
  const notes = (formData.get('notes') as string ?? '').trim() || null

  // Verify the company belongs to this user before associating the contact.
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

  const { error: insertError } = await supabase.from('contacts').insert({
    user_id: user.id,
    company_id: companyId,
    name,
    title,
    firm,
    channel,
    notes,
    status: 'active',
  })

  if (insertError) {
    revalidatePath('/dashboard/contacts')
    redirect('/dashboard/contacts?error=save-failed')
  }

  await logEvent(user.id, 'contact_added', { channel: channel ?? '' })
  revalidatePath('/dashboard/contacts')
  redirect('/dashboard/contacts?saved=1')
}

export async function markContactSent(contactId: string, contactName: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const followUpDate = new Date()
  followUpDate.setDate(followUpDate.getDate() + 7)
  const followUpDateStr = followUpDate.toISOString().slice(0, 10)

  const [{ error: updateError }, { error: followUpError }] = await Promise.all([
    supabase
      .from('contacts')
      .update({ contacted_at: new Date().toISOString() })
      .eq('id', contactId)
      .eq('user_id', user.id),
    supabase.from('follow_ups').insert({
      user_id: user.id,
      contact_id: contactId,
      action: `Follow up with ${contactName}`,
      due_date: followUpDateStr,
      status: 'pending',
    }),
  ])

  if (updateError || followUpError) return { ok: false, error: 'Failed to mark as sent' }
  return { ok: true }
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
  redirect('/dashboard/contacts')
}
