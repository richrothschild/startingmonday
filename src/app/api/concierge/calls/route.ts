import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const supabase = await createClient()
  const now = new Date().toISOString()

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from('concierge_calls')
      .select('id, scheduled_at, status, agenda, call_notes')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(3),
    supabase
      .from('concierge_calls')
      .select('id, scheduled_at, status, agenda, call_notes')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
      .limit(5),
  ])

  return NextResponse.json({ upcoming: upcoming ?? [], past: past ?? [] })
}
