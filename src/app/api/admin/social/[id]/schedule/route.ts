import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const staff = await getStaffMember(user.email ?? '')
  if (!staff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  void request
  const { id } = await params
  const admin = createAdminClient()

  const { data: post, error: fetchError } = await admin
    .from('social_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const bufferToken = process.env.BUFFER_ACCESS_TOKEN
  const bufferChannelId = process.env.BUFFER_CHANNEL_ID
  if (!bufferToken || !bufferChannelId) {
    return NextResponse.json({ error: 'Buffer not configured' }, { status: 500 })
  }

  // Schedule for 8:30 AM CT = 13:30 UTC on the post date.
  // If that time has passed, schedule 5 minutes from now.
  const targetTime = new Date(post.post_date + 'T13:30:00Z')
  const now = new Date()
  const scheduledAt = targetTime > now ? targetTime : new Date(now.getTime() + 5 * 60 * 1000)

  const formParams = new URLSearchParams()
  formParams.append('profile_ids[]', bufferChannelId)
  formParams.append('text', post.draft_text)
  formParams.append('scheduled_at', Math.floor(scheduledAt.getTime() / 1000).toString())

  const bufferRes = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bufferToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formParams.toString(),
  })

  if (!bufferRes.ok) {
    const errText = await bufferRes.text().catch(() => '')
    console.error('[social/schedule] Buffer API error', { status: bufferRes.status, body: errText })
    return NextResponse.json({ error: 'Buffer API error', detail: errText }, { status: 502 })
  }

  const bufferData = await bufferRes.json() as { updates?: { id: string }[]; id?: string }
  const bufferUpdateId = bufferData.updates?.[0]?.id ?? bufferData.id ?? null

  const { data: updated, error: updateError } = await admin
    .from('social_posts')
    .update({
      buffer_update_id: bufferUpdateId,
      buffer_scheduled_at: scheduledAt.toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ post: updated, scheduledAt: scheduledAt.toISOString() })
}
