import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const admin = createAdminClient()
  // Get current user (partner)
  // For demo, assume partner_id is passed as query param (replace with session-based lookup in prod)
  const partnerId = request.nextUrl.searchParams.get('partner_id')
  if (!partnerId) return NextResponse.json({ error: 'Missing partner_id' }, { status: 400 })

  // Fetch attributions
  const { data: attributions } = await admin
    .from('referral_attributions')
    .select('signup_user_id, attributed_at')
    .eq('partner_id', partnerId)
    .order('attributed_at', { ascending: false })

  const attributedUserIds = (attributions ?? []).map(a => a.signup_user_id)
  let subscriberRows: { id: string; subscription_status: string; subscription_tier: string | null; created_at: string }[] = []
  if (attributedUserIds.length > 0) {
    const { data: users } = await admin
      .from('users')
      .select('id, subscription_status, subscription_tier, created_at')
      .in('id', attributedUserIds)
    subscriberRows = (users ?? []) as typeof subscriberRows
  }
  const attrByUserId = Object.fromEntries(
    (attributions ?? []).map(a => [a.signup_user_id, a.attributed_at])
  )
  const rows = subscriberRows.map(u => ({
    user_id: u.id,
    joined_date: attrByUserId[u.id] ?? u.created_at,
    tier: u.subscription_tier ?? 'free',
    status: u.subscription_status,
  }))
  return NextResponse.json({ rows })
}
