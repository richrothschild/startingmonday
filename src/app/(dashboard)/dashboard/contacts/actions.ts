'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/events'
import { captureServerEvent } from '@/lib/posthog-server'
import { str } from '@/lib/form-utils'

export async function addContact(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = str(formData, 'name')
  if (!name) {
    revalidatePath('/dashboard/contacts')
    return
  }

  const title        = str(formData, 'title') || null
  const firm         = str(formData, 'firm') || null
  const rawCompanyId = str(formData, 'company_id') || null
  const channel      = str(formData, 'channel') || null
  const email        = str(formData, 'email') || null
  const linkedin_url = str(formData, 'linkedin_url') || null
  const notes        = str(formData, 'notes') || null

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
    email,
    linkedin_url,
    notes,
    status: 'active',
  })

  if (insertError) {
    revalidatePath('/dashboard/contacts')
    redirect('/dashboard/contacts?error=save-failed')
  }

  await logEvent(user.id, 'contact_added', { channel: channel ?? '' })
  captureServerEvent(user.id, 'contact_added', { channel: channel ?? '' })
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

export async function markContactSentForm(contactId: string, contactName: string): Promise<void> {
  const result = await markContactSent(contactId, contactName)
  if (!result.ok) return
  revalidatePath(`/dashboard/contacts/${contactId}`)
  redirect(`/dashboard/contacts/${contactId}?sent=1`)
}

export async function updateOutreachStatus(contactId: string, status: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('contacts')
    .update({ outreach_status: status })
    .eq('id', contactId)
    .eq('user_id', user.id)

  revalidatePath(`/dashboard/contacts/${contactId}`)
  revalidatePath('/dashboard/contacts')
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
