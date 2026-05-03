'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markFollowUpDone(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('follow_ups')
    .update({ status: 'done' })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}

export async function updateFollowUp(formData: FormData) {
  const id = formData.get('id') as string
  const action = (formData.get('action') as string)?.trim()
  const due_date = formData.get('due_date') as string

  if (!id || !action) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const update: Record<string, string> = { action }
  if (due_date) update.due_date = due_date

  await supabase
    .from('follow_ups')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}
