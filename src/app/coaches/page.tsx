import type { Metadata } from 'next'
import Link from 'next/link'

import { COACH_PROOF_STRIPS } from '../for-coaches/page-content'
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

const OPERATING_ROWS = [
  {
    friction: 'Sessions start with recap instead of decisions.',
    change: 'Use one weekly prep brief before every session.',
    proof: '81% reached a first interview within 30 days in the pilot cohort.',
  },
  {
    friction: 'Momentum drops between calls and coaching looks inconsistent.',
    change: 'Track one shared list of commitments and overdue actions.',
    proof: 'Median setup-to-first-qualified-outreach time was 9 days.',
  },
  {
    friction: 'Stakeholders lose trust when progress is hard to see.',
    change: 'Keep one visible weekly signal view for coach and client.',
    proof: 'Current evidence snapshot includes 27 verified executives.',
  },
]

const BRIGHTER_FUTURE = [
  'Clients arrive with clarity, and sessions start at decision level.',
  'You coach the strategic moments while the platform handles operating follow-through.',
  'Progress is visible every week, so trust compounds instead of leaking.',
]

const COACH_NEEDS_BY_SLUG: Record<string, { need: string; bestFit: string; cta: string }> = {
  'independent-executive-coach': {
    need: 'Tighten between-session accountability.',
    bestFit: 'Best fit: solo coach',
    cta: 'Open workflow',
  },
  'boutique-firm-coach': {
    need: 'Standardize team delivery quality.',
    bestFit: 'Best fit: boutique team',
    cta: 'Open workflow',
  },
  'enterprise-sponsored-coach': {
    need: 'Show sponsor-ready weekly progress.',
    bestFit: 'Best fit: sponsored cohort',
    cta: 'Open workflow',
  },
}

export default function CoachesChannelPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded bg-orange-500 px-3 py-2 text-[12px] font-semibold text-slate-950 transition-colors hover:bg-orange-600 sm:px-4"
            >
              Start now
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded border border-slate-600 px-3 py-2 text-[12px] font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white sm:px-4"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400">Coach gateway</p>
            <h1 className="max-w-3xl text-[34px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
              Your next session should start with decisions,
              <br className="hidden sm:block" />
              not updates.
            </h1>
            <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-slate-200 sm:text-[17px]">
              Starting Monday gives coaches one private operating layer for prep briefs, client signals, and between-session follow-through.
            </p>
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-200">
              Coach-first by design. You keep judgment and relationship ownership.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <TrackLink
                href="/partners#apply"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'Start coach preview', source_page: '/coaches', variant_key: 'coach_gateway_v5' }}
                className="inline-flex items-center justify-center rounded bg-orange-500 px-6 py-3 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-600"
              >
                Request the coach preview
              </TrackLink>
              <TrackLink
                href="/coaches/mock-dashboard"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{ channel: 'coaches', cta_label: 'See mock coach dashboard', source_page: '/coaches', variant_key: 'coach_gateway_v4' }}
                className="text-[13px] font-semibold text-slate-200 underline underline-offset-2 transition-colors hover:text-white"
              >
                See mock coach dashboard
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
        <section className="border-b border-slate-200 bg-white px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Start from your need</p>
            <h2 className="max-w-3xl text-[24px] font-bold leading-tight text-slate-900 sm:text-[28px]">
              Pick what you need help with.
            </h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
              One click opens the fastest next step.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
              {COACH_PERSONAS.map((persona) => {
                const need = COACH_NEEDS_BY_SLUG[persona.slug]
                return (
                  <TrackLink
                    key={persona.slug}
                    href={persona.destination}
                    event={EVENT_NAMES.personaRouteSelected}
                    logToUserEvents
                    properties={{ channel: 'coaches', persona: persona.slug, source_route: '/coaches', target_route: persona.destination }}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-orange-300 hover:bg-white"
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{persona.label}</p>
                    <p className="text-[16px] font-semibold leading-snug text-slate-900">{need?.need ?? persona.label}</p>
                    <p className="mt-2 text-[12px] font-medium text-slate-600">{need?.bestFit ?? 'Best fit'}</p>
                    <p className="mt-auto pt-4 text-[12px] font-semibold text-orange-600">{need?.cta ?? 'Open route'}</p>
                  </TrackLink>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">Friction to outcomes</p>
            <div className="space-y-8">
              {OPERATING_ROWS.map((row) => (
                <div key={row.friction} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3 md:gap-5">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Friction</p>
                    <p className="text-[14px] leading-relaxed text-slate-800">{row.friction}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">What changes</p>
                    <p className="text-[14px] leading-relaxed text-slate-700">{row.change}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Proof cue</p>
                    <p className="text-[14px] leading-relaxed text-slate-700">{row.proof}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-950 px-4 py-16 text-white sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[26px] font-bold leading-snug text-white sm:text-[32px]">The next 30 days can feel different.</h2>
            <ul className="mt-6 space-y-3">
              {BRIGHTER_FUTURE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-200">
                  <span className="mt-0.5 text-orange-400">â†’</span>
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
                className="inline-flex items-center justify-center rounded border border-slate-600 px-6 py-3 text-[14px] font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
              >
                See mock coach dashboard
              </TrackLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-200">
              <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
            </span>
            <div className="flex items-center gap-4 sm:gap-5 flex-wrap text-[12px] text-slate-200">
              <Link href="/evidence-hub" className="hover:text-slate-200 transition-colors">Evidence Hub</Link>

              <Link href="/blog" className="hover:text-slate-200 transition-colors">Blog</Link>
              <Link href="/about" className="hover:text-slate-200 transition-colors">About</Link>
              <Link href="/for-coaches/trust-pack" className="hover:text-slate-200 transition-colors">Trust pack</Link>
              <Link href="/optimize" className="hover:text-slate-200 transition-colors">Free Profile Grade</Link>
              <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 transition-colors">LinkedIn</a>
              <Link href="/security" className="hover:text-slate-200 transition-colors">Security</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">Terms</Link>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-5">Privacy-first by design. No sale of user data, ever.</p>
          <p className="text-[11px] text-slate-500 mt-2">&copy; {new Date().getFullYear()} Starting Monday. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

