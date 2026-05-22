'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logEvent } from '@/lib/events'

const ALLOWED_TARGETS = new Set([
  '/dashboard/signals',
  '/dashboard',
  '/dashboard/calendar',
])

export async function logBriefingAction(formData: FormData): Promise<void> {
  const target = String(formData.get('target') ?? '').trim()
  const section = String(formData.get('section') ?? '').trim()

  const safeTarget = ALLOWED_TARGETS.has(target) ? target : '/dashboard/briefing'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logEvent(user.id, 'briefing_action_clicked', {
      section: section || 'unknown',
      target: safeTarget,
    })
  }

  redirect(safeTarget)
}
