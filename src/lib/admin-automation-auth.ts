import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'

export type StaffAutomationAuthResult =
  | { ok: false; response: NextResponse }
  | {
      ok: true
      userId: string
      supabase: Awaited<ReturnType<typeof createClient>>
      userEmail: string
    }

export async function requireStaffAutomationAccess(request: NextRequest): Promise<StaffAutomationAuthResult> {
  const auth = await requireAuth(request)
  if (!auth.ok) return { ok: false, response: auth.response }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const userEmail = authData.user?.email ?? ''
  const staff = await getStaffMember(userEmail)

  if (!staff) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true, userId: auth.userId, supabase, userEmail }
}
