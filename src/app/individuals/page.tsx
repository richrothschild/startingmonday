import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Individuals | Starting Monday',
  description: 'Choose your individual path and preview signal, brief, and relationship momentum demos.',
}

const INDIVIDUAL_CHOICES = [
  {
    label: 'Executive Path',
    href: '/for-executives',
    description: 'C-suite and VP transitions with mandate-level timing and discretion.',
  },
  {
    label: 'Rising Leaders Path',
    href: '/for-vp-technology',
    description: 'Directors and senior managers moving into broader leadership scope.',
  },
]

const MOMENTUM_CONTACTS = [
  {
    name: 'Dana Kim',
    role: 'Chief of Staff to CEO',
    bio: 'Coordinates strategic hiring priorities and sequence for leadership interviews.',
    lookingFor: 'Operators who can de-risk first 90-day execution and board communication.',
  },
  {
    name: 'Marcus Hale',
    role: 'SVP Product & Platform',
    bio: 'Owns cross-functional execution and peer influence over role scope decisions.',
    lookingFor: 'Leaders who can align product velocity with enterprise reliability.',
  },
  {
    name: 'Priya Natarajan',
    role: 'Partner, Search Firm',
    bio: 'Runs shortlist calibration with CEO and compensation committee stakeholders.',
    lookingFor: 'Clear mandate narrative, concise risk framing, and role-fit proof points.',
  },
]

export default function IndividualsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">Individuals</p>
        <h1 className="mt-3 max-w-4xl font-serif text-[2.2rem] leading-[1.03] tracking-tight text-white sm:text-[3rem]">
          Pick your path, then preview the exact signal experience.
        </h1>

        <section className="mt-8">
          <h2 className="text-[18px] font-semibold text-white">Choose your lane</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INDIVIDUAL_CHOICES.map((choice) => (
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">Signal demos</p>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-[15px] font-semibold text-white">1. Demo signal</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                Target company: Northstar Health Systems. Trigger: CFO departure + digital transformation budget expansion.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-[15px] font-semibold text-white">2. Brief demo</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                Suggested opening narrative, likely objections, and two board-level questions tied to this mandate window.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-[15px] font-semibold text-white">3. Relationship momentum demo</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                Target company: Northstar Health Systems. Priority relationships and what each stakeholder is likely optimizing for.
              </p>
              <div className="mt-3 space-y-3">
                {MOMENTUM_CONTACTS.map((person) => (
                  <div key={person.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[12px] font-semibold text-white">{person.name} · {person.role}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-300">{person.bio}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-orange-100/90">Looking for: {person.lookingFor}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}
