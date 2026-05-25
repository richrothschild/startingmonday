import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logEvent, type UserEventName } from '@/lib/events'

const ALLOWED_EVENTS: UserEventName[] = [
  'onboarding_started',
  'onboarding_step_completed',
  'onboarding_nudge_shown',
  'onboarding_low_energy_enabled',
  'onboarding_first_value_ready',
]

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as {
    eventName?: UserEventName
    properties?: Record<string, string | number | boolean | null>
  }

  const eventName = body.eventName
  if (!eventName || !ALLOWED_EVENTS.includes(eventName)) {
    return NextResponse.json({ error: 'Invalid event name' }, { status: 400 })
  }

  await logEvent(user.id, eventName, body.properties ?? {})

  return NextResponse.json({ ok: true })
}
