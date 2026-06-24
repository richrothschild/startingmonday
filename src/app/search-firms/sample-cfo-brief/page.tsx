import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sample CFO Pre-Search Brief',
  description:
    'A sample role-specific CFO pre-search brief showing market context, positioning angles, and consultant interview filters.',
  alternates: {
    canonical: 'https://startingmonday.app/search-firms/sample-cfo-brief',
  },
  openGraph: {
    title: 'Sample CFO Pre-Search Brief',
    description:
      'See a board-ready CFO pre-search brief and intake flow before search kickoff.',
    url: 'https://startingmonday.app/search-firms/sample-cfo-brief',
  },
}

const moves = [
  'Recent CFO transitions in comparable mid-market SaaS companies',
  'Role trigger patterns: sponsor change, acquisition, or IPO prep',
  'Comparable search timelines and placement profiles',
]

const positioning = [
  'Lead with mandate reality: M&A integration plus international expansion',
  'Frame board dynamics clearly so candidates self-select early',
  'Anchor value in outcomes: cycle speed, quality of shortlist, and fit confidence',
]

const interviewFilters = [
  'Has this candidate led at least one full acquisition integration?',
  'Can they run active board and sponsor communication under pressure?',
  'Do they have practical international finance operations experience?',
]

const guardrails = [
  'One mandate, named sponsor, and day-30 decision memo.',
  'Role-scoped candidate visibility with revocation controls.',
  'Legal and procurement review before broader lane rollout.',
]

export default function SampleCfoBriefPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.22),_transparent_34%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.96)_54%,_rgba(10,15,28,0.98)_100%)]" />

      <div className="mx-auto max-w-5xl">
        <Link href="/search-firms" className="text-sm text-slate-400 transition-colors hover:text-white">
          {'<- Back to search firms'}
        </Link>

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(28,20,17,0.66),rgba(12,14,24,0.92))] p-6 shadow-[0_22px_80px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-200">Sample brief</p>
          <h1 className="mt-3 max-w-3xl font-serif text-[34px] leading-[1.08] text-white sm:text-[44px]">CFO pre-search brief</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-200">
            One retained-search sample to evaluate kickoff quality, candidate framing, and shortlist confidence without adding workflow noise.
          </p>
          <p className="mt-5 text-[12px] uppercase tracking-[0.14em] text-slate-400">One sample. One sponsor. One day-30 decision.</p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-[15px] font-semibold text-white">Market context</h2>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-slate-200">
              {moves.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-bold text-orange-300">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-[15px] font-semibold text-white">Positioning angles</h2>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-slate-200">
              {positioning.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-bold text-orange-300">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-[15px] font-semibold text-white">Interview filters</h2>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-slate-200">
              {interviewFilters.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-bold text-orange-300">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 shadow-[0_20px_70px_rgba(15,23,42,0.24)] backdrop-blur-sm sm:p-8">
          <h2 className="font-serif text-[28px] leading-[1.15] text-white sm:text-[34px]">Pilot guardrails</h2>
          <ul className="mt-5 space-y-3 text-[14px] leading-relaxed text-slate-200">
            {guardrails.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="font-bold text-orange-300">+</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-orange-200">Requirements links</h3>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search-firms/trust" className="rounded-full border border-white/18 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5">
              Review trust summary
            </Link>
            <Link href="/search-firms/procurement" className="rounded-full border border-white/18 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5">
              Review procurement path
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-amber-200/25 bg-[linear-gradient(160deg,rgba(28,20,17,0.66),rgba(12,14,24,0.92))] p-6 shadow-[0_22px_80px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8">
          <h2 className="font-serif text-[28px] leading-[1.15] text-white sm:text-[34px]">Use this sample to approve one live pilot.</h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate-200">
            If this brief quality clears your internal bar, move to a single-mandate pilot and keep expansion contingent on measured shortlist outcomes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/partners?channel=search-firms#apply" className="rounded-full bg-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-300">
              Start search-firm pilot
            </Link>
            <Link href="/search-firms" className="rounded-full border border-white/18 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5">
              Back to search-firms page
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
