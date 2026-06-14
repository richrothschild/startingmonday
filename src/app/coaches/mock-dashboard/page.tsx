import type { Metadata } from 'next'
import Link from 'next/link'
import { MOCK_CLIENTS, MOCK_PORTFOLIO_KPIS } from './mock-data'

export const metadata: Metadata = {
  title: 'Mock Coach Dashboard | Starting Monday',
  description:
    'Preview the coach command center: portfolio risk, weekly execution, and client-level next actions in one view.',
  alternates: {
    canonical: 'https://startingmonday.app/coaches/mock-dashboard',
  },
}

export default function MockCoachDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/coaches" className="text-[13px] text-slate-200 transition-colors hover:text-white">
            Back to coaches
          </Link>
        </div>
      </nav>

      <header className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold tracking-[0.14em] text-orange-500">Mock coach dashboard</p>
          <h1 className="mt-2 text-[30px] font-bold leading-tight text-slate-900 sm:text-[38px]">
            Your next coaching session should start with decisions, not recap.
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-600">
            Manage your full client portfolio in one place, then click into any client to see the intervention plan,
            session agenda, commitment risk, and momentum signals before you meet.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {MOCK_PORTFOLIO_KPIS.map((kpi) => (
            <article key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-bold tracking-[0.1em] text-slate-500">{kpi.label}</p>
              <p className="mt-2 text-[28px] font-bold leading-none text-slate-900">{kpi.value}</p>
              <p className="mt-1 text-[12px] text-slate-500">{kpi.note}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold tracking-[0.12em] text-slate-500">Portfolio command center</p>
            <p className="text-[12px] text-slate-500">Click any client to open the detailed coach dashboard</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] text-slate-500">Client</th>
                  <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] text-slate-500">Track</th>
                  <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] text-slate-500">Status</th>
                  <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] text-slate-500">Momentum</th>
                  <th className="py-2 pr-3 text-[11px] font-bold tracking-[0.08em] text-slate-500">Overdue</th>
                  <th className="py-2 text-[11px] font-bold tracking-[0.08em] text-slate-500">Next session focus</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CLIENTS.map((client) => (
                  <tr key={client.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                    <td className="py-3 pr-3">
                      <Link href={`/coaches/mock-dashboard/${client.id}`} className="text-[13px] font-semibold text-slate-900 hover:text-orange-600">
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-3 text-[13px] text-slate-700">{client.roleTrack}</td>
                    <td className="py-3 pr-3 text-[12px] font-semibold text-slate-600">{client.status}</td>
                    <td className="py-3 pr-3 text-[13px] font-semibold text-slate-900">{client.momentum}</td>
                    <td className="py-3 pr-3 text-[13px] text-slate-700">{client.overdueActions}</td>
                    <td className="py-3 text-[13px] text-slate-700">{client.nextSessionObjective}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white">
          <h2 className="text-[23px] font-bold leading-tight">When this is live, coaching quality compounds.</h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-slate-200">
            You spend less time chasing status and more time making high-leverage calls with clients.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/partners#apply"
              className="inline-flex items-center justify-center rounded bg-orange-500 px-6 py-3 text-[14px] font-semibold text-slate-900 transition-colors hover:bg-orange-600"
            >
              Request the coach preview
            </Link>
            <Link
              href="/dashboard/coach"
              className="inline-flex items-center justify-center rounded border border-slate-600 px-6 py-3 text-[14px] font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
            >
              Open live coach dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
