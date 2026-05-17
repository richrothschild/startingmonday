import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { verifyCoachAccess, logCoachAccess } from '@/lib/coach-access'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const { clientId } = await params
  const { userId: coachId } = auth

  // Verify coach has access
  const { hasAccess } = await verifyCoachAccess(coachId, clientId)
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Access denied to this client' },
      { status: 403 }
    )
  }

  const supabase = await createClient()

  // Fetch briefs
  const { data, error } = await supabase
    .from('briefs')
    .select(
      `
      id,
      company_id,
      companies(name),
      brief_for,
      brief_type,
      win_thesis,
      likely_objections,
      peer_level_questions,
      notes,
      created_at,
      updated_at
    `
    )
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching briefs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch briefs' },
      { status: 500 }
    )
  }

  // Log access
  for (const brief of data || []) {
    await logCoachAccess(coachId, clientId, 'briefs', brief.id, 'view')
  }

  return NextResponse.json({ data }, { status: 200, headers: auth.response.headers })
}
