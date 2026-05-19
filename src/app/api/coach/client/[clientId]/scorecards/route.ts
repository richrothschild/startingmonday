import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { verifyCoachAccess } from '@/lib/coach-access'
import { NextRequest, NextResponse } from 'next/server'

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function startOfWeekUTC(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  return d
}

function weekLabel(date: Date): string {
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`
}

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
  type FollowUp = { due_date: string }

  const now = new Date()
  const last30dIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const last30dDate = toISODate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
  const last7dIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const todayIso = toISODate(now)

  // Fetch scorecards
  const [
    { data: companiesData },
    { data: signalsData },
    { data: briefsData },
    { data: interviewsData },
    { data: scansData },
    { data: followUpsData },
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
      .gte('signal_date', last30dDate)
      .order('signal_date', { ascending: false }),
    supabase
      .from('briefs')
      .select('id, created_at')
      .eq('user_id', clientId)
      .gte('created_at', last30dIso)
      .order('created_at', { ascending: false }),
    supabase
      .from('company_interview_logs')
      .select('id, created_at, interview_stage')
      .eq('user_id', clientId)
      .gte('created_at', last30dIso)
      .order('created_at', { ascending: false }),
    supabase
      .from('scan_results')
      .select('ai_score, scanned_at')
      .eq('user_id', clientId)
      .gte('scanned_at', last30dIso),
    supabase
      .from('follow_ups')
      .select('due_date')
      .eq('user_id', clientId)
      .eq('status', 'pending')
      .lte('due_date', todayIso),
  ])

  const companies = (companiesData || []) as Company[]
  const signals = (signalsData || []) as Signal[]
  const briefs = (briefsData || []) as Brief[]
  const interviews = (interviewsData || []) as Interview[]
  const scans = (scansData || []) as ScanResult[]
  const followUps = (followUpsData || []) as FollowUp[]

  const recentSignals = signals.filter((s) => new Date(s.signal_date).getTime() >= new Date(last7dIso).getTime())
  const recentBriefs = briefs.filter((b) => new Date(b.created_at).getTime() >= new Date(last7dIso).getTime())
  const recentInterviews = interviews.filter((i) => new Date(i.created_at).getTime() >= new Date(last7dIso).getTime())

  const activePipelineCount = companies.filter(
    (c) => c.stage === 'applied' || c.stage === 'interviewing' || c.stage === 'offer'
  ).length

  const thisWeekStart = startOfWeekUTC(now)
  const weeklyTrends = [0, 1, 2, 3].map((offset) => {
    const weekStart = new Date(thisWeekStart)
    weekStart.setUTCDate(thisWeekStart.getUTCDate() - offset * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 7)

    const inWeek = (dateStr: string) => {
      const ts = new Date(dateStr).getTime()
      return ts >= weekStart.getTime() && ts < weekEnd.getTime()
    }

    return {
      week_start: weekLabel(weekStart),
      signals: signals.filter((s) => inWeek(s.signal_date)).length,
      briefs: briefs.filter((b) => inWeek(b.created_at)).length,
      interviews: interviews.filter((i) => inWeek(i.created_at)).length,
    }
  }).reverse()

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
    session_prep_snapshot: {
      signals_last_7_days: recentSignals.length,
      briefs_last_7_days: recentBriefs.length,
      interviews_last_7_days: recentInterviews.length,
      active_pipeline_count: activePipelineCount,
      overdue_actions: followUps.length,
    },
    weekly_trends: weeklyTrends,
  }

  return NextResponse.json({ data: scorecards }, { status: 200, headers: auth.response.headers })
}
