import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday for Search Firms',
  description:
    'Pre-search briefs for retained search teams. Help consultants prepare faster, position candidates better, and close searches with less rework.',
  alternates: {
    canonical: 'https://startingmonday.app/search-firms',
  },
  openGraph: {
    title: 'Starting Monday for Search Firms',
    description:
      'Pre-search briefs for retained search teams. Faster prep, stronger positioning, better placement velocity.',
    url: 'https://startingmonday.app/search-firms',
  },
}

const lanes = [
  {
    title: 'Finance',
    body: 'CFO transitions, sponsor moves, and mandate positioning context before kickoff.',
  },
  {
    title: 'Operations',
    body: 'COO transition context, integration mandates, and org-shape signals.',
  },
  {
    title: 'Technology',
    body: 'CIO, CTO, and CISO market context with candidate positioning angles.',
  },
  {
    title: 'People and Revenue',
    body: 'CHRO and CRO context focused on mandate clarity and candidate story quality.',
  },
]

const outcomes = [
  'Consultant prep time drops from hours to focused review.',
  'Kickoff conversations start with role-specific context.',
  'Candidate positioning improves before first interview.',
  'Mandate-to-shortlist cycles tighten with fewer resets.',
]

export default function SearchFirmsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[11px] font-bold uppercase tracking-[0.16em]">
            Starting Monday
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-slate-600 hover:text-slate-900">
              See demo
            </Link>
            <Link
              href="/partners#apply"
              className="rounded bg-orange-500 px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-orange-600"
            >
              Partner with us
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="bg-slate-900 px-4 pb-14 pt-16 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-400">
              For retained search teams
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
              Cut mandate prep time. Improve search velocity.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Starting Monday delivers role-specific pre-search briefs that help your consultants walk into kickoff with market context, candidate positioning angles, and sharper interview filters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search-firms/sample-cfo-brief"
                className="rounded bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-orange-600"
              >
                See sample CFO brief
              </Link>
              <Link
                href="/partners#apply"
                className="rounded border border-slate-500 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-300"
              >
                Run a pilot
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-bold text-slate-900">What you get</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                We deliver a pre-search brief before kickoff. No new system to manage. No integration project required.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {outcomes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-bold text-orange-500">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">How it fits</h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-700">
                <li>1. You share the mandate and role lane.</li>
                <li>2. We deliver a role-specific brief in 24-48 hours.</li>
                <li>3. Your consultants use it for kickoff and candidate prep.</li>
                <li>4. You measure prep time and cycle velocity improvements.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-slate-900">Role lanes we support</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {lanes.map((lane) => (
                <div key={lane.title} className="rounded-lg border border-slate-200 p-5">
                  <h3 className="text-base font-semibold text-slate-900">{lane.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{lane.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Next step</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Run this on your next two searches</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Start with CFO or COO mandates. Measure prep time, kickoff quality, and mandate-to-shortlist speed.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/search-firms/sample-cfo-brief"
                className="rounded bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Review sample brief
              </Link>
              <Link
                href="/partners#apply"
                className="rounded border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500"
              >
                Apply to partner program
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
