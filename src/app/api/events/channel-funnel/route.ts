import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logEvent, type UserEventName } from '@/lib/events'

const ALLOWED_EVENTS: readonly UserEventName[] = [
  'channel_entry_clicked',
  'persona_route_selected',
  'trust_block_viewed',
  'trust_block_interacted',
  'micro_product_boundary_viewed',
] as const

function isAllowedEvent(value: string): value is UserEventName {
  return ALLOWED_EVENTS.includes(value as UserEventName)
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}))
  const event = typeof payload?.event === 'string' ? payload.event.trim() : ''
  const properties = payload?.properties && typeof payload.properties === 'object' ? payload.properties : {}

  if (!isAllowedEvent(event)) {
    return NextResponse.json({ ok: false, error: 'Unsupported event' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For anonymous traffic, we intentionally no-op; benchmarking is based on authenticated cohorts.
  if (!user) {
    return NextResponse.json({ ok: true, anonymous: true })
  }

  await logEvent(user.id, event, properties)
  return NextResponse.json({ ok: true })
}
