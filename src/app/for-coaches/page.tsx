import type { Metadata } from 'next'
import Link from 'next/link'
import { CoachPreviewActions } from './coach-preview-actions'
import { EmiMarketingTelemetry } from '@/components/EmiMarketingTelemetry'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import {
  COACH_BUYER_PLANS,
  COACH_PROOF_STRIPS,
  ROLE_BOUNDARY,
} from './page-content'

export const metadata: Metadata = {
  title: 'Starting Monday for Executive Coaches | Coach Partner Preview',
  description: 'A coach-first landing page for executive coaches and coaching firms. See the preview, trust boundary, pilot structure, and economics in one place.',
  alternates: { canonical: 'https://startingmonday.app/for-coaches' },
  openGraph: {
    title: 'Starting Monday for Executive Coaches',
    description: 'Coach-first preview for executive coaches and coaching firms.',
    url: 'https://startingmonday.app/for-coaches',
  },
}

export default function ForCoachesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.18),_transparent_36%),linear-gradient(180deg,_rgba(9,14,26,0.96)_0%,_rgba(10,15,28,0.96)_100%)]" />
      <EmiMarketingTelemetry pageSlug="/for-coaches" personaSegment="coaches" />

      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/coaches/personas" className="text-[13px] text-slate-200 transition-colors hover:text-white">
              Coach personas
            </Link>
            <Link href="/for-coaches/trust-pack" className="text-[13px] text-slate-200 transition-colors hover:text-white">
              Trust pack
            </Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-white/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Coach Partner Preview</p>
          <h1 className="mb-5 max-w-3xl text-[30px] font-bold leading-[1.08] tracking-tight text-white sm:text-[42px]">
            Keep coaching sessions strategic.
          </h1>
          <p className="mb-2 max-w-3xl text-[16px] leading-relaxed text-slate-200">
            Starting Monday gives executive coaches and coaching firms one private operating layer for signals, prep briefs, and weekly follow-through so clients arrive prepared and you stay in strategy.
          </p>
          <p className="mb-6 max-w-2xl text-[13px] leading-relaxed text-slate-200">
            Coach-first by design. Clients control access, the platform keeps the rhythm visible, and your judgment stays in charge.
          </p>

          <div className="mb-7 space-y-3">
            <CoachPreviewActions />
            <div className="flex flex-wrap items-center gap-4 text-[13px]">
              <TrackLink
                href="/coaches/personas"
                event={EVENT_NAMES.personaRouteSelected}
                logToUserEvents
                properties={{ channel: 'coaches', persona: 'persona_hub', source_route: '/for-coaches', target_route: '/coaches/personas' }}
                className="text-slate-200 underline underline-offset-2 transition-colors hover:text-white"
              >
                Choose coach path
              </TrackLink>
              <TrackLink
                href="/for-coaches/trust-pack"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_trust_pack', source_page: '/for-coaches' }}
                className="text-orange-300 underline underline-offset-2 transition-colors hover:text-orange-200"
              >
                View trust pack
              </TrackLink>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {COACH_PROOF_STRIPS.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-3.5">
                <p className="mb-1 text-[20px] font-semibold text-slate-100">{item.value}</p>
                <p className="text-[11px] leading-relaxed text-slate-200">{item.label}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-200">
            Proof: clients show up better prepared, session time stays strategic, and between-session momentum is visible.
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
            Source: Jan-May 2026 pilot cohorts with documented denominator and timeframe notes.
          </p>
        </div>
      </header>

      <main className="bg-transparent text-slate-100">
        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">How this helps</p>
            <h2 className="mb-6 text-[24px] font-bold leading-snug text-white">One workflow for sessions, prep, and between-session follow-through.</h2>
            <div className="space-y-5">
              <div className="grid gap-1 md:grid-cols-[280px_1fr]">
                <p className="text-[15px] font-semibold text-white">Before each session</p>
                <p className="text-[14px] leading-relaxed text-slate-200">See signal movement and prep context before you meet, so the session starts with decisions, not recap.</p>
              </div>
              <div className="grid gap-1 md:grid-cols-[280px_1fr]">
                <p className="text-[15px] font-semibold text-white">Between sessions</p>
                <p className="text-[14px] leading-relaxed text-slate-200">Track commitments and risk markers in one place so client momentum does not disappear between calls.</p>
              </div>
              <div className="grid gap-1 md:grid-cols-[280px_1fr]">
                <p className="text-[15px] font-semibold text-white">At day 30</p>
                <p className="text-[14px] leading-relaxed text-slate-200">Use a pass/fail pilot scorecard with two to three live clients before deciding on full rollout.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Pricing clarity</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COACH_BUYER_PLANS.map((plan) => (
                <article key={plan.name} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="mb-1 text-[14px] font-semibold text-white">{plan.name}</p>
                  <p className="mb-3 text-[22px] font-bold text-orange-200">{plan.price}</p>
                  <p className="text-[13px] leading-relaxed text-slate-200">{plan.fit}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-slate-200">
              <span className="font-semibold text-white">Which plan fits me?</span>{' '}
              <span>1-3 active clients: Starter. 4-8 active clients: Studio. Multi-coach or 9+ active clients: Team.</span>
            </p>
            <p className="mt-2 text-[12px] text-slate-200">
              Start with a 30-day pass/fail pilot, then choose the plan that matches your active client load. Volume and partner terms are available for larger coaching teams.{' '}
              <TrackLink
                href="/for-coaches/economics"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_pricing_learn_more', source_page: '/for-coaches' }}
                className="font-semibold text-orange-200 underline underline-offset-2 transition-colors hover:text-orange-100"
              >
                Learn more
              </TrackLink>
            </p>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Trust and privacy</p>
            <h2 className="mb-4 text-[22px] font-bold leading-snug text-white">Starting Monday supports coaching. It does not replace it.</h2>
            <div className="mb-4 grid gap-8 md:grid-cols-2 md:divide-x md:divide-slate-200">
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-200">Platform handles</p>
                <ul className="space-y-2 text-[13px] leading-relaxed text-slate-200">
                  {ROLE_BOUNDARY.platform.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="md:pl-8">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-orange-200">Coach handles</p>
                <ul className="space-y-2 text-[13px] leading-relaxed text-slate-200">
                  {ROLE_BOUNDARY.coach.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-slate-200">Clients control access, can revoke it anytime, and the trust pack explains the permission model in one minute.</p>
            <div className="flex flex-wrap gap-3">
              <TrackLink
                href="/for-coaches/trust-pack"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_trust_pack', source_page: '/for-coaches' }}
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-3 text-[14px] font-semibold text-slate-100 transition-colors hover:border-orange-300/60 hover:bg-white/5"
              >
                Read the trust pack
              </TrackLink>
              <TrackLink
                href="/for-coaches/economics"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_economics', source_page: '/for-coaches' }}
                className="inline-flex items-center justify-center rounded-full border border-orange-300/70 px-5 py-3 text-[14px] font-semibold text-orange-100 transition-colors hover:bg-orange-400/10"
              >
                View pricing and economics
              </TrackLink>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 text-white shadow-[0_18px_70px_rgba(15,23,42,0.22)] backdrop-blur-sm sm:p-7">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Next step</p>
            <h2 className="mb-3 text-[22px] font-bold leading-snug">Request the preview, then decide from a live client workflow.</h2>
            <p className="mb-6 max-w-3xl text-[14px] leading-relaxed text-slate-200">See the workflow with two to three live clients for 30 days, then decide based on outcomes in your own practice.</p>
            <CoachPreviewActions />
            <div className="mt-5 flex flex-wrap gap-4 text-[13px]">
              <Link href="/for-coaches/faq" className="text-slate-200 underline underline-offset-2 transition-colors hover:text-white">
                Read the FAQ
              </Link>
              <Link href="/for-coaches/economics" className="text-slate-200 underline underline-offset-2 transition-colors hover:text-white">
                Open economics
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex flex-wrap gap-4 text-[12px] text-slate-200">
            <Link href="/coaches/personas" className="transition-colors hover:text-slate-200">Coach personas</Link>
            <Link href="/for-coaches/trust-pack" className="transition-colors hover:text-slate-200">Trust pack</Link>
            <Link href="/for-coaches/economics" className="transition-colors hover:text-slate-200">Economics</Link>
            <Link href="/for-coaches/faq" className="transition-colors hover:text-slate-200">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
