import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { coachId } = await params
  const { userId: clientId } = auth

  const supabase = await createClient()

  // Get coach access info
  const { data, error } = await supabase
    .from('team_seats')
    .select(
      `
      id,
      member_user_id,
      member_email,
      coach_access_enabled,
      access_level,
      access_granted_at,
      last_accessed_at,
      status
    `
    )
    .eq('owner_id', clientId)
    .eq('status', 'accepted')

  if (error) {
    console.error('Error fetching coach access:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coach access settings' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 200, headers: auth.response.headers })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { coachId } = await params
  const { userId: clientId } = auth

  const body = await request.json()
  const { coach_access_enabled, access_level } = body

  const supabase = await createClient()

  // Update coach access for this seat
  const { error } = await supabase
    .from('team_seats')
    .update({
      coach_access_enabled,
      access_level: access_level || 'read_write',
      access_granted_at: coach_access_enabled ? new Date().toISOString() : null,
    })
    .eq('owner_id', clientId)
    .eq('member_user_id', coachId)
    .eq('status', 'accepted')

  if (error) {
    console.error('Error updating coach access:', error)
    return NextResponse.json(
      { error: 'Failed to update coach access' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { success: true },
    { status: 200, headers: auth.response.headers }
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { coachId } = await params
  const { userId: clientId } = auth

  const supabase = await createClient()

  // Revoke coach access by disabling it and deleting the team seat
  const { error } = await supabase
    .from('team_seats')
    .delete()
    .eq('owner_id', clientId)
    .eq('member_user_id', coachId)
    .eq('status', 'accepted')

  if (error) {
    console.error('Error revoking coach access:', error)
    return NextResponse.json(
      { error: 'Failed to revoke coach access' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { success: true },
    { status: 200, headers: auth.response.headers }
  )
}
