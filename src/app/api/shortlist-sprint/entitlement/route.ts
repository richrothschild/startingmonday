import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth, withAuthCookies } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { logEvent, type UserEventName } from '@/lib/events'

type EntitlementEventName =
  | 'shortlist_sprint_checkout_started'
  | 'shortlist_sprint_purchased'
  | 'shortlist_sprint_delivered'
  | 'shortlist_sprint_credit_applied'

const ENTITLEMENT_EVENTS: readonly EntitlementEventName[] = [
  'shortlist_sprint_checkout_started',
  'shortlist_sprint_purchased',
  'shortlist_sprint_delivered',
  'shortlist_sprint_credit_applied',
] as const

type EntitlementStatus = 'not_started' | 'checkout_started' | 'active' | 'delivered' | 'converted' | 'expired'

function addDays(iso: string, days: number): string {
  const at = new Date(iso)
  at.setUTCDate(at.getUTCDate() + days)
  return at.toISOString()
}

function deriveEntitlementState(rows: Array<{ event_name: EntitlementEventName; created_at: string }>) {
  const latestByEvent = new Map<EntitlementEventName, string>()
  for (const row of rows) {
    latestByEvent.set(row.event_name, row.created_at)
  }

  const checkoutStartedAt = latestByEvent.get('shortlist_sprint_checkout_started') ?? null
  const purchasedAt = latestByEvent.get('shortlist_sprint_purchased') ?? null
  const deliveredAt = latestByEvent.get('shortlist_sprint_delivered') ?? null
  const convertedAt = latestByEvent.get('shortlist_sprint_credit_applied') ?? null

  const expiresAt = purchasedAt ? addDays(purchasedAt, 7) : null
  const nowIso = new Date().toISOString()

  let status: EntitlementStatus = 'not_started'
  if (checkoutStartedAt) status = 'checkout_started'
  if (purchasedAt) status = 'active'
  if (purchasedAt && expiresAt && nowIso > expiresAt && !deliveredAt && !convertedAt) status = 'expired'
  if (deliveredAt) status = 'delivered'
  if (convertedAt) status = 'converted'

  const slaBreached = Boolean(purchasedAt && !deliveredAt && Date.now() - new Date(purchasedAt).getTime() > 48 * 60 * 60 * 1000)

  return {
    status,
    checkout_started_at: checkoutStartedAt,
    purchased_at: purchasedAt,
    delivered_at: deliveredAt,
    converted_at: convertedAt,
    expires_at: expiresAt,
    sla_breached: slaBreached,
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_events')
    .select('event_name, created_at')
    .eq('user_id', auth.userId)
    .in('event_name', [...ENTITLEMENT_EVENTS])
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) {
    return withAuthCookies(NextResponse.json({ error: error.message }, { status: 500 }), auth)
  }

  const rows = (data ?? []) as Array<{ event_name: EntitlementEventName; created_at: string }>
  const entitlement = deriveEntitlementState(rows)

  return withAuthCookies(
    NextResponse.json({
      ok: true,
      offer_code: 'shortlist_sprint',
      ...entitlement,
    }),
    auth,
  )
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({})) as { action?: string }

  const actionToEvent: Record<string, EntitlementEventName> = {
    checkout_started: 'shortlist_sprint_checkout_started',
    purchase_recorded: 'shortlist_sprint_purchased',
    delivery_marked: 'shortlist_sprint_delivered',
    credit_applied: 'shortlist_sprint_credit_applied',
  }

  const eventName = actionToEvent[body.action ?? '']
  if (!eventName) {
    return withAuthCookies(
      NextResponse.json({ error: 'Invalid action' }, { status: 400 }),
      auth,
    )
  }

  await logEvent(auth.userId, eventName as UserEventName, {
    route: '/shortlist-sprint',
    offer_code: 'shortlist_sprint',
    action_context: 'shortlist_entitlement_workflow',
  })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_events')
    .select('event_name, created_at')
    .eq('user_id', auth.userId)
    .in('event_name', [...ENTITLEMENT_EVENTS])
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) {
    return withAuthCookies(NextResponse.json({ error: error.message }, { status: 500 }), auth)
  }

  const rows = (data ?? []) as Array<{ event_name: EntitlementEventName; created_at: string }>
  const entitlement = deriveEntitlementState(rows)

  return withAuthCookies(
    NextResponse.json({ ok: true, offer_code: 'shortlist_sprint', ...entitlement }),
    auth,
  )
}

const __councilObservabilitySignal = () => console.error('council-observability-signal')
void __councilObservabilitySignal
