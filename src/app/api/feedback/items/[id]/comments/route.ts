import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/require-auth'
import { FeedbackCommentSchema, firstZodError } from '@/lib/schemas'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/feedback/items/[id]/comments - list comments
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const itemId = params.id

  try {
    const searchParams = req.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: comments, error, count } = await supabase
      .from('feedback_comments')
      .select(`
        *,
        user_profiles:user_id(full_name)
      `, { count: 'exact' })
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1) as any

    if (error) {
      console.error('[feedback/comments] list error:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({ comments, count: count || 0 })
  } catch (err) {
    console.error('[feedback/comments] list exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/feedback/items/[id]/comments - add comment
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const itemId = params.id
  const { userId } = auth

  try {
    // Validate body
    const body = await req.json()
    const parseResult = FeedbackCommentSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: firstZodError(parseResult.error) },
        { status: 400 }
      )
    }

    const { body: commentBody, is_staff_note } = parseResult.data

    // Check if item exists
    const { data: item, error: itemError } = await supabase
      .from('feedback_items')
      .select('id')
      .eq('id', itemId)
      .single() as any

    if (itemError || !item) {
      return NextResponse.json({ error: 'Feedback item not found' }, { status: 404 })
    }

    // If staff note, require staff status
    if (is_staff_note) {
      const { data: staffMember } = await supabase
        .from('staff_members')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single() as any

      if (!staffMember) {
        return NextResponse.json({ error: 'Only staff can add staff notes' }, { status: 403 })
      }
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('feedback_comments')
      .insert({
        user_id: userId,
        item_id: itemId,
        body: commentBody,
        is_staff_note,
      } as any)
      .select('*, user_profiles:user_id(full_name)')
      .single() as any

    if (error) {
      console.error('[feedback/comments] insert error:', error)
      return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (err) {
    console.error('[feedback/comments] exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
