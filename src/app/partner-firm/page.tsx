import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Partner / Firm | Starting Monday',
  description: 'Choose your partner or firm path and preview signal, brief, and relationship momentum demos.',
}

const PARTNER_CHOICES = [
  {
    label: 'Coaches',
    href: '/for-coaches',
    description: 'Guide clients with tighter timing, narrative quality, and execution discipline.',
  },
  {
    label: 'Outplacement',
    href: '/for-outplacement',
    description: 'Improve transition outcomes with earlier signal windows and better shortlist positioning.',
  },
  {
    label: 'Search Firms',
    href: '/for-search-firms',
    description: 'Run cleaner shortlist calibration with role-signal context and structured briefs.',
  },
]

export default function PartnerFirmPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">Partner / Firm</p>
        <h1 className="mt-3 max-w-4xl font-serif text-[2.2rem] leading-[1.03] tracking-tight text-white sm:text-[3rem]">
          Choose your partner lane, then preview the demos.
        </h1>

        <section className="mt-8">
          <h2 className="text-[18px] font-semibold text-white">Choose your lane</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PARTNER_CHOICES.map((choice) => (
              <article key={choice.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-[16px] font-semibold text-white">{choice.label}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{choice.description}</p>
                <Link
                  href={choice.href}
                  className="mt-4 inline-flex items-center rounded-full border border-orange-300/70 px-4 py-2 text-[12px] font-semibold text-orange-100 hover:bg-orange-400/10 hover:text-white"
                >
                  Open {choice.label}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-white/10 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">Demo stack</p>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-[15px] font-semibold text-white">1. Demo signal</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                Trigger cluster example with timing confidence and likely mandate implications.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-[15px] font-semibold text-white">2. Brief demo</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                A role-specific brief with narrative angle, objection handling, and conversation prep.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-[15px] font-semibold text-white">3. Relationship momentum demo</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                Target company relationship map with key contacts, bios, and likely decision priorities.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}
