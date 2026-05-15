import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/require-auth'
import { FeedbackStatusUpdateSchema, firstZodError } from '@/lib/schemas'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/feedback/items/[id]/status - update status (staff only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const { id } = await params
  const itemId = id
  const { userId } = auth

  try {
    // Check staff status
    const staffQuery = supabase.from('staff_members') as any
    const { data: staffMember, error: staffError } = await staffQuery
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (staffError || !staffMember) {
      return NextResponse.json({ error: 'Only staff can update feedback status' }, { status: 403 })
    }

    // Validate body
    const body = await req.json()
    const parseResult = FeedbackStatusUpdateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: firstZodError(parseResult.error) },
        { status: 400 }
      )
    }

    const { status: newStatus, change_note, staff_notes } = parseResult.data

    // Get current item to track old status
    const { data: item, error: itemError } = await supabase
      .from('feedback_items')
      .select('status, first_staff_response_at, status_decided_at')
      .eq('id', itemId)
      .single() as any

    if (itemError || !item) {
      return NextResponse.json({ error: 'Feedback item not found' }, { status: 404 })
    }

    const oldStatus = item.status
    const timestamp = new Date().toISOString()

    // Determine SLA timestamps
    const updateData: Record<string, unknown> = {
      status: newStatus,
      staff_notes: staff_notes || null,
      updated_at: timestamp,
    }

    // Set first_staff_response_at if this is the first staff action
    if (!item.first_staff_response_at && oldStatus !== newStatus) {
      updateData.first_staff_response_at = timestamp
    }

    // Set status_decided_at if status moved to a decided state (not new, not under_review)
    if (
      !item.status_decided_at &&
      (newStatus === 'planned' || newStatus === 'shipped' || newStatus === 'declined' || newStatus === 'in_progress')
    ) {
      updateData.status_decided_at = timestamp
    }

    // Update feedback item
    const { error: updateError } = await (supabase
      .from('feedback_items') as any)
      .update(updateData)
      .eq('id', itemId) as any

    if (updateError) {
      console.error('[feedback/status] update error:', updateError)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // Record status history
    const { error: historyError } = await supabase
      .from('feedback_status_history')
      .insert({
        item_id: itemId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: userId,
        change_note: change_note || null,
      } as any)

    if (historyError) {
      console.error('[feedback/status] history error:', historyError)
      // Don't fail if history fails, status was already updated
    }

    // Get updated item
    const { data: updatedItem, error: fetchError } = await supabase
      .from('feedback_items')
      .select('*, feedback_status_history(*), user_profiles:user_id(full_name)')
      .eq('id', itemId)
      .single() as any

    if (fetchError) {
      return NextResponse.json({ error: 'Updated successfully but failed to fetch' }, { status: 200 })
    }

    return NextResponse.json(updatedItem)
  } catch (err) {
    console.error('[feedback/status] exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/feedback/items/[id]/status - get status history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const itemId = id

  try {
    const { data: history, error } = await supabase
      .from('feedback_status_history')
      .select(`
        *,
        user_profiles:changed_by(full_name)
      `)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false }) as any

    if (error) {
      console.error('[feedback/status] history error:', error)
      return NextResponse.json({ error: 'Failed to fetch status history' }, { status: 500 })
    }

    return NextResponse.json({ history })
  } catch (err) {
    console.error('[feedback/status] exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
