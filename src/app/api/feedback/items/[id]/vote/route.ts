import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/require-auth'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/feedback/items/[id]/vote - add vote
// DELETE /api/feedback/items/[id]/vote - remove vote
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
    // Check if item exists
    const { data: item, error: itemError } = await supabase
      .from('feedback_items')
      .select('id')
      .eq('id', itemId)
      .single() as any

    if (itemError || !item) {
      return NextResponse.json({ error: 'Feedback item not found' }, { status: 404 })
    }

    // Try to insert vote (will fail if already exists due to unique constraint)
    const { error: voteError } = await supabase
      .from('feedback_votes')
      .insert({
        user_id: userId,
        item_id: itemId,
      } as any)

    if (voteError) {
      if (voteError.code === '23505') {
        // Unique constraint violation - user already voted
        return NextResponse.json({ error: 'You already voted on this item' }, { status: 409 })
      }
      console.error('[feedback/vote] insert error:', voteError)
      return NextResponse.json({ error: 'Failed to add vote' }, { status: 500 })
    }

    // Return updated vote count
    const { data: votes } = await supabase
      .from('feedback_votes')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', itemId) as any

    return NextResponse.json({ vote_count: votes?.length || 0 }, { status: 201 })
  } catch (err) {
    console.error('[feedback/vote] exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const supabase = await createClient()
  const itemId = params.id
  const { userId } = auth

  try {
    // Delete user's vote for this item
    const { error } = await supabase
      .from('feedback_votes')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', userId) as any

    if (error) {
      console.error('[feedback/vote] delete error:', error)
      return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 })
    }

    // Return updated vote count
    const { data: votes } = await supabase
      .from('feedback_votes')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', itemId) as any

    return NextResponse.json({ vote_count: votes?.length || 0 })
  } catch (err) {
    console.error('[feedback/vote] exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
