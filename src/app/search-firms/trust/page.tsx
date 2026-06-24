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
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.22),_transparent_34%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.96)_54%,_rgba(10,15,28,0.98)_100%)]" />
      <div className="mx-auto max-w-5xl">
        <Link href="/search-firms" className="text-sm text-slate-400 transition-colors hover:text-white">
          {'<- Back to search firms'}
        </Link>

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(28,20,17,0.66),rgba(12,14,24,0.92))] p-6 shadow-[0_22px_80px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-200">Trust and legal</p>
          <h1 className="mt-3 max-w-3xl font-serif text-[34px] leading-[1.08] text-white sm:text-[44px]">Search-firm trust and legal summary</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-200">
            This page should answer one question quickly: can a retained-search team review a pilot without creating confidentiality drift or legal ambiguity.
          </p>
        </header>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 shadow-[0_20px_70px_rgba(15,23,42,0.24)] backdrop-blur-sm sm:p-8">
          <h2 className="font-serif text-[24px] leading-[1.15] text-white">Trust position in three lines</h2>
          <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-slate-200">
            {trustPoints.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="font-bold text-orange-300">+</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">First legal pass</p>
          <h2 className="mt-3 font-serif text-[28px] leading-[1.15] text-white sm:text-[34px]">What legal reviewers should confirm first</h2>
          <h3 className="mt-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-orange-100">Legal checklist</h3>
          <ul className="mt-5 space-y-3 text-[14px] text-slate-200">
            {legalChecklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="font-bold text-orange-300">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_56px_rgba(15,23,42,0.22)]">
          <h2 className="font-serif text-[24px] leading-[1.15] text-white">Confidentiality and AI boundary</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-200">
            Candidate-controlled sharing is the default. Partner-side visibility is role-limited, auditable, and revocable. Starting Monday supports human review and preparation, not autonomous hiring decisions.
          </p>
        </section>

        <section className="mt-6 rounded-[2rem] border border-amber-200/25 bg-[linear-gradient(160deg,rgba(28,20,17,0.66),rgba(12,14,24,0.92))] p-6 shadow-[0_22px_80px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">Next step</p>
          <h2 className="mt-3 font-serif text-[28px] leading-[1.15] text-white sm:text-[34px]">Move to the procurement path only if this matches your legal posture.</h2>
          <h3 className="mt-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-orange-100">Decision boundary</h3>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate-200">
            Keep the decision bounded: if trust, access control, and pilot legal structure are acceptable, continue to procurement. If not, stop here without adding more workflow noise.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search-firms/procurement" className="rounded-full bg-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-300">
              Review procurement path
            </Link>
            <Link href="/partners?channel=search-firms#apply" className="rounded-full border border-white/18 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5">
              Apply to partner program
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
