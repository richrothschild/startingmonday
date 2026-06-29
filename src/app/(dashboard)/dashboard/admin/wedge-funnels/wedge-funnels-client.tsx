'use client'

import { useEffect, useMemo, useState } from 'react'

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: T }

type ScorecardResponse = {
  generated_at: string
  lookback_days: number
  shortlist: {
    viewed_users: number
    cta_click_users: number
    checkout_started_users: number
    purchased_users: number
    delivered_users: number
    credit_applied_users: number
    cta_click_through_rate: number
    checkout_start_rate: number
    purchase_rate_from_checkout: number
    delivery_completion_rate: number
    credit_application_rate: number
  }
  pilot: {
    seats_total: number
    seats_active_rate: number
    at_risk_seats: number
    partner_accounts_active: number
    seat_updates_logged: number
  }
  decision: {
    motion1_direct_paid_sprint: 'scale' | 'iterate' | 'stop'
    motion2_partner_pilot: 'scale' | 'iterate' | 'stop'
    summary: 'scale' | 'iterate' | 'stop'
    reasons: string[]
  }
  snapshot_history: Array<{
    week_start: string
    generated_at: string
    lookback_days: number
    shortlist_purchase_rate_from_checkout: number
    shortlist_delivery_completion_rate: number
    pilot_seats_active_rate: number
    pilot_at_risk_seats: number
    decision_summary: string
  }>
  trend: {
    purchase_rate_from_checkout_delta: number
    delivery_completion_rate_delta: number
    seats_active_rate_delta: number
    at_risk_seats_delta: number
  } | null
  cron_runs: Array<{
    triggered_at: string
    finished_at: string | null
    duration_ms: number
    lookback_days: number
    success: boolean
    decision_summary: string | null
    snapshot_history_count: number
    http_status: number
    error_message: string | null
  }>
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(payload.error ?? `Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

function statusBadge(ok: boolean): string {
  return ok
    ? 'rounded-full border border-emerald-300/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-100'
    : 'rounded-full border border-rose-300/30 bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-100'
}

function decisionBadge(decision: 'scale' | 'iterate' | 'stop'): string {
  if (decision === 'scale') return 'rounded-full border border-emerald-300/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-100'
  if (decision === 'iterate') return 'rounded-full border border-amber-300/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-100'
  return 'rounded-full border border-rose-300/30 bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-100'
}

export default function WedgeFunnelsClient() {
  const [scorecard, setScorecard] = useState<LoadState<ScorecardResponse>>({ status: 'loading' })
  const [persisting, setPersisting] = useState(false)
  const [persistError, setPersistError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadScorecard() {
      const scorecardResult = await fetchJson<ScorecardResponse>('/api/admin/automation/reporting/wedge-funnel-scorecard?lookbackDays=30')
        .then((data) => ({ ok: true as const, data }))
        .catch((error: unknown) => ({ ok: false as const, error }))

      if (cancelled) return

      if (scorecardResult.ok) {
        setScorecard({ status: 'ready', data: scorecardResult.data })
      } else {
        setScorecard({ status: 'error', error: scorecardResult.error instanceof Error ? scorecardResult.error.message : 'Unable to load wedge scorecard.' })
      }
    }

    void loadScorecard()
    return () => {
      cancelled = true
    }
  }, [])

  const systemHealthy = useMemo(() => {
    return scorecard.status === 'ready'
  }, [scorecard.status])

  const shortlistMetrics = scorecard.status === 'ready' ? scorecard.data.shortlist : null
  const pilotMetrics = scorecard.status === 'ready' ? scorecard.data.pilot : null
  const decision = scorecard.status === 'ready' ? scorecard.data.decision : null
  const snapshotHistory = scorecard.status === 'ready' ? scorecard.data.snapshot_history : []
  const trend = scorecard.status === 'ready' ? scorecard.data.trend : null
  const cronRuns = scorecard.status === 'ready' ? scorecard.data.cron_runs : []

  function deltaText(value: number, suffix = ''): string {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value}${suffix}`
  }

  async function persistWeeklySnapshot() {
    setPersisting(true)
    setPersistError(null)

    try {
      const response = await fetch('/api/admin/automation/reporting/wedge-funnel-scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lookbackDays: 30 }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string }
        setPersistError(payload.error ?? 'Unable to persist weekly snapshot.')
        return
      }

      const refreshed = await fetchJson<ScorecardResponse>('/api/admin/automation/reporting/wedge-funnel-scorecard?lookbackDays=30')
      setScorecard({ status: 'ready', data: refreshed })
    } catch {
      setPersistError('Unable to persist weekly snapshot.')
    } finally {
      setPersisting(false)
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-400">Unified wedge monitor</p>
            <p className="mt-1 text-[13px] text-slate-300">Single pane for shortlist and partner pilot health.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={statusBadge(systemHealthy)}>{systemHealthy ? 'all feeds healthy' : 'attention needed'}</span>
            <button
              type="button"
              onClick={persistWeeklySnapshot}
              disabled={persisting}
              className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {persisting ? 'Saving...' : 'Save weekly snapshot'}
            </button>
          </div>
        </div>
        {persistError ? <p className="mt-3 text-[13px] text-rose-300">{persistError}</p> : null}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a href="/api/admin/automation/reporting/wedge-funnel-scorecard?lookbackDays=30" className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[12px] text-slate-200 hover:border-white/30">
            Wedge scorecard API
          </a>
          <a href="/api/admin/automation/reporting/shortlist-sprint-funnel?lookbackDays=30" className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[12px] text-slate-200 hover:border-white/30">
            Shortlist funnel API
          </a>
          <a href="/api/admin/automation/reporting/wedge-epic-closeout?lookbackDays=30" className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[12px] text-slate-200 hover:border-white/30">
            SMK-395/398/401 closeout artifact API
          </a>
          <a href="/api/cron/wedge-weekly-scorecard" className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[12px] text-slate-200 hover:border-white/30 sm:col-span-2">
            Weekly cron trigger API (requires cron secret)
          </a>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">Scale or stop decision gate</p>
          {decision ? <span className={decisionBadge(decision.summary)}>{decision.summary}</span> : null}
        </div>
        {scorecard.status === 'loading' ? <p className="mt-3 text-[13px] text-slate-300">Loading...</p> : null}
        {scorecard.status === 'error' ? <p className="mt-3 text-[13px] text-rose-300">{scorecard.error}</p> : null}
        {decision ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[13px] text-slate-200">
              <p>Direct paid sprint: <span className="font-semibold text-white">{decision.motion1_direct_paid_sprint}</span></p>
              <p className="mt-1">Partner pilot: <span className="font-semibold text-white">{decision.motion2_partner_pilot}</span></p>
            </div>
            <ul className="space-y-1.5 text-[13px] text-slate-200">
              {decision.reasons.map((reason) => (
                <li key={reason} className="flex gap-2"><span className="text-orange-300">+</span><span>{reason}</span></li>
              ))}
            </ul>
          </div>
        ) : null}

        {trend ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[12px] text-slate-200">
              <p className="text-slate-400">Purchase WoW</p>
              <p className="mt-1 text-[14px] font-semibold text-white">{deltaText(trend.purchase_rate_from_checkout_delta, '%')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[12px] text-slate-200">
              <p className="text-slate-400">Delivery WoW</p>
              <p className="mt-1 text-[14px] font-semibold text-white">{deltaText(trend.delivery_completion_rate_delta, '%')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[12px] text-slate-200">
              <p className="text-slate-400">Seats Active WoW</p>
              <p className="mt-1 text-[14px] font-semibold text-white">{deltaText(trend.seats_active_rate_delta, '%')}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[12px] text-slate-200">
              <p className="text-slate-400">At-risk Seats WoW</p>
              <p className="mt-1 text-[14px] font-semibold text-white">{deltaText(trend.at_risk_seats_delta)}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">Weekly snapshot history</p>
          <span className="text-[12px] text-slate-300">Latest 8 weeks</span>
        </div>

        {snapshotHistory.length === 0 ? (
          <p className="mt-3 text-[13px] text-slate-300">No snapshots saved yet. Use Save weekly snapshot to persist the current run.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-[12px] text-slate-200">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2 pr-4">Week</th>
                  <th className="py-2 pr-4">Purchase rate</th>
                  <th className="py-2 pr-4">Delivery rate</th>
                  <th className="py-2 pr-4">Seats active</th>
                  <th className="py-2 pr-4">At-risk seats</th>
                  <th className="py-2 pr-4">Decision</th>
                </tr>
              </thead>
              <tbody>
                {snapshotHistory.map((row) => (
                  <tr key={`${row.week_start}-${row.generated_at}`} className="border-b border-white/5">
                    <td className="py-2 pr-4">{row.week_start}</td>
                    <td className="py-2 pr-4">{row.shortlist_purchase_rate_from_checkout}%</td>
                    <td className="py-2 pr-4">{row.shortlist_delivery_completion_rate}%</td>
                    <td className="py-2 pr-4">{row.pilot_seats_active_rate}%</td>
                    <td className="py-2 pr-4">{row.pilot_at_risk_seats}</td>
                    <td className="py-2 pr-4"><span className={decisionBadge(row.decision_summary as 'scale' | 'iterate' | 'stop')}>{row.decision_summary}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">Cron execution log</p>
          <span className="text-[12px] text-slate-300">Latest 8 runs</span>
        </div>

        {cronRuns.length === 0 ? (
          <p className="mt-3 text-[13px] text-slate-300">No cron runs logged yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-[12px] text-slate-200">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2 pr-4">Triggered</th>
                  <th className="py-2 pr-4">Duration</th>
                  <th className="py-2 pr-4">HTTP</th>
                  <th className="py-2 pr-4">Decision</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Error</th>
                </tr>
              </thead>
              <tbody>
                {cronRuns.map((run) => (
                  <tr key={run.triggered_at} className="border-b border-white/5">
                    <td className="py-2 pr-4">{new Date(run.triggered_at).toISOString()}</td>
                    <td className="py-2 pr-4">{run.duration_ms}ms</td>
                    <td className="py-2 pr-4">{run.http_status}</td>
                    <td className="py-2 pr-4">{run.decision_summary ?? '-'}</td>
                    <td className="py-2 pr-4"><span className={statusBadge(run.success)}>{run.success ? 'success' : 'failed'}</span></td>
                    <td className="py-2 pr-4">{run.error_message ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">Shortlist sprint</p>
            <span className={statusBadge(scorecard.status === 'ready')}>{scorecard.status}</span>
          </div>
          {scorecard.status === 'loading' ? <p className="mt-3 text-[13px] text-slate-300">Loading...</p> : null}
          {scorecard.status === 'error' ? <p className="mt-3 text-[13px] text-rose-300">{scorecard.error}</p> : null}
          {shortlistMetrics ? (
            <div className="mt-3 space-y-2 text-[13px] text-slate-200">
              <p>Viewed users: <span className="font-semibold text-white">{shortlistMetrics.viewed_users}</span></p>
              <p>CTA click-through: <span className="font-semibold text-white">{shortlistMetrics.cta_click_through_rate}%</span></p>
              <p>Checkout start rate: <span className="font-semibold text-white">{shortlistMetrics.checkout_start_rate}%</span></p>
              <p>Purchase from checkout: <span className="font-semibold text-white">{shortlistMetrics.purchase_rate_from_checkout}%</span></p>
              <p>Delivery completion: <span className="font-semibold text-white">{shortlistMetrics.delivery_completion_rate}%</span></p>
              <p>Credit application: <span className="font-semibold text-white">{shortlistMetrics.credit_application_rate}%</span></p>
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">Partner pilot</p>
            <span className={statusBadge(scorecard.status === 'ready')}>{scorecard.status}</span>
          </div>
          {scorecard.status === 'loading' ? <p className="mt-3 text-[13px] text-slate-300">Loading...</p> : null}
          {scorecard.status === 'error' ? <p className="mt-3 text-[13px] text-rose-300">{scorecard.error}</p> : null}
          {pilotMetrics ? (
            <div className="mt-3 space-y-2 text-[13px] text-slate-200">
              <p>Seats total: <span className="font-semibold text-white">{pilotMetrics.seats_total}</span></p>
              <p>Seats active rate: <span className="font-semibold text-white">{pilotMetrics.seats_active_rate}%</span></p>
              <p>At-risk seats: <span className="font-semibold text-white">{pilotMetrics.at_risk_seats}</span></p>
              <p>Seat updates logged: <span className="font-semibold text-white">{pilotMetrics.seat_updates_logged}</span></p>
              <p>Partner accounts active: <span className="font-semibold text-white">{pilotMetrics.partner_accounts_active}</span></p>
            </div>
          ) : null}
        </article>

      </section>
    </>
  )
}
