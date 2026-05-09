import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const supabase = await createClient()
  const { data } = await supabase
    .from('opportunity_radar')
    .select('company_name, reason, signal_type, confidence, generated_at')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(3)

  return NextResponse.json({ hits: data ?? [] })
}
