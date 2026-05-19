'use client'

import { useEffect, useState } from 'react'

interface Scorecard {
  pipeline: {
    total_companies: number
    by_stage: {
      watching: number
      researching: number
      applied: number
      interviewing_or_offer: number
    }
    avg_fit_score: number
  }
  signals: {
    last_30_days: number
    avg_score: number
  }
  preparation: {
    briefs_last_30_days: number
    interviews_last_30_days: number
    interviews_by_outcome: {
      successful: number
      advancing: number
      rejected: number
    }
  }
  activity_health: {
    is_active: boolean
    last_signal_days: number
    last_brief_days: number
  }
  session_prep_snapshot: {
    signals_last_7_days: number
    briefs_last_7_days: number
    interviews_last_7_days: number
    active_pipeline_count: number
    overdue_actions: number
  }
  weekly_trends: Array<{
    week_start: string
    signals: number
    briefs: number
    interviews: number
  }>
}

interface Company {
  id: string
  name: string
  stage: string
  fit_score: number
  notes?: string
}

interface Signal {
  id: string
  companies?: { name: string } | null
  signal_type: string
  signal_summary: string
  signal_date: string
  source_url?: string | null
}

interface Brief {
  id: string
  company_id: string
  companies?: { name: string } | null
  type: string
  output_text: string
  user_rating?: number | null
  created_at: string
}

