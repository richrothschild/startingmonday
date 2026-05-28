import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'

export const metadata = { title: 'Onboarding QA Scorecard - Admin' }

type ScorecardRow = {
  id: string
  week_start: string
  generated_at: string
  started_users: number
  completed_users: number
  transition_first_completed: number
  median_seconds_to_first_value: number
  under_ten_min_rate: number
  avg_manual_fields_reduction_rate: number
  low_energy_mode_rate: number
  nudge_coverage_rate: number
  channel_mix: Record<string, number>
  persona_mix: Record<string, number>
  notes: string | null
}

function statusClass(pass: boolean): string {
  return pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
}

function formatMinutes(seconds: number): string {
  if (!seconds || seconds <= 0) return 'N/A'
  const minutes = (seconds / 60).toFixed(1)
  return `${minutes} min`
}

export default async function OnboardingQaScorecardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()
  const { data } = await admin
    .from('onboarding_qa_weekly_scorecards')
    .select('id, week_start, generated_at, started_users, completed_users, transition_first_completed, median_seconds_to_first_value, under_ten_min_rate, avg_manual_fields_reduction_rate, low_energy_mode_rate, nudge_coverage_rate, channel_mix, persona_mix, notes')
    .order('week_start', { ascending: false })
    .limit(12)

  const rows = (data ?? []) as ScorecardRow[]
  const latest = rows[0]

  const latestPass = !!latest
    && latest.under_ten_min_rate >= 70
    && latest.avg_manual_fields_reduction_rate >= 40
    && latest.completed_users >= Math.max(1, Math.floor(latest.started_users * 0.6))

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/metrics" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Metrics</Link>
            <Link href="/dashboard/admin" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200 transition-colors">Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
<div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Onboarding QA Scorecard</h1>
            <p className="text-[13px] text-slate-500 mt-1.5">Weekly Sprint 6 quality loop for implementation speed, setup defaults, low-energy usage, and completion nudges.</p>
          </div>
          {latest && (
            <span className={`text-[11px] font-semibold px-2 py-1 rounded ${statusClass(latestPass)}`}>
              {latestPass ? 'PASS' : 'ATTENTION'}
            </span>
          )}
        </div>

        {latest && (
          <section className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">TTFV median</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1">{formatMinutes(latest.median_seconds_to_first_value)}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Under 10 min</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1">{latest.under_ten_min_rate.toFixed(1)}%</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Manual field reduction</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1">{latest.avg_manual_fields_reduction_rate.toFixed(1)}%</p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-4">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Low-energy adoption</p>
              <p className="text-[24px] font-bold text-slate-900 mt-1">{latest.low_energy_mode_rate.toFixed(1)}%</p>
            </div>
          </section>
        )}

        {latest && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded p-5">
              <h2 className="text-[12px] font-semibold text-slate-900 mb-3">Channel mix</h2>
              <div className="space-y-2 text-[12px]">
                {Object.keys(latest.channel_mix ?? {}).length === 0 && <p className="text-slate-500">No channel mix data in latest run.</p>}
                {Object.entries(latest.channel_mix ?? {}).map(([channel, count]) => (
                  <div key={channel} className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-700">{channel}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded p-5">
              <h2 className="text-[12px] font-semibold text-slate-900 mb-3">Persona mix</h2>
              <div className="space-y-2 text-[12px]">
                {Object.keys(latest.persona_mix ?? {}).length === 0 && <p className="text-slate-500">No persona data in latest run.</p>}
                {Object.entries(latest.persona_mix ?? {}).map(([persona, count]) => (
                  <div key={persona} className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-700">{persona}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-[12px] font-semibold text-slate-900">Weekly history</h2>
          </div>
          <table className="w-full text-[12px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-2 text-left">Week</th>
                <th className="px-4 py-2 text-right">Started</th>
                <th className="px-4 py-2 text-right">Completed</th>
                <th className="px-4 py-2 text-right">TTFV median</th>
                <th className="px-4 py-2 text-right">Under 10 min %</th>
                <th className="px-4 py-2 text-right">Reduction %</th>
                <th className="px-5 py-2 text-right">Low-energy %</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="px-5 py-4 text-slate-500" colSpan={7}>No weekly scorecards yet. Run the onboarding QA automation endpoint to generate one.</td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-2 text-slate-700">{row.week_start}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.started_users}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.completed_users}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{formatMinutes(row.median_seconds_to_first_value)}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.under_ten_min_rate.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right text-slate-700">{row.avg_manual_fields_reduction_rate.toFixed(1)}%</td>
                  <td className="px-5 py-2 text-right text-slate-700">{row.low_energy_mode_rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
