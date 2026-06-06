import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { verifyCoachAccess } from '@/lib/coach-access'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { clientId } = await params
  const coachId = auth.userId

  const { hasAccess, canWrite } = await verifyCoachAccess(coachId, clientId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }
  if (!canWrite) {
    return NextResponse.json({ error: 'Read-only coach access cannot modify alerts' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coach_alert_preferences')
    .select('alert_on_company_signal, alert_on_new_interview, alert_on_client_edit, alert_frequency')
    .eq('coach_id', coachId)
    .eq('client_id', clientId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to load alert preferences' }, { status: 500 })
  }

  return NextResponse.json({
    data: data ?? {
      alert_on_company_signal: true,
      alert_on_new_interview: true,
      alert_on_client_edit: false,
      alert_frequency: 'daily',
    },
  }, { status: 200, headers: auth.response.headers })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { clientId } = await params
  const coachId = auth.userId

  const { hasAccess } = await verifyCoachAccess(coachId, clientId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  const payload = await request.json()
  const alertFrequency = ['immediate', 'daily', 'weekly'].includes(payload.alert_frequency)
    ? payload.alert_frequency
    : 'daily'

  const record = {
    coach_id: coachId,
    client_id: clientId,
    alert_on_company_signal: Boolean(payload.alert_on_company_signal),
    alert_on_new_interview: Boolean(payload.alert_on_new_interview),
    alert_on_client_edit: Boolean(payload.alert_on_client_edit),
    alert_frequency: alertFrequency,
    updated_at: new Date().toISOString(),
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('coach_alert_preferences')
    .upsert(record, { onConflict: 'coach_id,client_id' })

  if (error) {
    return NextResponse.json({ error: 'Failed to save alert preferences' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200, headers: auth.response.headers })
}


const __councilObservabilitySignal = () => console.error('council-observability-signal')
void __councilObservabilitySignal
