import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { findMockClient, MOCK_CLIENTS } from '../mock-data'

type ClientPageProps = {
  params: Promise<{ clientId: string }>
}

export async function generateStaticParams() {
  return MOCK_CLIENTS.map((client) => ({ clientId: client.id }))
}

export async function generateMetadata({ params }: ClientPageProps): Promise<Metadata> {
  const { clientId } = await params
  const client = findMockClient(clientId)
  if (!client) {
    return {
      title: 'Client Dashboard | Starting Monday',
    }
  }

  return {
    title: `${client.name} | Mock Coach Client Dashboard`,
    description: `Coach view for ${client.name}: momentum, risks, commitments, and session plan in one page.`,
    alternates: {
      canonical: `https://startingmonday.app/coaches/mock-dashboard/${client.id}`,
    },
  }
}

export default async function MockCoachClientDashboardPage({ params }: ClientPageProps) {
  const { clientId } = await params
  const client = findMockClient(clientId)

  if (!client) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/coaches/mock-dashboard" className="text-[13px] text-slate-300 transition-colors hover:text-white">
            Back to portfolio dashboard
          </Link>
        </div>
      </nav>

      <header className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Client dashboard (coach view)</p>
          <h1 className="mt-2 text-[30px] font-bold leading-tight text-slate-900 sm:text-[36px]">{client.name} · {client.roleTrack}</h1>
          <p className="mt-3 max-w-4xl text-[15px] leading-relaxed text-slate-600">{client.coachNarrative}</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <article className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Status</p>
            <p className="mt-2 text-[14px] font-semibold text-slate-900">{client.status}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Momentum</p>
            <p className="mt-2 text-[28px] font-bold leading-none text-slate-900">{client.momentum}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Overdue actions</p>
            <p className="mt-2 text-[28px] font-bold leading-none text-slate-900">{client.overdueActions}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Last session</p>
            <p className="mt-2 text-[14px] font-semibold text-slate-900">{client.lastSessionDate}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Next session</p>
            <p className="mt-2 text-[14px] font-semibold text-slate-900">{client.nextSessionDate}</p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Next-session objective</p>
            <p className="text-[14px] leading-relaxed text-slate-700">{client.nextSessionObjective}</p>

            <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Risk signals</p>
            <ul className="space-y-2 text-[14px] leading-relaxed text-slate-700">
              {client.riskSignals.map((signal) => (
                <li key={signal} className="flex items-start gap-2">
                  <span className="mt-0.5 text-orange-500">•</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>

            <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Coach intervention plan</p>
            <ul className="space-y-2 text-[14px] leading-relaxed text-slate-700">
              {client.interventionPlan.map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-0.5 text-orange-500">→</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">This-week commitments</p>
            <div className="space-y-3">
              {client.thisWeekCommitments.map((commitment) => (
                <div key={`${commitment.task}-${commitment.owner}`} className="rounded border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[13px] font-semibold text-slate-900">{commitment.task}</p>
                  <p className="mt-1 text-[12px] text-slate-600">Owner: {commitment.owner} · Due: {commitment.due}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{commitment.status}</p>
                </div>
              ))}
            </div>

            <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Session agenda</p>
            <ul className="space-y-2 text-[14px] leading-relaxed text-slate-700">
              {client.sessionAgenda.map((agendaItem) => (
                <li key={agendaItem} className="flex items-start gap-2">
                  <span className="mt-0.5 text-slate-500">1.</span>
                  <span>{agendaItem}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Recent signal activity</p>
          <div className="space-y-3">
            {client.recentSignals.map((signal) => (
              <div key={`${signal.label}-${signal.at}`} className="border-l-2 border-orange-400 pl-4">
                <p className="text-[13px] font-semibold text-slate-900">{signal.label}</p>
                <p className="text-[13px] leading-relaxed text-slate-700">{signal.detail}</p>
                <p className="mt-1 text-[11px] text-slate-500">{signal.at}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800">Trust and next action</p>
          <p className="text-[13px] leading-relaxed text-slate-700">
            This coach workspace is confidential and intended for private session preparation only. Teams using this workflow report clearer weekly decisions and faster follow-through on overdue commitments.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/coaches/mock-dashboard"
              className="inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Open coach portfolio dashboard
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-800 transition-colors hover:border-slate-500"
            >
              Start coach workflow setup
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
