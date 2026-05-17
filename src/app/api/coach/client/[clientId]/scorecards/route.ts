import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { verifyCoachAccess } from '@/lib/coach-access'
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

  type Company = { stage: string; fit_score: number | null }
  type Signal = { signal_date: string; signal_type: string }
  type Brief = { created_at: string }
  type Interview = { created_at: string; interview_stage: string | null }
  type ScanResult = { ai_score: number | null; scanned_at: string }

  // Fetch scorecards
  const [
    { data: companiesData },
    { data: signalsData },
    { data: briefsData },
    { data: interviewsData },
    { data: scansData },
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('id, stage, fit_score')
      .eq('user_id', clientId)
      .is('archived_at', null),
    supabase
      .from('company_signals')
      .select('id, signal_date, signal_type')
      .eq('user_id', clientId)
      .gte('signal_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabase
      .from('briefs')
      .select('id, created_at')
      .eq('user_id', clientId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('company_interview_logs')
      .select('id, created_at, interview_stage')
      .eq('user_id', clientId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('scan_results')
      .select('ai_score, scanned_at')
      .eq('user_id', clientId)
      .gte('scanned_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const companies = (companiesData || []) as Company[]
  const signals = (signalsData || []) as Signal[]
  const briefs = (briefsData || []) as Brief[]
  const interviews = (interviewsData || []) as Interview[]
  const scans = (scansData || []) as ScanResult[]

  const scorecards = {
    pipeline: {
      total_companies: companies.length,
      by_stage: {
        watching: companies.filter((c) => c.stage === 'watching').length,
        researching: companies.filter((c) => c.stage === 'researching').length,
        applied: companies.filter((c) => c.stage === 'applied').length,
        interviewing_or_offer: companies.filter((c) => c.stage === 'interviewing' || c.stage === 'offer').length,
      },
      avg_fit_score: companies.length
        ? Math.round(
            companies.reduce((sum, c) => sum + (c.fit_score || 0), 0) / companies.length
          )
        : 0,
    },
    signals: {
      last_30_days: signals.length,
      avg_score: scans.length
        ? Math.round(scans.reduce((sum, s) => sum + (s.ai_score || 0), 0) / scans.length)
        : 0,
    },
    preparation: {
      briefs_last_30_days: briefs.length,
      interviews_last_30_days: interviews.length,
      interviews_by_outcome: {
        successful: companies.filter((c) => c.stage === 'offer').length,
        advancing: interviews.filter((i) => !!i.interview_stage).length,
        rejected: 0,
      },
    },
    activity_health: {
      is_active: signals.length > 0 || briefs.length > 0 || interviews.length > 0,
      last_signal_days: signals.length > 0
        ? Math.ceil((Date.now() - new Date(signals[0].signal_date).getTime()) / (1000 * 60 * 60 * 24))
        : 999,
      last_brief_days: briefs.length > 0
        ? Math.ceil((Date.now() - new Date(briefs[0].created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999,
    },
  }

  return NextResponse.json({ data: scorecards }, { status: 200, headers: auth.response.headers })
}