export function CoachClientDataView({ clientId }: { clientId: string }) {
  const [scorecard, setScorecard] = useState<Scorecard | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [activeTab, setActiveTab] = useState('scorecard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [scorecardRes, companiesRes, signalsRes, briefsRes] = await Promise.all([
          fetch(`/api/coach/client/${clientId}/scorecards`),
          fetch(`/api/coach/client/${clientId}/companies`),
          fetch(`/api/coach/client/${clientId}/signals`),
          fetch(`/api/coach/client/${clientId}/briefs`),
        ])

        if (!scorecardRes.ok) throw new Error('Failed to load scorecard')
        if (!companiesRes.ok) throw new Error('Failed to load companies')
        if (!signalsRes.ok) throw new Error('Failed to load signals')
        if (!briefsRes.ok) throw new Error('Failed to load briefs')

        const scorecardData = await scorecardRes.json()
        const companiesData = await companiesRes.json()
        const signalsData = await signalsRes.json()
        const briefsData = await briefsRes.json()

        setScorecard(scorecardData.data)
        setCompanies(companiesData.data || [])
        setSignals(signalsData.data || [])
        setBriefs(briefsData.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [clientId])

  if (loading) {
    return <div className="p-6 text-center">Loading client data...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  if (!scorecard) {
    return <div className="p-6 text-center">No data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border border-slate-200 rounded-lg p-4 bg-white">
        <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-500 mb-3">
          Session Prep Snapshot (last 7 days)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded border border-slate-200 p-3 bg-slate-50">
            <p className="text-[11px] text-slate-500">Signals</p>
            <p className="text-[18px] font-bold text-slate-900">{scorecard.session_prep_snapshot.signals_last_7_days}</p>
          </div>
          <div className="rounded border border-slate-200 p-3 bg-slate-50">
            <p className="text-[11px] text-slate-500">Briefs</p>
            <p className="text-[18px] font-bold text-slate-900">{scorecard.session_prep_snapshot.briefs_last_7_days}</p>
          </div>
          <div className="rounded border border-slate-200 p-3 bg-slate-50">
            <p className="text-[11px] text-slate-500">Interviews</p>
            <p className="text-[18px] font-bold text-slate-900">{scorecard.session_prep_snapshot.interviews_last_7_days}</p>
          </div>
          <div className="rounded border border-slate-200 p-3 bg-slate-50">
            <p className="text-[11px] text-slate-500">Active pipeline</p>
            <p className="text-[18px] font-bold text-slate-900">{scorecard.session_prep_snapshot.active_pipeline_count}</p>
          </div>
          <div className="rounded border border-slate-200 p-3 bg-slate-50">
            <p className="text-[11px] text-slate-500">Overdue actions</p>
            <p className={`text-[18px] font-bold ${scorecard.session_prep_snapshot.overdue_actions > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {scorecard.session_prep_snapshot.overdue_actions}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          {[
            { id: 'scorecard', label: 'Scorecard' },
            { id: 'trends', label: 'Weekly Trends' },
            { id: 'pipeline', label: 'Pipeline' },
            { id: 'signals', label: 'Signals' },
            { id: 'briefs', label: 'Briefs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scorecard Tab */}
      {activeTab === 'scorecard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 rounded-lg p-6 bg-white">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Pipeline Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Companies</span>
                <span className="text-lg font-bold text-slate-900">
                  {scorecard.pipeline.total_companies}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(scorecard.pipeline.by_stage).map(([stage, count]) => (
                  <div key={stage} className="text-center">
                    <div className="text-xs text-slate-500 capitalize">
                      {stage.replace('_', ' ')}
                    </div>
                    <div className="text-lg font-bold text-slate-900">{count}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">Avg Fit Score</span>
                <span className="text-lg font-bold text-orange-600">
                  {scorecard.pipeline.avg_fit_score}%
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 bg-white">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Status</span>
                  <span
                    className={`text-sm font-semibold ${
                      scorecard.activity_health.is_active
                        ? 'text-green-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {scorecard.activity_health.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Last Signal</span>
                <span className="text-sm font-medium text-slate-900">
                  {scorecard.activity_health.last_signal_days >= 999
                    ? 'None'
                    : `${scorecard.activity_health.last_signal_days}d ago`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Last Brief</span>
                <span className="text-sm font-medium text-slate-900">
                  {scorecard.activity_health.last_brief_days >= 999
                    ? 'None'
                    : `${scorecard.activity_health.last_brief_days}d ago`}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 bg-white">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Signal Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Last 30 Days</span>
                <span className="text-lg font-bold text-slate-900">
                  {scorecard.signals.last_30_days}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Avg Score</span>
                <span className="text-lg font-bold text-orange-600">
                  {scorecard.signals.avg_score}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-6 bg-white">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Interview Outcomes</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Successful</span>
                <span className="text-lg font-bold text-green-600">
                  {scorecard.preparation.interviews_by_outcome.successful}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Advancing</span>
                <span className="text-lg font-bold text-blue-600">
                  {scorecard.preparation.interviews_by_outcome.advancing}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Rejected</span>
                <span className="text-lg font-bold text-red-600">
                  {scorecard.preparation.interviews_by_outcome.rejected}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Trends Tab */}
      {activeTab === 'trends' && (
        <div className="border border-slate-200 rounded-lg p-5 bg-white">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Weekly Progress Markers</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-[11px] font-semibold text-slate-600 px-4 py-2">Week</th>
                  <th className="text-right text-[11px] font-semibold text-slate-600 px-4 py-2">Signals</th>
                  <th className="text-right text-[11px] font-semibold text-slate-600 px-4 py-2">Briefs</th>
                  <th className="text-right text-[11px] font-semibold text-slate-600 px-4 py-2">Interviews</th>
                </tr>
              </thead>
              <tbody>
                {scorecard.weekly_trends.map((week) => (
                  <tr key={week.week_start} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-[12px] text-slate-700">Week of {week.week_start}</td>
                    <td className="px-4 py-2 text-[12px] text-right font-semibold text-slate-900 tabular-nums">{week.signals}</td>
                    <td className="px-4 py-2 text-[12px] text-right font-semibold text-slate-900 tabular-nums">{week.briefs}</td>
                    <td className="px-4 py-2 text-[12px] text-right font-semibold text-slate-900 tabular-nums">{week.interviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company) => (
              <div key={company.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900">{company.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-600 capitalize">{company.stage}</span>
                  <span className="text-sm font-bold text-orange-600">{company.fit_score}%</span>
                </div>
                {company.notes && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{company.notes}</p>
                )}
              </div>
            ))}
          </div>
          {companies.length === 0 && (
            <div className="text-center text-slate-500 p-8">No companies in pipeline</div>
          )}
        </div>
      )}

      {/* Signals Tab */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          {signals.slice(0, 20).map((signal) => (
            <div key={signal.id} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-900">
                  {(signal.companies?.name ?? 'Company')} · {signal.signal_type.replace('_', ' ')}
                </h4>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded capitalize">
                  {signal.signal_type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-2">{signal.signal_summary}</p>
              <p className="text-xs text-slate-500">
                {new Date(signal.signal_date).toLocaleDateString()}
              </p>
              {signal.source_url && (
                <a
                  href={signal.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
                >
                  Open source
                </a>
              )}
            </div>
          ))}
          {signals.length === 0 && (
            <div className="text-center text-slate-500 p-8">No signals detected</div>
          )}
        </div>
      )}

      {/* Briefs Tab */}
      {activeTab === 'briefs' && (
        <div className="space-y-4">
          {briefs.slice(0, 20).map((brief) => (
            <div key={brief.id} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {(brief.companies?.name ?? 'General')} · {brief.type}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-3">{brief.output_text}</p>
                </div>
              </div>
              {brief.user_rating !== null && brief.user_rating !== undefined && (
                <p className="text-xs text-slate-500 mt-2">Rating: {brief.user_rating > 0 ? 'positive' : 'negative'}</p>
              )}
              <p className="text-xs text-slate-500 mt-3">
                {new Date(brief.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {briefs.length === 0 && (
            <div className="text-center text-slate-500 p-8">No briefs created</div>
          )}
        </div>
      )}
    </div>
  )
}
