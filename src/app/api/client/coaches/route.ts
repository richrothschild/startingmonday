import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const supabase = await createClient()

  // Get coaches this user has invited with accepted team seats
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
    .eq('owner_id', userId)
    .eq('status', 'accepted')

  if (error) {
    console.error('Error fetching coaches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 200, headers: auth.response.headers })
}
