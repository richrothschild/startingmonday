import type { Metadata } from 'next'
import Link from 'next/link'
import SearchFirmSampleBriefExperience from '@/components/SearchFirmSampleBriefExperience'

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

const personaReadGuides = [
  {
    title: 'Partner lead lens',
    body: 'Look for whether this brief would shorten kickoff ambiguity and improve shortlist confidence without adding partner overhead.',
  },
  {
    title: 'Delivery lead lens',
    body: 'Look for whether the brief gives consultants a cleaner first-pass story and reduces mid-search resets.',
  },
  {
    title: 'Candidate-success lens',
    body: 'Look for whether the candidate would enter round one with clearer framing, stronger board context, and fewer avoidable gaps.',
  },
]

export default function SampleCfoBriefPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <Link href="/search-firms" className="text-sm text-slate-500 hover:text-slate-900">
            {'<- Back to search firms'}
          </Link>

          <header className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Sample brief</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">CFO Pre-Search Brief</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              This is a retained-search artifact: a board-ready CFO brief that helps a firm sharpen kickoff, candidate framing, and board prep before search starts.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              The page includes a complete example and an intake-to-brief preview flow for real client mandates.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Pilot fit</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Use this asset to evaluate one live mandate before committing to a broader workflow change.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Trust</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Candidate-sharing stays role-scoped and revocable throughout the pilot and review cycle.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Procurement</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Sprint 1 uses one mandate, named sponsor ownership, and a day-30 decision memo to keep buying reversible.</p>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">How to read this brief</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {personaReadGuides.map((guide) => (
                <article key={guide.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{guide.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{guide.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Jump to section</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <a href="#market-context" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Market context</a>
              <a href="#positioning-angles" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Positioning angles</a>
              <a href="#interview-filters" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Interview filters</a>
              <a href="#pilot-governance" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Pilot governance</a>
              <a href="#takeaway" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">One-page takeaway</a>
            </div>
          </section>

          <section className="mt-8 space-y-6">
            <article id="market-context" className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold">Section A: Market context</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {moves.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-bold text-orange-500">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article id="positioning-angles" className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold">Section B: Candidate positioning angles</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {positioning.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-bold text-orange-500">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article id="interview-filters" className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold">Section C: Interview filters and board questions</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {interviewFilters.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-bold text-orange-500">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article id="pilot-governance" className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold">Section D: Pilot governance and buying path</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Trust and legal</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Confirm confidentiality boundaries, role-scoped access, and decision-support limits before candidate activation.</p>
                  <Link href="/search-firms/trust" className="mt-3 inline-flex text-sm font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">
                    Review trust summary
                  </Link>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Procurement</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Use one mandate, one sponsor, and a short packet set to reduce quote-to-kickoff delay.</p>
                  <Link href="/search-firms/procurement" className="mt-3 inline-flex text-sm font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">
                    Review procurement path
                  </Link>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Day-30 decision</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Measure prep hours, first-slate quality, and reset frequency before deciding to expand, revise, or stop.</p>
                  <Link href="/partners?channel=search-firms#apply" className="mt-3 inline-flex text-sm font-semibold text-slate-900 underline underline-offset-2 hover:text-orange-600">
                    Start pilot review
                  </Link>
                </div>
              </div>
            </article>

            <article id="takeaway" className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold">Section E: One-page takeaway</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Mandate fit is strongest when the candidate has proven integration execution, sponsor communication strength, and scale-stage finance leadership. This context should be used at kickoff and in first-round screening.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Outcome: faster kickoff alignment, tighter shortlist quality, and clearer board interview criteria.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Outcome metric: cut kickoff-to-shortlist cycle time by 20 to 30 percent on retained mandates.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Trust and confidentiality: client mandate details stay confidential to your retained search workflow.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">CTA: get started now with a retained-search pilot.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/search-firms"
                  className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Back to landing page
                </Link>
                <Link
                  href="/partners?channel=search-firms#apply"
                  className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500"
                >
                  Run a pilot
                </Link>
                <Link
                  href="/search-firms/procurement"
                  className="rounded border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:border-emerald-500"
                >
                  Review procurement path
                </Link>
              </div>
            </article>
          </section>

          <SearchFirmSampleBriefExperience />
        </div>
      </main>
    </div>
  )
}
