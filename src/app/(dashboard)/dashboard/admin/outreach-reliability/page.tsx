import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { loadReliabilitySnapshotFromDb } from '@/lib/outreach/reliability-metrics'

function pct(value: number): string {
  return `${value.toFixed(1)}%`
}

function alertClass(level: 'info' | 'warning' | 'critical'): string {
  if (level === 'critical') return 'border-red-200 bg-red-50 text-red-900'
  if (level === 'warning') return 'border-amber-200 bg-amber-50 text-amber-900'
  return 'border-sky-200 bg-sky-50 text-sky-900'
}

function confidenceClass(band: 'high' | 'medium' | 'low'): string {
  if (band === 'high') return 'text-emerald-700'
  if (band === 'medium') return 'text-amber-700'
  return 'text-red-700'
}

export default async function OutreachReliabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()
  const snapshot = await loadReliabilitySnapshotFromDb(admin as any, { windowDays: 14 })

  const latestDay = snapshot.daily.at(-1)
  const last7 = snapshot.daily.slice(-7)
  const last7Total = last7.reduce((sum, row) => sum + row.total, 0)
  const last7Accepted = last7.reduce((sum, row) => sum + row.acceptedLike, 0)
  const last7AcceptedRate = last7Total > 0 ? (last7Accepted / last7Total) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="text-[13px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Admin</Link>
            <Link href="/dashboard/admin/outreach-analytics" className="text-[13px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Outreach Performance</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <section>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Outreach Reliability Confidence</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Hard daily reliability numbers from queue states, retries, and webhook advancement. Window: {snapshot.windowDays} days.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded p-5">
            <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Confidence Score</h2>
            <p className={`text-[28px] font-bold ${confidenceClass(snapshot.confidence.band)}`}>{snapshot.confidence.score}</p>
            <p className="text-[13px] text-slate-500 mt-1 capitalize">{snapshot.confidence.band} confidence</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Accepted Rate (7d)</h2>
            <p className="text-[28px] font-bold text-slate-900">{pct(last7AcceptedRate)}</p>
            <p className="text-[13px] text-slate-500 mt-1">Threshold: {snapshot.thresholds.minAcceptedRatePct}%</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Negative Outcomes</h2>
            <p className="text-[28px] font-bold text-slate-900">{pct(snapshot.totals.negativeOutcomeRatePct)}</p>
            <p className="text-[13px] text-slate-500 mt-1">Threshold: {snapshot.thresholds.maxNegativeOutcomeRatePct}% max</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Queue Health</h2>
            <p className="text-[28px] font-bold text-slate-900">{snapshot.queueHealth.queuedStaleCount + snapshot.queueHealth.sendingStaleCount}</p>
            <p className="text-[13px] text-slate-500 mt-1">Stale queued + stale sending jobs</p>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-400">Alert Thresholds</h2>
            <span className="text-[13px] text-slate-500">Updated {new Date(snapshot.generatedAt).toLocaleString()}</span>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[13px] text-slate-700">
            <div className="border border-slate-200 rounded p-3">Accepted rate floor: <span className="font-semibold">{snapshot.thresholds.minAcceptedRatePct}%</span></div>
            <div className="border border-slate-200 rounded p-3">Negative outcome cap: <span className="font-semibold">{snapshot.thresholds.maxNegativeOutcomeRatePct}%</span></div>
            <div className="border border-slate-200 rounded p-3">Hard failure cap: <span className="font-semibold">{snapshot.thresholds.maxHardFailureRatePct}%</span></div>
            <div className="border border-slate-200 rounded p-3">Retry cap: <span className="font-semibold">{snapshot.thresholds.maxRetryRatePct}%</span></div>
            <div className="border border-slate-200 rounded p-3">Queue stale max: <span className="font-semibold">{snapshot.thresholds.maxQueueStaleMinutes}m</span></div>
            <div className="border border-slate-200 rounded p-3">Sending lock max: <span className="font-semibold">{snapshot.thresholds.maxSendingLockMinutes}m</span></div>
            <div className="border border-slate-200 rounded p-3">Webhook lag max: <span className="font-semibold">{snapshot.thresholds.maxWebhookLagMinutes}m</span></div>
            <div className="border border-slate-200 rounded p-3">Today volume: <span className="font-semibold">{latestDay?.total ?? 0} jobs</span></div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-400">Active Alerts</h2>
            </div>
            <div className="px-5 py-4 space-y-2">
              {snapshot.alerts.length === 0 ? (
                <p className="text-[13px] text-emerald-700">No active reliability alerts.</p>
              ) : (
                snapshot.alerts.map(alert => (
                  <article key={alert.code} className={`border rounded p-3 ${alertClass(alert.level)}`}>
                    <h3 className="text-[13px] font-semibold">{alert.title}</h3>
                    <p className="text-[13px] mt-1">{alert.detail}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-400">Domain Reliability</h2>
            </div>
            <div className="px-5 py-4">
              {snapshot.domainBreakdown.length === 0 ? (
                <p className="text-[13px] text-slate-500">No sends in the selected window.</p>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="pb-2 font-semibold">Bucket</th>
                      <th className="pb-2 font-semibold text-right">Jobs</th>
                      <th className="pb-2 font-semibold text-right">Accepted</th>
                      <th className="pb-2 font-semibold text-right">Hard Fail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {snapshot.domainBreakdown.map(row => (
                      <tr key={row.domainBucket}>
                        <td className="py-2 text-slate-700 capitalize">{row.domainBucket}</td>
                        <td className="py-2 text-right text-slate-900 font-semibold">{row.total}</td>
                        <td className="py-2 text-right text-slate-900 font-semibold">{pct(row.acceptedRatePct)}</td>
                        <td className="py-2 text-right text-slate-900 font-semibold">{pct(row.hardFailureRatePct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-400">Daily Reliability Trend</h2>
          </div>
          <div className="px-5 py-4 overflow-x-auto">
            {snapshot.daily.length === 0 ? (
              <p className="text-[13px] text-slate-500">No daily records yet.</p>
            ) : (
              <table className="w-full text-[13px] min-w-[720px]">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 font-semibold text-right">Jobs</th>
                    <th className="pb-2 font-semibold text-right">Accepted</th>
                    <th className="pb-2 font-semibold text-right">Delivered</th>
                    <th className="pb-2 font-semibold text-right">Replied</th>
                    <th className="pb-2 font-semibold text-right">Negative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {snapshot.daily.map(day => (
                    <tr key={day.date}>
                      <td className="py-2 text-slate-700">{day.date}</td>
                      <td className="py-2 text-right text-slate-900 font-semibold">{day.total}</td>
                      <td className="py-2 text-right text-slate-900 font-semibold">{pct(day.acceptedRatePct)}</td>
                      <td className="py-2 text-right text-slate-900 font-semibold">{day.delivered}</td>
                      <td className="py-2 text-right text-slate-900 font-semibold">{day.replied}</td>
                      <td className="py-2 text-right text-slate-900 font-semibold">{pct(day.negativeOutcomeRatePct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
