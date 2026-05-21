import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Outplacement Trust and Governance Pack | Starting Monday',
  description: 'Trust, security, data governance, and procurement readiness overview for outplacement and transition partners.',
  alternates: { canonical: 'https://startingmonday.app/for-outplacement/trust-pack' },
}

const TRUST_PILLARS = [
  {
    title: 'Data ownership and control',
    detail: 'Partner programs and participants retain control of their data access model. Permissions can be scoped and adjusted based on program policy.',
  },
  {
    title: 'Permission-based visibility',
    detail: 'Counselor and program visibility follows the permission model. The goal is support and intervention clarity, not unrestricted access.',
  },
  {
    title: 'Audit visibility',
    detail: 'Program workflows are designed to support transparent activity records for pilot governance and internal review.',
  },
  {
    title: 'Security posture',
    detail: 'Data transport and storage protections, role-scoped access patterns, and partner due-diligence support are part of the review process.',
  },
]

const PROCUREMENT_CHECKLIST = [
  'Data ownership and usage terms',
  'Participant permission model',
  'Access logging and review process',
  'Retention and deletion handling',
  'Pilot legal scope and expansion decision gate',
  'Security and incident response review path',
]

const REVIEW_TIMELINE = [
  {
    phase: 'Day 0-2',
    detail: 'Initial fit call, partner scope definition, and trust pack handoff.',
  },
  {
    phase: 'Day 3-7',
    detail: 'Security and legal review track starts in parallel with pilot planning.',
  },
  {
    phase: 'Day 8-10',
    detail: 'Pilot kickoff with scorecard baseline and implementation cadence confirmed.',
  },
  {
    phase: 'Day 30',
    detail: 'Pass/fail readout and expansion decision with governance notes.',
  },
]

export default function OutplacementTrustPackPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/for-outplacement" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Back to outplacement page
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <header className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Trust and governance
          </p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
            Procurement-ready trust pack for partner teams.
          </h1>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-2xl">
            This page summarizes the trust conversation most outplacement, legal, and procurement teams need before approving pilot launch.
          </p>
        </header>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Trust pillars
          </p>
          <div className="space-y-3">
            {TRUST_PILLARS.map((item) => (
              <div key={item.title} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{item.title}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Procurement and legal checklist
          </p>
          <ul className="space-y-2">
            {PROCUREMENT_CHECKLIST.map((item) => (
              <li key={item} className="text-[14px] text-slate-700 leading-relaxed">+ {item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
            Pilot review timeline
          </p>
          <div className="space-y-3">
            {REVIEW_TIMELINE.map((row) => (
              <div key={row.phase} className="border border-slate-200 rounded-lg p-4 bg-white">
                <p className="text-[13px] font-semibold text-slate-900 mb-1">{row.phase}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{row.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-slate-200 rounded-2xl p-6 bg-white">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
            Next step
          </p>
          <p className="text-[14px] text-slate-600 leading-relaxed mb-5">
            If this trust model fits your standards, move to pilot planning and set explicit pass/fail criteria before kickoff.
          </p>
          <div className="flex flex-wrap gap-4 text-[13px]">
            <Link href="/partners#apply" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Apply to partner program
            </Link>
            <Link href="/for-outplacement/economics" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              View outplacement economics
            </Link>
            <Link href="/for-outplacement/faq" className="text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors">
              Read outplacement FAQ
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
