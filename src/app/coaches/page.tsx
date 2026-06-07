import type { Metadata } from 'next'
import Link from 'next/link'

import { CoachPreviewActions } from '../for-coaches/coach-preview-actions'
import { COACH_PROOF_STRIPS, ROLE_BOUNDARY } from '../for-coaches/page-content'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import { COACH_PERSONAS } from '@/lib/persona-routes'

export const metadata: Metadata = {
  title: 'Coaches Channel | Starting Monday',
  description:
    'For executive coaches who want to see the value immediately. Request the coach preview and compare the workflow, trust boundary, and sign-up path in one place.',
  alternates: {
    canonical: 'https://startingmonday.app/coaches',
  },
  openGraph: {
    title: 'Coaches Channel | Starting Monday',
    description:
      'Coach-first landing page for executive coaches and coaching firms. See the value fast, then request the coach preview.',
    url: 'https://startingmonday.app/coaches',
  },
}

const FAST_VALUE_POINTS = [
  'Clients arrive better prepared for high-stakes conversations.',
  'You see signal movement between sessions instead of rebuilding context.',
  'The preview makes the value obvious before you commit to a rollout.',
]

const INSTANT_VALUE_CARDS = [
  {
    title: 'Show value fast',
    detail: 'A coach sees the prep brief, signal movement, and weekly rhythm in the first pass.',
  },
  {
    title: 'Protect the coaching relationship',
    detail: 'Starting Monday handles the operating layer while the coach keeps judgment and strategy.',
  },
  {
    title: 'Make sign-up feel low risk',
    detail: 'Use the preview, compare the fit with real clients, and decide from evidence.',
  },
]

export default function CoachesChannelPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/coaches/personas" className="text-[13px] text-slate-400 transition-colors hover:text-white">
              Personas
            </Link>
            <Link href="/for-coaches/trust-pack" className="text-[13px] text-slate-400 transition-colors hover:text-white">
              Trust pack
            </Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400">Coach gateway</p>
            <h1 className="max-w-3xl text-[34px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
              Executive coaches should feel the value before the demo ends.
            </h1>
            <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-slate-300 sm:text-[17px]">
              Starting Monday gives coaching practices one private operating layer for client signals, prep briefs, and weekly follow-through so the next session feels sharper, not busier.
            </p>
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-400">
              Coach-first by design. You keep the judgment and the relationship. The platform keeps the rhythm visible and the value easy to see.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <CoachPreviewActions />
              <TrackLink
                href="/for-coaches"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'Open coach journey', source_page: '/coaches', variant_key: 'coach_gateway_v2' }}
                className="inline-flex items-center justify-center rounded border border-slate-600 px-5 py-3 text-[14px] font-semibold text-slate-100 transition-colors hover:border-slate-300"
              >
                See the coach journey
              </TrackLink>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-[13px] text-slate-300">
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">30-day preview</span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">Private client access</span>
              <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">Value in one page</span>
            </div>
          </div>

          <div className="grid gap-4">
            {COACH_PROOF_STRIPS.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5 shadow-lg shadow-black/10">
                <p className="mb-1 text-[28px] font-bold leading-none text-white">{item.value}</p>
                <p className="text-[13px] leading-relaxed text-slate-300">{item.label}</p>
              </article>
            ))}
            <article className="rounded-2xl border border-orange-400/30 bg-orange-500/10 p-5 shadow-lg shadow-orange-950/20">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-200">Instant value</p>
              <ul className="space-y-2 text-[13px] leading-relaxed text-orange-50/90">
                {FAST_VALUE_POINTS.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </header>

      <main className="bg-slate-50 text-slate-900">
        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">What coaches feel right away</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {INSTANT_VALUE_CARDS.map((card) => (
                <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-[14px] font-semibold text-slate-900">{card.title}</p>
                  <p className="text-[13px] leading-relaxed text-slate-600">{card.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white sm:p-8">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-300">Trust and role boundary</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                <p className="mb-2 text-[12px] font-semibold text-slate-200">Platform owns</p>
                <ul className="space-y-2 text-[13px] leading-relaxed text-slate-300">
                  {ROLE_BOUNDARY.platform.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-orange-400/30 bg-orange-500/10 p-5">
                <p className="mb-2 text-[12px] font-semibold text-orange-100">Coach owns</p>
                <ul className="space-y-2 text-[13px] leading-relaxed text-orange-50/90">
                  {ROLE_BOUNDARY.coach.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Choose your path</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COACH_PERSONAS.map((persona) => (
                <TrackLink
                  key={persona.slug}
                  href={persona.destination}
                  event={EVENT_NAMES.personaRouteSelected}
                  logToUserEvents
                  properties={{ channel: 'coaches', persona: persona.slug, source_route: '/coaches', target_route: persona.destination }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-orange-400"
                >
                  <p className="mb-2 text-[13px] font-semibold text-slate-900">{persona.label}</p>
                  <p className="text-[13px] leading-relaxed text-slate-600">{persona.summary}</p>
                </TrackLink>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Sign-up pressure, without pressure</p>
                <h2 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[28px]">
                  Let the preview do the selling.
                </h2>
                <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate-600">
                  If the value is obvious, the next step should be obvious too. Request the coach preview, compare it with the work you already do, and decide from the workflow itself.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <TrackLink
                  href="/partners#apply"
                  event={EVENT_NAMES.channelEntryClicked}
                  logToUserEvents
                  properties={{ channel: 'coaches', cta_label: 'Start coach preview', source_page: '/coaches', variant_key: 'coach_gateway_v2' }}
                  className="inline-flex items-center justify-center rounded bg-orange-500 px-5 py-3 text-[14px] font-semibold text-slate-900 transition-colors hover:bg-orange-600"
                >
                  Request the coach preview
                </TrackLink>
                <TrackLink
                  href="/for-coaches/trust-pack"
                  event={EVENT_NAMES.channelEntryClicked}
                  logToUserEvents
                  properties={{ channel: 'coaches', cta_label: 'coach_trust_pack', source_page: '/coaches', variant_key: 'coach_gateway_v2' }}
                  className="inline-flex items-center justify-center rounded border border-slate-300 px-5 py-3 text-[14px] font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  Read the trust pack
                </TrackLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
