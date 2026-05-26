import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { verifyCoachAccess, logCoachAccess } from '@/lib/coach-access'
const __councilObservabilitySignal = (...args: unknown[]) => console.error(...args)

function startOfWeekUTC(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  return d
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
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
  const weekStart = toISODate(startOfWeekUTC(new Date()))

  const [{ data: currentReview }, { data: recentReviews }] = await Promise.all([
    supabase
      .from('coach_weekly_reviews')
      .select('id, week_start, review_answers, next_follow_up_id, status, completed_at, created_at, updated_at')
      .eq('coach_id', coachId)
      .eq('client_id', clientId)
      .eq('week_start', weekStart)
      .maybeSingle(),
    supabase
      .from('coach_weekly_reviews')
      .select('id, week_start, review_answers, next_follow_up_id, status, completed_at, created_at, updated_at')
      .eq('coach_id', coachId)
      .eq('client_id', clientId)
      .order('week_start', { ascending: false })
      .limit(4),
  ])

  return NextResponse.json(
    {
      data: {
        week_start: weekStart,
        current_review: currentReview ?? null,
        recent_reviews: recentReviews ?? [],
      },
    },
    { status: 200, headers: auth.response.headers }
  )
}

export async function POST(
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
  const weekStart = typeof payload.week_start === 'string' && payload.week_start ? payload.week_start : toISODate(startOfWeekUTC(new Date()))
  const answers = payload.answers && typeof payload.answers === 'object' ? payload.answers : {}
  const nextAction = payload.next_action && typeof payload.next_action === 'object' ? payload.next_action : {}
  const nextActionText = typeof nextAction.action === 'string' ? nextAction.action.trim() : ''
  const nextActionOwner = typeof nextAction.owner === 'string' ? nextAction.owner.trim() : ''
  const nextActionDueDate = typeof nextAction.due_date === 'string' ? nextAction.due_date.trim() : ''
  const nextActionStatus = typeof nextAction.status === 'string' ? nextAction.status.trim() : 'pending'

  if (!nextActionText || !nextActionOwner || !nextActionDueDate) {
    return NextResponse.json({ error: 'Weekly review needs a next action owner and due date' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: existingAction } = await supabase
    .from('follow_ups')
    .select('id')
    .eq('user_id', clientId)
    .eq('action', nextActionText)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const actionPayload = {
    user_id: clientId,
    action: nextActionText,
    due_date: nextActionDueDate,
    status: nextActionStatus === 'done' ? 'completed' : 'pending',
    next_action_owner: nextActionOwner,
    next_action_due_date: nextActionDueDate,
    next_action_status: nextActionStatus,
  }

  const { data: savedAction, error: actionError } = existingAction
    ? await supabase
        .from('follow_ups')
        .update(actionPayload)
        .eq('id', existingAction.id)
        .select('id, action, due_date, next_action_owner, next_action_due_date, next_action_status')
        .maybeSingle()
    : await supabase
        .from('follow_ups')
        .insert(actionPayload)
        .select('id, action, due_date, next_action_owner, next_action_due_date, next_action_status')
        .maybeSingle()

  if (actionError || !savedAction) {
    return NextResponse.json({ error: 'Failed to save next action' }, { status: 500 })
  }

  const reviewRecord = {
    coach_id: coachId,
    client_id: clientId,
    week_start: weekStart,
    review_answers: answers,
    next_follow_up_id: savedAction.id,
    status: 'completed',
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data: savedReview, error: reviewError } = await supabase
    .from('coach_weekly_reviews')
    .upsert(reviewRecord, { onConflict: 'coach_id,client_id,week_start' })
    .select('id, week_start, review_answers, next_follow_up_id, status, completed_at, created_at, updated_at')
    .maybeSingle()

  if (reviewError || !savedReview) {
    return NextResponse.json({ error: 'Failed to save weekly review' }, { status: 500 })
  }

  await logCoachAccess(coachId, clientId, 'coach_weekly_reviews', savedReview.id, 'create', null, reviewRecord)
  await logCoachAccess(coachId, clientId, 'follow_ups', savedAction.id, existingAction ? 'update' : 'create', null, actionPayload)

  return NextResponse.json(
    {
      data: {
        weekly_review: savedReview,
        next_action: savedAction,
      },
    },
    { status: 200, headers: auth.response.headers }
  )
}