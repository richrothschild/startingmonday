import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Search Firm Procurement Path | Starting Monday',
  description:
    'Public-facing procurement and pilot path summary for retained search firms evaluating a Starting Monday rollout.',
  alternates: {
    canonical: 'https://startingmonday.app/search-firms/procurement',
  },
}

const packages = [
  {
    title: 'Pilot',
    body: 'One mandate, 30 days, one sponsor, and a day-30 decision memo.',
  },
  {
    title: 'Lane rollout',
    body: 'Ninety-day deployment across one role lane with weekly operating review.',
  },
  {
    title: 'Expansion',
    body: 'Multi-lane rollout with practice-level governance and quarterly review.',
  },
]

const buyingSteps = [
  'Choose package scope and name a sponsor.',
  'Confirm legal packet path and procurement reviewer.',
  'Approve pilot charter and baseline scorecard before kickoff.',
  'Run day-30 go, revise, or stop decision review.',
]

export default function SearchFirmsProcurementPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/search-firms" className="text-sm text-slate-500 hover:text-slate-900">
          {'<- Back to search firms'}
        </Link>

        <header className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Procurement path</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">How the pilot buying path works</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This page is the public-facing version of the Sprint 1 procurement flow: clear package scope, named ownership, and a reversible pilot before broader rollout.
          </p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => (
            <article key={pkg.title} className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-900">{pkg.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{pkg.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">Buying sequence</h2>
          <ol className="mt-4 space-y-2 text-sm text-slate-700">
            {buyingSteps.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-bold text-slate-900">What management owns</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Sponsor assignment, weekly operating cadence, and the day-30 decision standard should be locked before kickoff.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-bold text-slate-900">What procurement checks</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Package scope, billing path, legal dependencies, and the implementation effort required by each buyer-side role.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">Next step</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Use the trust summary first if legal review needs to happen before commercial review. Otherwise move directly to the partner application and pilot-scope conversation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/search-firms/trust" className="rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500">
              Review trust summary
            </Link>
            <Link href="/partners?channel=search-firms#apply" className="rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Apply to partner program
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
