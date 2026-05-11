'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { str } from '@/lib/form-utils'
import { anthropic, MODELS } from '@/lib/anthropic'

export async function generateSignalOutreach(formData: FormData) {
  const signalId = str(formData, 'signal_id')
  if (!signalId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const [{ data: signal }, { data: profile }] = await Promise.all([
    supabase
      .from('company_signals')
      .select('id, signal_type, signal_summary, outreach_angle, company_id, companies(name)')
      .eq('id', signalId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('user_profiles')
      .select('full_name, current_title, positioning_summary')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!signal) return

  const co = signal.companies as { name: string }[] | { name: string } | null
  const companyName = (Array.isArray(co) ? co[0] : co)?.name ?? 'this company'
  const candidate = [profile?.full_name, profile?.current_title].filter(Boolean).join(', ')
  const positioning = profile?.positioning_summary ? `\nCandidate positioning: ${profile.positioning_summary}` : ''
  const angle = signal.outreach_angle ? `\nSuggested angle: ${signal.outreach_angle}` : ''

  const prompt = `Write a cold outreach message for a senior executive to send to a contact at ${companyName}.

Signal that prompted this outreach: [${signal.signal_type.replace(/_/g, ' ').toUpperCase()}] ${signal.signal_summary}${angle}
Sender: ${candidate || 'senior executive'}${positioning}

Rules:
- Maximum 3 sentences. Do not exceed this.
- No em dashes, no "I hope this finds you well", no "I wanted to reach out", no "touch base"
- Sound like a real senior executive, not a template
- No greeting or sign-off. Body only.
- Reference the specific signal. Generic outreach is noise.
- Write as the sender in first person.`

  try {
    const msg = await anthropic.messages.create({
      model: MODELS.haiku,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const body = (msg.content[0] as { type: string; text: string }).text.trim()
    const subject = `${companyName} - ${signal.signal_type.replace(/_/g, ' ')}`

    await supabase
      .from('company_signals')
      .update({ outreach_draft: { subject, body } })
      .eq('id', signalId)
      .eq('user_id', user.id)
  } catch { /* fail silently; user can retry */ }

  revalidatePath('/dashboard/signals')
  revalidatePath('/dashboard')
}

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
