import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackLink } from '@/components/TrackLink'
import { SiteFooter } from '@/components/SiteFooter'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { ProspectingScannerPanel } from './ProspectingScannerPanel'

export const metadata: Metadata = {
  title: 'Starting Monday for Search Firms',
  description:
    'Starting Monday gives retained search firms one clear brief before round one: mandate context, candidate narrative, interview focus, and risk flags.',
  alternates: {
    canonical: 'https://startingmonday.app/search-firms',
  },
  openGraph: {
    title: 'Starting Monday for Search Firms',
    description:
      'One clear brief before round one. Better shortlist confidence with less partner rework.',
    url: 'https://startingmonday.app/search-firms',
  },
}

const summaryPoints = [
  'Client kickoff turns into a decision brief in hours, so mandate scope stops drifting.',
  'Candidate narrative is calibrated to sponsor priorities before first client interview.',
  'Interview panel focus is pre-structured, reducing contradictory feedback and false negatives.',
  'Risk and readiness signals surface early enough to reset before credibility is lost.',
]

const roleLanes = [
  {
    title: '1) Align the client before outreach starts',
    body: 'Capture sponsor outcomes, non-negotiables, and likely objections in one source so recruiters are not translating shifting expectations across calls and decks.',
  },
  {
    title: '2) Coach the candidate narrative to the mandate',
    body: 'Turn resume facts into a client-ready thesis with proof points, pressure-test prompts, and role-specific risk flags before round one.',
  },
  {
    title: '3) Keep client feedback decision-grade',
    body: 'Anchor panel interviews to agreed criteria so feedback stays comparable and shortlist decisions do not collapse into politics or recency bias.',
  },
]

const whyItWorks = [
  'When clients change the spec mid-search, mandate history is explicit and recoverable.',
  'When interview feedback conflicts, candidate evaluation stays anchored to agreed outcomes.',
  'When offers stall late, motivation and risk signals are already documented and actionable.',
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
              href="/search-firms/executive-recruiter-demo"
              className="rounded bg-orange-500 px-4 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400"
            >
              Recruiter outcomes
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
              Your client reaches shortlist confidence before round one.
            </h1>
            <p className="mt-6 max-w-3xl text-[19px] leading-relaxed text-slate-200/92 sm:text-[20px]">
              Starting Monday gives recruiters one working brief across the full mandate: client context, candidate thesis, interview focus, and risk flags in one place. Fewer late resets with candidates. Fewer avoidable surprises with executive clients.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/search-firms/sample-cfo-brief"
                className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400"
              >
                View sample CFO brief
              </Link>
            </div>

            <p className="mt-6 text-[12px] tracking-[0.14em] text-slate-400">
              One mandate. One narrative spine. One decision path.
            </p>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_18px_56px_rgba(15,23,42,0.22)] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">Executive summary</p>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-200">
              {summaryPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="font-bold text-orange-300">+</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[linear-gradient(155deg,rgba(26,22,20,0.82),rgba(10,14,24,0.9))] p-6 shadow-[0_22px_80px_rgba(15,23,42,0.3)] backdrop-blur-sm sm:p-8">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">Recruiter workflow</p>
              <h2 className="font-serif text-[30px] leading-[1.15] text-white sm:text-[36px]">How recruiters run a mandate from intake to shortlist.</h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-200">
                This mirrors the real sequence search partners follow: align the client, coach the candidate, then manage interview signal quality before executive decisions are made.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roleLanes.map((lane) => (
                <article key={lane.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                  <h3 className="text-[17px] font-semibold text-white">{lane.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-200">{lane.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ProspectingScannerPanel />

        <section className="px-4 pb-14 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 shadow-[0_18px_56px_rgba(15,23,42,0.22)] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">Executive-client pain points</p>
            <h2 className="mt-3 font-serif text-[26px] leading-[1.2] text-white sm:text-[32px]">What breaks most retained searches and how this prevents it.</h2>
            <ul className="mt-5 space-y-3 text-[14px] leading-relaxed text-slate-200">
              {whyItWorks.map((point) => (
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
                Review trust controls
              </Link>
              <Link
                href="/search-firms/procurement"
                className="rounded-full border border-white/18 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Review procurement readiness
              </Link>
              <TrackLink
                href="/search-firms/sample-cfo-brief"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'search_firms', cta_label: 'Review full brief structure', source_page: '/search-firms' }}
                className="rounded-full border border-white/18 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Review full brief structure
              </TrackLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
