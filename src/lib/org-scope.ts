import { createAdminClient } from '@/lib/supabase/admin'

type PartnerScope = {
  id: string
  email: string | null
  user_id: string | null
}

export type OrgScopeResult =
  | {
      ok: true
      actorUserId: string
      actorEmail: string | null
      orgOwnerUserId: string
      partnerId: string | null
      source: 'self' | 'team_seat'
    }
  | {
      ok: false
      actorUserId: string
      reason: 'orphaned_team_seat'
      orgOwnerUserId: string
    }

async function findPartnerScope(
  admin: ReturnType<typeof createAdminClient>,
  ownerUserId: string,
  ownerEmail: string | null,
): Promise<PartnerScope | null> {
  const { data: byUser } = await admin
    .from('partners')
    .select('id, email, user_id')
    .eq('user_id', ownerUserId)
    .maybeSingle()

  if (byUser) return byUser as PartnerScope
  if (!ownerEmail) return null

  const { data: byEmail } = await admin
    .from('partners')
    .select('id, email, user_id')
    .eq('email', ownerEmail)
    .eq('is_active', true)
    .maybeSingle()

  if (!byEmail) return null

  const partner = byEmail as PartnerScope
  if (!partner.user_id) {
    await admin.from('partners').update({ user_id: ownerUserId }).eq('id', partner.id)
    partner.user_id = ownerUserId
  }

  return partner
}

export async function resolveOrgScopeForUser(args: {
  userId: string
  email: string | null
}): Promise<OrgScopeResult> {
  const admin = createAdminClient()

  const { data: seatRows } = await admin
    .from('team_seats')
    .select('owner_id, accepted_at')
    .eq('member_user_id', args.userId)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false })
    .limit(1)

  const seat = Array.isArray(seatRows) && seatRows.length > 0 ? seatRows[0] : null
  const orgOwnerUserId = seat?.owner_id ?? args.userId
  const source: 'self' | 'team_seat' = seat ? 'team_seat' : 'self'

  let ownerEmail: string | null = orgOwnerUserId === args.userId ? args.email : null

  if (!ownerEmail) {
    const { data: ownerUser } = await admin
      .from('users')
      .select('email')
      .eq('id', orgOwnerUserId)
      .maybeSingle()

    ownerEmail = ownerUser?.email ?? null
  }

  if (source === 'team_seat' && !ownerEmail) {
    return {
      ok: false,
      actorUserId: args.userId,
      reason: 'orphaned_team_seat',
      orgOwnerUserId,
    }
  }

  const partner = await findPartnerScope(admin, orgOwnerUserId, ownerEmail)

  return {
    ok: true,
    actorUserId: args.userId,
    actorEmail: args.email,
    orgOwnerUserId,
    partnerId: partner?.id ?? null,
    source,
  }
}