type KPIChainRow = {
  id?: string
  company_id?: string | null
  signal_id?: string | null
  signal_type?: string
  action_type?: string
}

type KPIChainResult = {
  windowDays: number
  windowStart: string
  counts: {
    signals: number
    relationship_actions: number
    interviews: number
    actions_linked_to_signals: number
    actions_linked_to_signal_companies: number
    relationship_companies: number
    interviewed_companies: number
    relationship_to_interview_companies: number
  }
  rates: {
    signal_to_relationship_action_pct: number | null
    signal_to_interview_pct: number | null
    relationship_action_to_interview_pct: number | null
    relationship_company_to_interview_company_pct: number | null
  }
  action_breakdown: Record<string, number>
}

type QueryResult = {
  data: KPIChainRow[] | null
  error: { message: string } | null
}

function pct(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null
  return Number(((numerator / denominator) * 100).toFixed(2))
}

export async function computeOutreachKPIChain(params: {
  supabase: any
  userId: string
  windowDays: number
}): Promise<{ ok: true; payload: KPIChainResult } | { ok: false; error: string }> {
  const boundedWindow = Math.min(Math.max(Math.trunc(params.windowDays), 7), 180)
  const sinceDate = new Date(Date.now() - boundedWindow * 24 * 60 * 60 * 1000)
  const sinceIso = sinceDate.toISOString()
  const sinceDay = sinceIso.slice(0, 10)

  const [signalsRes, actionsRes, interviewsRes] = await Promise.all([
    params.supabase
      .from('company_signals')
      .select('id, company_id, signal_type')
      .eq('user_id', params.userId)
      .gte('signal_date', sinceDay)
      .limit(5000),
    params.supabase
      .from('signal_action_events')
      .select('id, company_id, signal_id, action_type, created_at')
      .eq('user_id', params.userId)
      .gte('created_at', sinceIso)
      .limit(5000),
    params.supabase
      .from('company_interview_logs')
      .select('id, company_id, created_at')
      .eq('user_id', params.userId)
      .gte('created_at', sinceIso)
      .limit(5000),
  ]) as [QueryResult, QueryResult, QueryResult]

  if (signalsRes.error || actionsRes.error || interviewsRes.error) {
    return {
      ok: false,
      error: [signalsRes.error?.message, actionsRes.error?.message, interviewsRes.error?.message]
        .filter(Boolean)
        .join(' | ') || 'Failed to load KPI chain metrics.',
    }
  }

  const signals = signalsRes.data ?? []
  const actions = actionsRes.data ?? []
  const interviews = interviewsRes.data ?? []

  const signalIds = new Set(signals.map((row) => row.id).filter((value): value is string => Boolean(value)))
  const signalCompanyIds = new Set(
    signals
      .map((row) => row.company_id)
      .filter((value): value is string => Boolean(value))
  )

  const actionsLinkedToSignals = actions.filter((row) => row.signal_id && signalIds.has(row.signal_id))
  const actionsLinkedToSignalCompanies = actions.filter((row) => row.company_id && signalCompanyIds.has(row.company_id))

  const interviewedCompanyIds = new Set(
    interviews
      .map((row) => row.company_id)
      .filter((value): value is string => Boolean(value))
  )

  const relationshipCompanyIds = new Set(
    actions
      .map((row) => row.company_id)
      .filter((value): value is string => Boolean(value))
  )

  const relationshipToInterviewCompanies = [...interviewedCompanyIds].filter((companyId) => relationshipCompanyIds.has(companyId))

  const actionCountsByType = actions.reduce<Record<string, number>>((acc, row) => {
    const type = row.action_type ?? 'unknown'
    acc[type] = (acc[type] ?? 0) + 1
    return acc
  }, {})

  return {
    ok: true,
    payload: {
      windowDays: boundedWindow,
      windowStart: sinceIso,
      counts: {
        signals: signals.length,
        relationship_actions: actions.length,
        interviews: interviews.length,
        actions_linked_to_signals: actionsLinkedToSignals.length,
        actions_linked_to_signal_companies: actionsLinkedToSignalCompanies.length,
        relationship_companies: relationshipCompanyIds.size,
        interviewed_companies: interviewedCompanyIds.size,
        relationship_to_interview_companies: relationshipToInterviewCompanies.length,
      },
      rates: {
        signal_to_relationship_action_pct: pct(actions.length, signals.length),
        signal_to_interview_pct: pct(interviews.length, signals.length),
        relationship_action_to_interview_pct: pct(interviews.length, actions.length),
        relationship_company_to_interview_company_pct: pct(
          relationshipToInterviewCompanies.length,
          relationshipCompanyIds.size
        ),
      },
      action_breakdown: actionCountsByType,
    },
  }
}
