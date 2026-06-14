import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'

export const metadata = { title: 'Intelligence QA Scorecard - Admin' }

type ScorecardRow = {
  id: string
  week_start: string
  generated_at: string
  sample_size: number
  source_coverage_rate: number
  confidence_coverage_rate: number
  avg_confidence: number
  relevance_avg: number
  suppression_rate: number
  stale_rate: number
  false_positive_proxy_rate: number
  by_channel: Record<string, number>
  by_source_kind: Record<string, number>
  notes: string | null
}

function statusClass(pass: boolean): string {
  return pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
}

export default async function IntelligenceQaScorecardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()
  const { data } = await admin
    .from('intelligence_qa_weekly_scorecards')
    .select('id, week_start, generated_at, sample_size, source_coverage_rate, confidence_coverage_rate, avg_confidence, relevance_avg, suppression_rate, stale_rate, false_positive_proxy_rate, by_channel, by_source_kind, notes')
    .order('week_start', { ascending: false })
    .limit(12)

  const rows = (data ?? []) as ScorecardRow[]
  const latest = rows[0]

  const latestPass = !!latest && latest.source_coverage_rate >= 95
    && latest.confidence_coverage_rate >= 95
    && latest.false_positive_proxy_rate <= 8

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/intelligence" className="text-[13px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Intelligence</Link>
            <Link href="/dashboard/admin" className="text-[13px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
<div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Intelligence QA Scorecard</h1>
            <p className="text-[13px] text-slate-500 mt-1.5">Weekly Sprint 5 quality loop for coverage, confidence, ranking relevance, and suppression stability.</p>
          </div>
          {latest && (
            <span className={`text-[13px] font-semibold px-2 py-1 rounded ${statusClass(latestPass)}`}>
              {latestPass ? 'PASS' : 'ATTENTION'}
            </span>
          )}
        </div>

        {latest && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-500">Source coverage</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1">{latest.source_coverage_rate.toFixed(1)}%</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-500">Confidence coverage</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1">{latest.confidence_coverage_rate.toFixed(1)}%</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-slate-500">False-positive proxy</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1">{latest.false_positive_proxy_rate.toFixed(1)}%</p>
            </div>
          </section>
        )}

        {latest && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded p-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-3">Channel coverage matrix</h2>
              <div className="space-y-2 text-[13px]">
                {Object.keys(latest.by_channel ?? {}).length === 0 && <p className="text-slate-500">No channel data in latest run.</p>}
                {Object.entries(latest.by_channel ?? {}).map(([channel, count]) => (
                  <div key={channel} className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-700">{channel}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-3">Source connector matrix</h2>
              <div className="space-y-2 text-[13px]">
                {Object.keys(latest.by_source_kind ?? {}).length === 0 && <p className="text-slate-500">No source data in latest run.</p>}
                {Object.entries(latest.by_source_kind ?? {}).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-700">{source}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900">Weekly history</h2>
          </div>
          <table className="w-full text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-2 text-left">Week</th>
                <th className="px-4 py-2 text-right">Sample</th>
                <th className="px-4 py-2 text-right">Source %</th>
                <th className="px-4 py-2 text-right">Confidence %</th>
                <th className="px-4 py-2 text-right">Relevance</th>
                <th className="px-4 py-2 text-right">Suppression %</th>
                <th className="px-5 py-2 text-right">FP proxy %</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="px-5 py-4 text-slate-500" colSpan={7}>No weekly scorecards yet. Run the intelligence QA automation endpoint to generate one.</td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 text-slate-700">{row.week_start}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.sample_size}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.source_coverage_rate.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.confidence_coverage_rate.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.relevance_avg.toFixed(1)}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.suppression_rate.toFixed(1)}%</td>
                  <td className="px-5 py-2 text-right text-slate-700">{row.false_positive_proxy_rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
