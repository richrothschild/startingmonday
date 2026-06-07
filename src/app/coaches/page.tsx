import type { Metadata } from 'next'
import Link from 'next/link'

import { CoachPreviewActions } from '../for-coaches/coach-preview-actions'
import { COACH_PROOF_STRIPS } from '../for-coaches/page-content'
import { TrackLink } from '@/components/TrackLink'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

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

const COST_OF_STAYING_THE_SAME = [
  {
    title: 'Your best hour gets spent rebuilding context',
    detail: 'When clients arrive unprepared, you burn premium coaching time on recap and reminders.',
  },
  {
    title: 'Great coaching still looks weak without execution rhythm',
    detail: 'Without a between-session system, momentum fades and your strongest guidance looks inconsistent.',
  },
  {
    title: 'Invisible movement creates avoidable trust risk',
    detail: 'If progress is unclear week to week, confidence drops before outcomes have time to compound.',
  },
]

const DOUBTS = [
  {
    title: '"This is just a glorified prompt. I can do this myself."',
    detail: 'You can write prompts. The gap is operating discipline between sessions. Antidote: use Starting Monday to track signal movement, standardize prep, and keep commitments visible week to week.',
  },
  {
    title: '"My clients already have tools."',
    detail: 'Most stacks still fail between sessions, where accountability drifts. Antidote: layer this as the operating system for prep briefs, signal tracking, and follow-through.',
  },
  {
    title: '"I am not sure clients will stick with it."',
    detail: 'Clients drop when the workflow feels like admin, not progress. Antidote: start with one weekly ritual that makes the next session visibly sharper, then scale after two weeks of movement.',
  },
]

const PLATFORM_JTBD = [
  'Surface between-session signal movement before each session.',
  'Generate prep briefs so sessions start at decision level, not recap level.',
  'Track commitments and overdue actions to prevent execution drift.',
  'Give coach and client one shared view of progress and risk.',
]

const COACH_JTBD = [
  'Set strategic direction and reframe the client narrative at key moments.',
  'Choose where to intervene when momentum or confidence drops.',
  'Hold accountability on the commitments that matter most this week.',
  'Translate weekly signal changes into next-session priorities.',
]

const BRIGHTER_FUTURE = [
  'Clients arrive with clarity, and sessions start at decision level.',
  'You coach the strategic moments while the platform handles operating follow-through.',
  'Progress is visible every week, so trust compounds instead of leaking.',
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
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400">Coach gateway</p>
            <h1 className="max-w-3xl text-[34px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
              Your next coaching session should start with decisions,
              <br className="hidden sm:block" />
              not recap.
            </h1>
            <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-slate-300 sm:text-[17px]">
              If they do not, strategy time turns into recap. Starting Monday gives coaches one private operating layer for prep briefs, client signals, and between-session follow-through.
            </p>
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-400">
              Coach-first by design. You keep judgment and relationship ownership.
            </p>

            <div className="mt-7">
              <CoachPreviewActions />
            </div>
            <div className="mt-3">
              <TrackLink
                href="/coaches/mock-dashboard"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'See mock coach dashboard', source_page: '/coaches', variant_key: 'coach_gateway_v4' }}
                className="text-[13px] font-semibold text-orange-300 transition-colors hover:text-orange-200"
              >
                See mock coach dashboard &rarr;
              </TrackLink>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6 pt-2">
            {COACH_PROOF_STRIPS.map((item) => (
              <div key={item.label}>
                <p className="text-[22px] font-bold leading-none text-white">{item.value}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="bg-slate-50 text-slate-900">
        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Where coaching quietly breaks down</p>
            <div className="space-y-8">
              {COST_OF_STAYING_THE_SAME.map((card) => (
                <div key={card.title} className="grid gap-1 md:grid-cols-[280px_1fr]">
                  <p className="text-[15px] font-semibold leading-snug text-slate-900">{card.title}</p>
                  <p className="text-[14px] leading-relaxed text-slate-600">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-orange-100 bg-orange-50/60 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">The antidote</p>
            <h2 className="mb-8 text-[22px] font-bold leading-tight text-slate-900 sm:text-[26px]">One operating layer. Clear division of labor.</h2>
            <div className="grid gap-10 md:grid-cols-2 md:divide-x md:divide-orange-200">
              <div>
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">Platform handles</p>
                <ul className="space-y-3 text-[14px] leading-relaxed text-slate-700">
                  {PLATFORM_JTBD.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="md:pl-10">
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-orange-600">Coach handles</p>
                <ul className="space-y-3 text-[14px] leading-relaxed text-slate-700">
                  {COACH_JTBD.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">If you have doubts</p>
            <div className="space-y-7">
              {DOUBTS.map((item) => (
                <div key={item.title} className="grid gap-1 md:grid-cols-[280px_1fr]">
                  <p className="text-[14px] font-semibold italic text-slate-700">{item.title}</p>
                  <p className="text-[14px] leading-relaxed text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-900 px-4 py-16 text-white sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[26px] font-bold leading-snug text-white sm:text-[32px]">The next 30 days can feel different.</h2>
            <ul className="mt-6 space-y-3">
              {BRIGHTER_FUTURE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-300">
                  <span className="mt-0.5 text-orange-400">→</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <TrackLink
                href="/partners#apply"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'Start coach preview', source_page: '/coaches', variant_key: 'coach_gateway_v2' }}
                className="inline-flex items-center justify-center rounded bg-orange-500 px-6 py-3 text-[14px] font-semibold text-slate-900 transition-colors hover:bg-orange-600"
              >
                Request the coach preview
              </TrackLink>
              <TrackLink
                href="/coaches/mock-dashboard"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'See mock coach dashboard', source_page: '/coaches', variant_key: 'coach_gateway_v4' }}
                className="inline-flex items-center justify-center rounded border border-slate-600 px-6 py-3 text-[14px] font-semibold text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
              >
                See mock coach dashboard
              </TrackLink>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
