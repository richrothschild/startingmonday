import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserSubscription, canAccessFeature } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { userId } = auth
  const supabase = await createClient()

  const sub = await getUserSubscription(userId, supabase)
  if (!canAccessFeature(sub, 'coach_dashboard')) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
  }

  // Fetch accepted client seats for this coach
  const { data: seats, error: seatsError } = await supabase
    .from('team_seats')
    .select('id, member_user_id, member_email, accepted_at')
    .eq('owner_id', userId)
    .eq('status', 'accepted')

  if (seatsError) {
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 })
  }

  if (!seats?.length) {
    return NextResponse.json([])
  }

  const admin = createAdminClient()
  const clientIds = seats.map(s => s.member_user_id).filter(Boolean) as string[]

  const [
    { data: profiles },
    { data: companies },
    { data: followUps },
  ] = await Promise.all([
    admin
      .from('user_profiles')
      .select('user_id, full_name, momentum_score, search_persona, onboarding_completed_at')
      .in('user_id', clientIds),
    admin
      .from('companies')
      .select('user_id, stage')
      .in('user_id', clientIds)
      .is('archived_at', null),
    admin
      .from('follow_ups')
      .select('user_id')
      .in('user_id', clientIds)
      .eq('status', 'pending')
      .lte('due_date', new Date().toISOString().split('T')[0]),
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
  const activeCountMap: Record<string, number> = {}
  const overdueCountMap: Record<string, number> = {}

  for (const c of companies ?? []) {
    if (['interviewing', 'applied', 'offer'].includes(c.stage)) {
      activeCountMap[c.user_id] = (activeCountMap[c.user_id] ?? 0) + 1
    }
  }
  for (const f of followUps ?? []) {
    overdueCountMap[f.user_id] = (overdueCountMap[f.user_id] ?? 0) + 1
  }

  const clients = seats.map(seat => {
    const cid = seat.member_user_id
    const profile = cid ? profileMap[cid] : null
    return {
      seatId: seat.id,
      userId: cid,
      email: seat.member_email,
      name: profile?.full_name ?? null,
      momentumScore: profile?.momentum_score ?? null,
      persona: profile?.search_persona ?? null,
      onboarded: !!profile?.onboarding_completed_at,
      activeCompanies: cid ? (activeCountMap[cid] ?? 0) : 0,
      overdueActions: cid ? (overdueCountMap[cid] ?? 0) : 0,
      joinedAt: seat.accepted_at,
    }
  })

  return NextResponse.json(clients)
}
