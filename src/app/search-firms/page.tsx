import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackLink } from '@/components/TrackLink'
import { SiteFooter } from '@/components/SiteFooter'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

export const metadata: Metadata = {
  title: 'Starting Monday for Search Firms',
  description:
    'Pre-search briefs for retained search firms. Win mandates with sharper kickoff quality, reduce team rework, and improve shortlist velocity.',
  alternates: {
    canonical: 'https://startingmonday.app/search-firms',
  },
  openGraph: {
    title: 'Starting Monday for Search Firms',
    description:
      'Built for retained search firms: better kickoff quality, stronger shortlists, and faster mandate cycles.',
    url: 'https://startingmonday.app/search-firms',
  },
}

const comparisonRows = [
  {
    title: 'Kickoff and shortlist quality',
    withoutLayer: 'Partner and consultant teams rebuild context from scratch, narrative gaps surface too late, and shortlist confidence drops before round one.',
    withLayer: 'Role-specific brief context is visible before kickoff, so the first conversation starts at decision level and shortlist quality is easier to defend.',
  },
  {
    title: 'Preparation and reset risk',
    withoutLayer: 'Candidates arrive with uneven company knowledge, board-level framing drifts, and mid-search correction consumes partner time.',
    withLayer: 'Preparation is structured, mandate-specific, and reviewed through one clearer narrative, one scorecard, and one decision path before expanding effort.',
  },
]

const lanes = [
  {
    title: 'Finance and operations',
    body: 'CFO and COO transitions where sponsor pressure, integration work, and mandate clarity shape shortlist confidence early.',
  },
  {
    title: 'Technology, people, and revenue',
    body: 'CIO, CTO, CISO, CHRO, and CRO searches where narrative quality and board-level framing need to be sharper before round one.',
  },
]

const pilotReadinessPoints = [
  'Candidate sharing stays role-scoped and revocable before kickoff begins.',
  'One mandate, one sponsor, and one day-30 scorecard keep the pilot bounded.',
  'Legal and procurement review happen before broader rollout, not mid-search.',
]

export default function SearchFirmsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_32%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.96)_54%,_rgba(10,15,28,0.98)_100%)]" />

      <nav className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] text-white transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-slate-300 transition-colors hover:text-white">
              See demo
            </Link>
            <Link
              href="/partners?channel=search-firms#apply"
              className="rounded bg-orange-500 px-4 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400"
            >
              Partner with us
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="px-4 pb-14 pt-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">
              For retained search firms
            </p>
            <h1 className="max-w-4xl font-serif text-[38px] leading-[1.04] tracking-tight text-white sm:text-[54px]">
              Raise candidate quality before round one.
            </h1>
            <p className="mt-6 max-w-3xl text-[19px] leading-relaxed text-slate-200/92 sm:text-[20px]">
              Starting Monday gives retained-search teams a cleaner briefing layer for kickoff, candidate framing, and shortlist confidence before partner time starts leaking.
            </p>
            <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-slate-400">
              Weak first-touch narrative quality leaks partner time into recap, repair, and reset work. Start with one mandate and decide from observed quality.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="https://app-na2.hubspot.com/meetings/246442927"
                className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400"
              >
                Book a meeting
              </a>
              <TrackLink
                href="/search-firms/sample-cfo-brief"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Review sample CFO brief', source_page: '/search-firms' }}
                className="rounded-full border border-white/18 px-6 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Review sample CFO brief
              </TrackLink>
              <TrackLink
                href="/partners?channel=search-firms#apply"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Start search-firm pilot', source_page: '/search-firms' }}
                className="text-sm font-semibold text-slate-200 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-orange-300"
              >
                Start search-firm pilot
              </TrackLink>
            </div>

            <p className="mt-6 text-[12px] tracking-[0.14em] text-slate-400">
              One mandate. Named sponsor. Day-30 decision memo.
            </p>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 shadow-[0_20px_70px_rgba(15,23,42,0.24)] backdrop-blur-sm sm:p-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">Without the extra noise</p>
            <h2 className="max-w-3xl font-serif text-[30px] leading-[1.15] text-white sm:text-[36px]">
              A cleaner retained-search operating layer.
            </h2>
            <div className="mt-6 space-y-4">
              {comparisonRows.map((row) => (
                <article key={row.title} className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-orange-200">{row.title}</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Without an operating layer</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-slate-300">{row.withoutLayer}</p>
                    </div>
                    <div className="rounded-xl border border-orange-200/20 bg-orange-200/8 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-100">With Starting Monday</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-slate-100">{row.withLayer}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[linear-gradient(155deg,rgba(26,22,20,0.82),rgba(10,14,24,0.9))] p-6 shadow-[0_22px_80px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:p-8">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">Where it fits</p>
              <h2 className="font-serif text-[30px] leading-[1.15] text-white sm:text-[36px]">Role lanes we support</h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-200">
                Keep the surface narrow: start where mandate quality matters most, then expand only if the pilot produces better shortlist confidence and lower reset risk.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {lanes.map((lane) => (
                <article key={lane.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                  <h3 className="text-[17px] font-semibold text-white">{lane.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-200">{lane.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 shadow-[0_18px_56px_rgba(15,23,42,0.22)] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">Pilot readiness</p>
            <h2 className="mt-3 font-serif text-[26px] leading-[1.2] text-white sm:text-[32px]">Trust, scope, and buying path in one view.</h2>
            <ul className="mt-5 space-y-3 text-[14px] leading-relaxed text-slate-200">
              {pilotReadinessPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="font-bold text-orange-300">+</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/search-firms/trust"
                className="rounded-full bg-orange-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-300"
              >
                Review trust summary
              </Link>
              <Link
                href="/search-firms/procurement"
                className="rounded-full border border-white/18 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Review procurement path
              </Link>
              <Link
                href="/search-firms/trial-charter"
                className="rounded-full border border-white/18 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Review pilot charter
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-amber-200/25 bg-[linear-gradient(160deg,rgba(28,20,17,0.66),rgba(12,14,24,0.92))] p-6 text-white shadow-[0_22px_80px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">Private invitation</p>
            <h2 className="font-serif text-[30px] leading-[1.15] text-white sm:text-[36px]">
              Start with one retained-search mandate.
            </h2>
            <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-slate-200">
              This should feel like a serious professional decision, not software tourism. Review one sample brief, name one sponsor, and expand only if the mandate economics and shortlist quality improve.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://app-na2.hubspot.com/meetings/246442927"
                className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400"
              >
                Book a meeting
              </a>
              <TrackLink
                href="/search-firms/sample-cfo-brief"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Review sample brief', source_page: '/search-firms' }}
                className="rounded-full border border-white/18 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Review sample brief
              </TrackLink>
              <TrackLink
                href="/partners?channel=search-firms#apply"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Apply to partner program', source_page: '/search-firms' }}
                className="rounded-full border border-white/18 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Start search-firm pilot
              </TrackLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
