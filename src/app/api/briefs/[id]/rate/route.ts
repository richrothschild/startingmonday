import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog-server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const body = await request.json().catch(() => null)

  if (!body || ![1, -1].includes(body.rating)) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: updated, error } = await supabase
    .from('briefs')
    .update({ user_rating: body.rating })
    .eq('id', id)
    .eq('user_id', userId)
    .select('type')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }

  if (body.rating === -1) {
    captureServerEvent(userId, 'brief_rated_negative', { brief_id: id, brief_type: updated?.type ?? 'unknown' })
  }

  return NextResponse.json({ ok: true })
}
