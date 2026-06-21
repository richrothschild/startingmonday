import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingPage } from '@/components/LandingPage'
import type { FAQ, SituationCard } from '@/components/LandingPage'

export const metadata: Metadata = {
  title: 'Individuals | Starting Monday',
  description: 'Choose your individual path and preview signal, brief, and relationship momentum demos in a disciplined, editorial flow.',
}

const SITUATIONS: SituationCard[] = [
  {
    id: 'executive-track',
    headline: 'I am pursuing an executive seat.',
    sub: 'I need earlier timing and stronger narrative control.',
  },
  {
    id: 'rising-track',
    headline: 'I am moving into broader technology scope.',
    sub: 'I need a disciplined plan for the next-level mandate.',
  },
  {
    id: 'timing-risk',
    headline: 'I am reacting too late to opportunities.',
    sub: 'I want to enter before the shortlist is crowded.',
  },
  {
    id: 'consistency',
    headline: 'My execution is inconsistent week to week.',
    sub: 'I want one clear system I can run every week.',
  },
]

const FAQS: FAQ[] = [
  {
    question: 'Why choose a lane first?',
    answer: 'Lane choice shapes your messaging, target set, and demo flow. It gives you a cleaner signal model before you invest time in outreach.',
  },
  {
    question: 'Can I switch lanes later?',
    answer: 'Yes. You can start in one lane, validate fit, and move to another while keeping your core operating cadence intact.',
  },
  {
    question: 'What happens after lane selection?',
    answer: 'You see a signal demo, a brief demo, and a relationship momentum preview tied to the lane you selected.',
  },
]

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
    <>
      <LandingPage
        hero={{
          eyebrow: 'Individuals lane selection',
          h1Lines: ['Choose your path,', 'then run a clear plan.'],
          body: 'Pick the lane that matches your transition. Then run a clean weekly system for signals, briefs, and outreach momentum.',
          steps: [
            'Choose executive or rising-leader lane based on your next mandate.',
            'Preview signal and brief examples before committing to outreach.',
            'Run a weekly plan with clearer priorities and tighter timing.',
          ],
          trialNote: 'Free for 30 days. No credit card. No employer visibility.',
        }}
        situations={SITUATIONS}
        faqs={FAQS}
        sourcePage="/individuals"
      />

      <div className="bg-slate-950 pb-12 sm:pb-14">
        <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
          <div className="rounded-[1.5rem] border border-white/12 bg-gradient-to-b from-slate-900/70 to-slate-950/80 p-5 shadow-[0_32px_88px_rgba(2,6,23,0.35)] sm:p-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Choose your lane</p>
            <h2 className="mb-2 text-[22px] font-bold leading-snug text-white">Start with the path that matches your moment.</h2>
            <p className="mb-5 text-[14px] leading-relaxed text-slate-200/90">
              Each lane keeps the home-page visual system while tailoring execution to your transition.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {INDIVIDUAL_CHOICES.map((choice) => (
                <article key={choice.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_56px_rgba(15,23,42,0.2)]">
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
          </div>
        </section>

        <section className="mx-auto max-w-5xl border-t border-white/10 px-4 pt-8 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">Demo stack</p>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-900/45 p-4 shadow-[0_18px_56px_rgba(15,23,42,0.2)]">
              <p className="text-[15px] font-semibold text-white">1. Signal demo</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                See a real trigger pattern and timing confidence before investing time in low-probability targets.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-900/45 p-4 shadow-[0_18px_56px_rgba(15,23,42,0.2)]">
              <p className="text-[15px] font-semibold text-white">2. Brief demo</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                Review a concise narrative angle, likely objections, and first-conversation framing before outreach.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-900/45 p-4 shadow-[0_18px_56px_rgba(15,23,42,0.2)]">
              <p className="text-[15px] font-semibold text-white">3. Relationship momentum demo</p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                Map decision stakeholders, prioritize outreach order, and keep weekly momentum visible.
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
      </div>
    </>
  )
}
