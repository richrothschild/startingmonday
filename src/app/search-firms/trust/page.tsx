import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Search Firm Trust and Legal Summary | Starting Monday',
  description:
    'Public-facing trust, confidentiality, and legal-readiness summary for retained search firms evaluating a Starting Monday pilot.',
  alternates: {
    canonical: 'https://startingmonday.app/search-firms/trust',
  },
}

const trustPoints = [
  'Candidate visibility is role-scoped and revocable.',
  'Pilot reviews use explicit sharing boundaries before kickoff.',
  'Starting Monday is a decision-support layer, not an autonomous hiring decision system.',
]

const legalChecklist = [
  'Confirm confidentiality boundaries and role access assumptions.',
  'Confirm pilot contract path and data-processing requirements.',
  'Confirm retention, deletion, and review escalation path.',
]

export default function SearchFirmsTrustPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/search-firms" className="text-sm text-slate-500 hover:text-slate-900">
          {'<- Back to search firms'}
        </Link>

        <header className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Trust and legal</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Search-firm trust and legal summary</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This page gives retained-search buyers a fast first-pass view of confidentiality, access control, and pilot legal boundaries before a broader diligence cycle begins.
          </p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {trustPoints.map((point) => (
            <article key={point} className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm leading-relaxed text-slate-700">{point}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">What legal reviewers should confirm first</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {legalChecklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="font-bold text-orange-500">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-bold text-slate-900">Confidentiality model</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Candidate-controlled sharing is the default. Partner-side visibility is limited to approved pilot roles, and access should be auditable and revocable throughout the trial.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-bold text-slate-900">AI boundary</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Starting Monday supports human review and preparation. It is not intended to make autonomous hiring or candidate-selection decisions.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">Next step</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            If this matches your legal posture, continue to the procurement path to review pilot packaging, ownership, and kickoff sequencing.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/search-firms/procurement" className="rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Review procurement path
            </Link>
            <Link href="/partners?channel=search-firms#apply" className="rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500">
              Apply to partner program
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
