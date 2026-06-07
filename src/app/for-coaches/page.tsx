import type { Metadata } from 'next'
import Link from 'next/link'
import { CoachPreviewActions } from './coach-preview-actions'
import { ChannelMicroProductRail } from '@/components/micro-products/ChannelMicroProductRail'
import { EmiMarketingTelemetry } from '@/components/EmiMarketingTelemetry'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { COACH_PERSONAS } from '@/lib/persona-routes'
import {
  COACH_BUYER_PLANS,
  COACH_RYTHM,
  COACH_SCOREBOARD,
  COACH_PROOF_STRIPS,
  COUNCIL_BUY_SIGNALS,
  PILOT_SCORECARD,
  PREVIEW_SENTENCE,
  ROLE_BOUNDARY,
  WHAT_CHANGES,
  WEEKLY_REVIEW_TEMPLATE,
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
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <EmiMarketingTelemetry pageSlug="/for-coaches" personaSegment="coaches" />

      <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/coaches/personas" className="text-[13px] text-slate-400 transition-colors hover:text-white">
              Coach personas
            </Link>
            <Link href="/for-coaches/trust-pack" className="text-[13px] text-slate-400 transition-colors hover:text-white">
              Trust pack
            </Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-slate-800 bg-slate-900 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">Coach Partner Preview</p>
          <h1 className="mb-5 max-w-3xl text-[30px] font-bold leading-[1.08] tracking-tight text-white sm:text-[42px]">
            Keep coaching sessions strategic.
          </h1>
          <p className="mb-2 max-w-3xl text-[16px] leading-relaxed text-slate-300">
            Starting Monday gives executive coaches and coaching firms one private operating layer for signals, prep briefs, and weekly follow-through so clients arrive prepared and you stay in strategy.
          </p>
          <p className="mb-6 max-w-2xl text-[13px] leading-relaxed text-slate-400">
            Coach-first by design. Clients control access, the platform keeps the rhythm visible, and your judgment stays in charge.
          </p>

          <div className="mb-7 flex flex-col gap-3 sm:flex-row">
            <CoachPreviewActions />
            <TrackLink
              href="/coaches/personas"
              event={EVENT_NAMES.personaRouteSelected}
              logToUserEvents
              properties={{ channel: 'coaches', persona: 'persona_hub', source_route: '/for-coaches', target_route: '/coaches/personas' }}
              className="inline-flex items-center justify-center rounded border border-slate-600 px-5 py-3 text-[14px] font-semibold text-slate-100 transition-colors hover:border-slate-300"
            >
              Choose coach path
            </TrackLink>
            <TrackLink
              href="/for-coaches/trust-pack"
              event={EVENT_NAMES.channelEntryClicked}
              logToUserEvents
              properties={{ channel: 'coaches', cta_label: 'coach_trust_pack', source_page: '/for-coaches' }}
              className="inline-flex items-center justify-center rounded border border-orange-400 px-5 py-3 text-[14px] font-semibold text-orange-300 transition-colors hover:bg-orange-500/10"
            >
              View trust pack
            </TrackLink>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {COACH_PROOF_STRIPS.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="mb-1 text-[24px] font-bold text-white">{item.value}</p>
                <p className="text-[12px] leading-relaxed text-slate-300">{item.label}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-emerald-200">
            Proof: clients show up better prepared, session time stays strategic, and between-session momentum is visible.
          </p>
        </div>
      </header>

      <main className="bg-slate-50 text-slate-900">
        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">At a glance</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COACH_SCOREBOARD.map((item) => (
                <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-[12px] font-semibold text-slate-500">{item.label}</p>
                  <p className="mb-2 text-[26px] font-bold text-slate-900">{item.target}</p>
                  <p className="text-[13px] leading-relaxed text-slate-600">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
            {COUNCIL_BUY_SIGNALS.map((block) => (
              <article key={block.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">{block.title}</p>
                <ul className="space-y-2 text-[13px] leading-relaxed text-slate-700">
                  {block.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white sm:p-8">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-300">What changes in week one</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {WHAT_CHANGES.map((item, index) => (
                <article key={`${item.before}-${index}`} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                  <p className="mb-2 text-[12px] font-semibold text-slate-400">Before</p>
                  <p className="mb-4 text-[14px] leading-relaxed text-slate-200">{item.before}</p>
                  <p className="mb-2 text-[12px] font-semibold text-emerald-300">After</p>
                  <p className="text-[14px] leading-relaxed text-slate-100">{item.after}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Who this is for</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COACH_PERSONAS.map((persona) => (
                <TrackLink
                  key={persona.slug}
                  href={persona.destination}
                  event={EVENT_NAMES.personaRouteSelected}
                  logToUserEvents
                  properties={{ channel: 'coaches', persona: persona.slug, source_route: '/for-coaches', target_route: persona.destination }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-orange-400"
                >
                  <p className="mb-2 text-[13px] font-semibold text-slate-900">{persona.label}</p>
                  <p className="text-[13px] leading-relaxed text-slate-600">{persona.summary}</p>
                </TrackLink>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">30-day pilot</p>
              <h2 className="mb-4 text-[22px] font-bold leading-snug text-slate-900">Run a small preview before you commit.</h2>
              <p className="mb-5 text-[14px] leading-relaxed text-slate-600">Use the preview with two to three live clients and decide from actual coaching outcomes, not promises.</p>
              <div className="space-y-3">
                {PILOT_SCORECARD.map((row) => (
                  <div key={row.metric} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-[12px] font-semibold text-slate-900">{row.metric}</p>
                    <p className="text-[13px] leading-relaxed text-slate-600">{row.success}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Weekly operating rhythm</p>
              <h2 className="mb-4 text-[22px] font-bold leading-snug text-slate-900">Make the workflow visible in fewer than 12 minutes.</h2>
              <div className="space-y-4">
                {COACH_RYTHM.map((step) => (
                  <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{step.title}</p>
                    <p className="mb-1.5 text-[14px] font-semibold text-slate-900">{step.label}</p>
                    <p className="text-[13px] leading-relaxed text-slate-600">{step.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-slate-600">{WEEKLY_REVIEW_TEMPLATE[0]}</p>
            </article>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Pricing clarity</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COACH_BUYER_PLANS.map((plan) => (
                <article key={plan.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-1 text-[14px] font-semibold text-slate-900">{plan.name}</p>
                  <p className="mb-3 text-[22px] font-bold text-orange-600">{plan.price}</p>
                  <p className="text-[13px] leading-relaxed text-slate-600">{plan.fit}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-slate-500">Use the economics page for full details. Keep the landing page focused on the coach buying decision.</p>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Trust and privacy</p>
            <h2 className="mb-4 text-[22px] font-bold leading-snug text-slate-900">Starting Monday supports coaching. It does not replace it.</h2>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-2 text-[12px] font-semibold text-slate-900">Platform owns</p>
                <ul className="space-y-2 text-[13px] leading-relaxed text-slate-700">
                  {ROLE_BOUNDARY.platform.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5">
                <p className="mb-2 text-[12px] font-semibold text-slate-900">Coach owns</p>
                <ul className="space-y-2 text-[13px] leading-relaxed text-slate-700">
                  {ROLE_BOUNDARY.coach.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </article>
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-slate-600">Clients control access, can revoke it anytime, and the trust pack explains the permission model in one minute.</p>
            <div className="flex flex-wrap gap-3">
              <TrackLink
                href="/for-coaches/trust-pack"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_trust_pack', source_page: '/for-coaches' }}
                className="inline-flex items-center justify-center rounded border border-slate-300 px-5 py-3 text-[14px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
              >
                Read the trust pack
              </TrackLink>
              <TrackLink
                href="/for-coaches/economics"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'coach_economics', source_page: '/for-coaches' }}
                className="inline-flex items-center justify-center rounded border border-orange-300 px-5 py-3 text-[14px] font-semibold text-orange-700 transition-colors hover:bg-orange-50"
              >
                View pricing and economics
              </TrackLink>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <ChannelMicroProductRail channel="coaches" sourceRoute="/for-coaches" />
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white sm:p-7">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-300">Next step</p>
            <h2 className="mb-3 text-[22px] font-bold leading-snug">Request the preview, then decide from a live client workflow.</h2>
            <p className="mb-6 max-w-3xl text-[14px] leading-relaxed text-slate-300">The landing page should earn the next click. The support pages can answer the deeper questions after the coach sees enough to care.</p>
            <CoachPreviewActions />
            <div className="mt-5 flex flex-wrap gap-4 text-[13px]">
              <Link href="/for-coaches/coach-prep-worksheet" className="text-slate-300 underline underline-offset-2 transition-colors hover:text-white">
                Open the coach prep worksheet
              </Link>
              <Link href="/for-coaches/faq" className="text-slate-300 underline underline-offset-2 transition-colors hover:text-white">
                Read the FAQ
              </Link>
              <Link href="/for-coaches/economics" className="text-slate-300 underline underline-offset-2 transition-colors hover:text-white">
                Open economics
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex flex-wrap gap-4 text-[12px] text-slate-400">
            <Link href="/coaches/personas" className="transition-colors hover:text-slate-300">Coach personas</Link>
            <Link href="/for-coaches/trust-pack" className="transition-colors hover:text-slate-300">Trust pack</Link>
            <Link href="/for-coaches/economics" className="transition-colors hover:text-slate-300">Economics</Link>
            <Link href="/for-coaches/faq" className="transition-colors hover:text-slate-300">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
