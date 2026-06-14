import { classifyGraphStalls, type StallSnapshot } from '@/lib/action-scores'

type Company = { id: string; stage: string; fit_score: number | null }
type Signal = { signal_date: string; signal_type: string }
type Brief = {
  created_at: string
  reviewed_at: string | null
  used_at: string | null
  lifecycle_state: string | null
}
type Interview = { created_at: string; interview_stage: string | null }
type FollowUp = { due_date: string }
type UserEvent = { event_name: string; created_at: string }

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatSessionLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

function getMostRecentBriefProgressAt(briefs: Brief[]): string | null {
  if (briefs.length === 0) return null

  return briefs.reduce<string | null>((latest, brief) => {
    const candidate = brief.used_at ?? brief.reviewed_at ?? brief.created_at
    if (!latest) return candidate
    return new Date(candidate).getTime() > new Date(latest).getTime() ? candidate : latest
  }, null)
}

export type CoachSessionPrepSnapshot = {
  baselineStartedAt: string | null
  baselineLabel: string
  signalsSinceLastSession: number
  pipelineChangesSinceLastSession: number
  briefReviewsSinceLastSession: number
  briefUsesSinceLastSession: number
  interviewsSinceLastSession: number
  activePipelineCount: number
  overdueActions: number
  stalledLanes: StallSnapshot[]
  lastSignalDays: number
  lastBriefDays: number
}

export type CoachSessionSnapshotResult = {
  companies: Company[]
  signals: Signal[]
  briefs: Brief[]
  interviews: Interview[]
  followUps: FollowUp[]
  snapshot: CoachSessionPrepSnapshot
}

export async function buildCoachSessionSnapshot(
  supabase: {
    from: (table: string) => {
      select: (...args: unknown[]) => any
    }
  },
  params: {
    clientId: string
    coachId: string
    now?: Date
  },
): Promise<CoachSessionSnapshotResult> {
  const { clientId, coachId, now = new Date() } = params
  const last30dIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const last30dDate = toISODate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
  const todayIso = toISODate(now)

  const { data: latestReview } = await supabase
    .from('coach_weekly_reviews')
    .select('completed_at')
    .eq('coach_id', coachId)
    .eq('client_id', clientId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const fallbackBaseline = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const baselineStartedAt = latestReview?.completed_at ?? fallbackBaseline
  const baselineLabel = latestReview?.completed_at
    ? `Since session on ${formatSessionLabel(latestReview.completed_at)}`
    : 'Last 7 days'
  const activityWindowIso = baselineStartedAt < last30dIso ? baselineStartedAt : last30dIso

  const [
    { data: companiesData },
    { data: signalsData },
    { data: briefsData },
    { data: interviewsData },
    { data: followUpsData },
    { data: userEventsData },
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('id, stage, fit_score')
      .eq('user_id', clientId)
      .is('archived_at', null),
    supabase
      .from('company_signals')
      .select('signal_date, signal_type')
      .eq('user_id', clientId)
      .gte('signal_date', last30dDate)
      .order('signal_date', { ascending: false }),
    supabase
      .from('briefs')
      .select('created_at, reviewed_at, used_at, lifecycle_state')
      .eq('user_id', clientId)
      .in('type', ['prep', 'prep_section'])
      .gte('created_at', activityWindowIso)
      .order('created_at', { ascending: false }),
    supabase
      .from('company_interview_logs')
      .select('created_at, interview_stage')
      .eq('user_id', clientId)
      .gte('created_at', activityWindowIso)
      .order('created_at', { ascending: false }),
    supabase
      .from('follow_ups')
      .select('due_date')
      .eq('user_id', clientId)
      .eq('status', 'pending')
      .lte('due_date', todayIso),
    supabase
      .from('user_events')
      .select('event_name, created_at')
      .eq('user_id', clientId)
      .gte('created_at', baselineStartedAt)
      .in('event_name', ['company_added', 'pipeline_stage_changed']),
  ])

  const companies = (companiesData ?? []) as Company[]
  const signals = (signalsData ?? []) as Signal[]
  const briefs = (briefsData ?? []) as Brief[]
  const interviews = (interviewsData ?? []) as Interview[]
  const followUps = (followUpsData ?? []) as FollowUp[]
  const userEvents = (userEventsData ?? []) as UserEvent[]

  const baselineTs = new Date(baselineStartedAt).getTime()
  const signalsSinceLastSession = signals.filter((signal) => new Date(signal.signal_date).getTime() >= baselineTs).length
  const pipelineChangesSinceLastSession = userEvents.length
  const briefReviewsSinceLastSession = briefs.filter((brief) => brief.reviewed_at && new Date(brief.reviewed_at).getTime() >= baselineTs).length
  const briefUsesSinceLastSession = briefs.filter((brief) => brief.used_at && new Date(brief.used_at).getTime() >= baselineTs).length
  const interviewsSinceLastSession = interviews.filter((interview) => new Date(interview.created_at).getTime() >= baselineTs).length

  const activePipelineCount = companies.filter(
    (company) => company.stage === 'applied' || company.stage === 'interviewing' || company.stage === 'offer',
  ).length

  const lastSignalDays = signals.length > 0
    ? Math.ceil((Date.now() - new Date(signals[0].signal_date).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  const mostRecentBriefProgressAt = getMostRecentBriefProgressAt(briefs)
  const lastBriefDays = mostRecentBriefProgressAt
    ? Math.ceil((Date.now() - new Date(mostRecentBriefProgressAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  const stalledLanes = classifyGraphStalls({
    activePipelineCount,
    overdueActions: followUps.length,
    lastSignalDays,
    lastBriefDays,
    signalsSinceBaseline: signalsSinceLastSession,
    pipelineChangesSinceBaseline: pipelineChangesSinceLastSession,
    briefReviewsSinceBaseline: briefReviewsSinceLastSession,
  })

  return {
    companies,
    signals,
    briefs,
    interviews,
    followUps,
    snapshot: {
      baselineStartedAt: latestReview?.completed_at ?? null,
      baselineLabel,
      signalsSinceLastSession,
      pipelineChangesSinceLastSession,
      briefReviewsSinceLastSession,
      briefUsesSinceLastSession,
      interviewsSinceLastSession,
      activePipelineCount,
      overdueActions: followUps.length,
      stalledLanes,
      lastSignalDays,
      lastBriefDays,
    },
  }
}