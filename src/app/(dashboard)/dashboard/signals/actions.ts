'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { str } from '@/lib/form-utils'

export async function addSignalFollowUp(formData: FormData) {
  const companyName = str(formData, 'company_name')
  const signalSummary = str(formData, 'signal_summary') ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const action = companyName
    ? `Follow up re: ${companyName}${signalSummary ? ': ' + signalSummary.slice(0, 80) : ''}`
    : `Signal follow-up${signalSummary ? ': ' + signalSummary.slice(0, 80) : ''}`

  await supabase.from('follow_ups').insert({
    user_id: user.id,
    action,
    due_date: dueDate,
    status: 'pending',
  })

  revalidatePath('/dashboard/signals')
  revalidatePath('/dashboard')
}
