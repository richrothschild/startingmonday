import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'

const VALID_STATUSES = new Set(['prospect', 'reached_out', 'in_conversation', 'meeting_scheduled', 'closed'])

function normalizeEmail(value: unknown): string {
  return (value ?? '').toString().trim().toLowerCase()
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const staff = await getStaffMember(authData.user?.email ?? '')
  if (!staff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = normalizeEmail(body?.email)
  const fullName = (body?.fullName ?? '').toString().trim()
  const company = (body?.company ?? '').toString().trim()
  const status = (body?.status ?? '').toString().trim()

  if (!email || !status) {
    return NextResponse.json({ error: 'email and status are required.' }, { status: 400 })
  }
  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('email', email)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    await supabase
      .from('contacts')
      .update({ outreach_status: status })
      .eq('id', existing.id)
      .eq('user_id', userId)
  } else {
    await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        name: fullName || email,
        firm: company || null,
        email,
        channel: 'cold',
        status: 'active',
        outreach_status: status,
      })
  }

  return NextResponse.json({ ok: true })
}
