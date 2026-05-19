import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { verifyCoachAccess, logCoachAccess } from '@/lib/coach-access'

type ActionStatus = 'pending' | 'done' | 'blocked'

function isActionStatus(value: unknown): value is ActionStatus {
  return value === 'pending' || value === 'done' || value === 'blocked'
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { clientId } = await params
  const { userId: coachId } = auth

  const { hasAccess } = await verifyCoachAccess(coachId, clientId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('follow_ups')
    .select('id, action, due_date, status, next_action_owner, next_action_due_date, next_action_status, created_at')
    .eq('user_id', clientId)
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: 'Failed to load actions' }, { status: 500 })
  }

  const current = (data ?? []).find((item) => item.status === 'pending') ?? (data ?? [])[0] ?? null

  return NextResponse.json(
    {
      data: {
        current_action: current
          ? {
              id: current.id,
              action: current.action,
              due_date: current.next_action_due_date ?? current.due_date,
              status: current.status,
              next_action_owner: current.next_action_owner,
              next_action_due_date: current.next_action_due_date ?? current.due_date,
              next_action_status: current.next_action_status,
              is_overdue: (current.next_action_due_date ?? current.due_date) < todayIso(),
            }
          : null,
      },
    },
    { status: 200, headers: auth.response.headers }
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { clientId } = await params
  const { userId: coachId } = auth

  const { hasAccess } = await verifyCoachAccess(coachId, clientId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  const payload = await request.json().catch(() => ({}))
  const action = typeof payload.action === 'string' ? payload.action.trim() : ''
  const dueDate = typeof payload.due_date === 'string' ? payload.due_date.trim() : ''
  const nextActionOwner = typeof payload.next_action_owner === 'string' ? payload.next_action_owner.trim() : ''
  const nextActionDueDate = typeof payload.next_action_due_date === 'string' ? payload.next_action_due_date.trim() : ''
  const nextActionStatus = isActionStatus(payload.next_action_status) ? payload.next_action_status : 'pending'
  const followUpStatus = isActionStatus(payload.status) ? payload.status : 'pending'
  const recordId = typeof payload.id === 'string' ? payload.id.trim() : ''

  if (!action || !dueDate || !nextActionOwner || !nextActionDueDate) {
    return NextResponse.json({ error: 'Action, owner, and due date are required' }, { status: 400 })
  }

  const supabase = await createClient()
  const record = {
    user_id: clientId,
    action,
    due_date: dueDate,
    status: followUpStatus,
    next_action_owner: nextActionOwner,
    next_action_due_date: nextActionDueDate,
    next_action_status: nextActionStatus,
  }

  const query = recordId
    ? supabase
        .from('follow_ups')
        .update(record)
        .eq('id', recordId)
        .eq('user_id', clientId)
    : supabase
        .from('follow_ups')
        .insert(record)

  const { data, error } = await query
    .select('id, action, due_date, status, next_action_owner, next_action_due_date, next_action_status')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to save action' }, { status: 500 })
  }

  await logCoachAccess(coachId, clientId, 'follow_ups', data.id, recordId ? 'update' : 'create', null, record)

  return NextResponse.json(
    { data },
    { status: 200, headers: auth.response.headers }
  )
}