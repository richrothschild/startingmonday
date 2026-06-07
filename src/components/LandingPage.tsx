import { BrandIcon } from '@/components/BrandIcon'
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { TrackLink } from '@/components/TrackLink'
import { HowStartingMondayHelpsModal } from '@/components/HowStartingMondayHelpsModal'
import { CHANNEL_ROUTE_SPECS } from '@/lib/channel-ia'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import type { Channel } from '@/lib/channel-metrics-events'

export interface SituationCard {
  id: string
  headline: string
  sub: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface LandingHero {
  eyebrow: string
  h1Lines: string[]
  claimMethodLabel?: string
  claimMethodHref?: string
  claimEvidenceLabel?: string
  claimEvidenceHref?: string
  bodyPreamble?: string
  body: string
  note?: string
  steps?: string[]
  trialNote: string
  testimonial?: {
    quote: string
    source: string
    result: string
  }
  competitiveEdge?: string
}

export interface ProofHighlight {
  metric: string
  detail: string
}

export interface LandingPageProps {
  hero: LandingHero
  situations: SituationCard[]
  faqs?: FAQ[]
  showPersonaSelector?: boolean
  rolePathPriorityByCtaKey?: Record<string, number>
  proofHighlights?: ProofHighlight[]
  sourcePage?: string
}

const CHANNEL_BEST_FOR: Record<string, string> = {
  executives: 'Best for active or near-term C-suite transitions',
  coaches: 'Best for coach-led execution between client sessions',
  outplacement: 'Best for cohort delivery and measurable 30-day momentum',
  search_firms: 'Best for retained-search kickoff quality and shortlist speed',
}

const MANAGERTOOLS_SIGNUP_URL = '/signup?utm_source=managertools&utm_medium=newsletter&utm_campaign=horstman-june2026'

type RolePathItem = {
  ctaKey: string
  label: string
  iconToken: string
  priority: number
  href?: string
}

const EXECUTIVE_WHY = [
  'The short list is shaped before the posting goes live.',
  'Better cadence beats better credentials when timing gets tight.',
  'Narrative quality decides whether you get invited back.',
  'Without a weekly operating loop, even top candidates become reactive.',
]

const EXECUTIVE_GETS = [
  {
    title: 'Position for a specific audience',
    detail: 'Define one clear narrative per audience so decision-makers know why you now.',
  },
  {
    title: 'Control high-stakes conversations',
    detail: 'Use calibrated questions and objection prep to steer each conversation toward next steps.',
  },
  {
    title: 'Run a weekly execution rhythm',
    detail: 'Turn outreach and follow-up into a repeatable cadence instead of reactive bursts.',
  },
  {
    title: 'Prove progress with evidence',
    detail: 'Track signals, responses, and outcomes so strategy changes are grounded in reality.',
  },
]

const HOME_BLUF_SECTIONS = [
  {
    title: 'Be the person that shapes the role',
    summary: 'Learn about likely executive openings before formal posting windows appear.',
    detail: 'We surface movement signals so you can engage earlier with stronger context and better timing.',
    href: '/blog/cio-job-search-timeline',
  },
  {
    title: 'Relationship cadence that compounds',
    summary: 'Stay in touch with the right people at the right time without reactive scrambling.',
    detail: 'A weekly rhythm keeps outreach intentional across search firms, coaches, HR partners, peers, and boards.',
    href: '/blog/cio-board-presentation',
  },
  {
    title: 'Strategy over grunt work',
    summary: 'Spend more time on decision quality and less on manual search busywork.',
    detail: 'Signal tracking, prep framing, and recurring operating routines remove low-value repetition from the search.',
    href: '/blog/executive-coaching-job-search',
  },
  {
    title: 'Narrative control by audience',
    summary: 'Refine your narrative for each conversation context without reinventing it every time.',
    detail: 'Positioning is adapted for role paths and audiences so conversations stay consistent and role-aligned.',
    href: '/blog/cio-vs-cto-which-role',
  },
] as const

export function LandingPage({ hero, faqs, rolePathPriorityByCtaKey, proofHighlights, sourcePage = '/' }: LandingPageProps) {
  const isHomePage = sourcePage === '/'
  const isExecutivesPage = sourcePage === '/for-executives'
  const isManagerToolsPage = sourcePage === '/managertools'
  const heroPrimaryHref = isManagerToolsPage
    ? MANAGERTOOLS_SIGNUP_URL
    : isExecutivesPage
      ? '/signup?utm_source=executives&utm_medium=landing&utm_campaign=executive-page'
      : '/concierge?program=beta&from=landing'
  const heroPrimaryLabel = isManagerToolsPage
    ? 'Start 90-day free access'
    : isExecutivesPage
      ? 'Start 30-day free trial'
      : 'Start Now'
  void rolePathPriorityByCtaKey

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            {isManagerToolsPage ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded border border-slate-500 px-4 text-[13px] font-semibold text-slate-200 hover:border-slate-300 hover:text-white transition-colors"
                  aria-label="Log in"
                >
                  Log in
                </Link>
                <Link
                  href={MANAGERTOOLS_SIGNUP_URL}
                  className="inline-flex h-9 items-center justify-center rounded bg-orange-500 px-4 text-[13px] font-bold text-slate-900 hover:bg-orange-600 transition-colors"
                  aria-label="Sign up"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[13px] font-bold px-3.5 py-1.5 rounded hover:bg-orange-600 transition-colors"
                  aria-label="Sign up"
                >
                  Sign Up
                </Link>
                <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors" aria-label="Log in">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section id="core-clarity" data-emi-section="clarity_block" className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
          <div className="max-w-5xl mx-auto">
            {isHomePage ? (
              <div className="mb-6">
                <p className="text-white text-[1.3rem] sm:text-[1.4rem] lg:text-[1.9rem] font-bold leading-[1.1] tracking-tight mb-3 sm:mb-4 sm:whitespace-nowrap">
                  {hero.eyebrow}
                </p>
                <h1 className="text-white text-[1.6rem] sm:text-[1.75rem] lg:text-[2.4rem] font-bold leading-[1.08] tracking-tight mb-3 sm:mb-4 sm:whitespace-nowrap">
                  {hero.h1Lines.map((line, i) => (
                    <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
                  ))}
                </h1>
                <p className="text-white text-[1.9rem] sm:text-[2.05rem] lg:text-[2.9rem] font-bold leading-[1.07] tracking-tight mb-3 sm:mb-4 sm:whitespace-nowrap">
                  {hero.body}
                </p>
              </div>
            ) : (
              <>
                <p className="text-lg sm:text-xl text-slate-300 font-semibold leading-relaxed mb-5 sm:mb-7 whitespace-pre-line [text-wrap:balance]">
                  {hero.eyebrow}
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5 [text-wrap:balance]">
                  {hero.h1Lines.map((line, i) => (
                    <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
                  ))}
                </h1>
                <p className="text-base text-slate-300 leading-relaxed max-w-xl mb-4 [text-wrap:pretty]">
                  {hero.body}
                </p>
              </>
            )}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <TrackLink
                href={heroPrimaryHref}
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{
                  channel: 'executives',
                  cta_label: isManagerToolsPage ? 'hero_manager_tools_signup' : 'hero_apply_beta',
                  source_page: sourcePage,
                }}
                className="inline-flex items-center justify-center border border-orange-400 text-orange-300 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-500/10 transition-colors"
              >
                {heroPrimaryLabel}
              </TrackLink>
            </div>

            {proofHighlights && proofHighlights.length > 0 && (
              <p className="text-[14px] sm:text-[15px] text-emerald-200 leading-relaxed mb-6 sm:whitespace-nowrap" data-emi-proof="landing_micro_proof">
                <span className="font-semibold text-emerald-100">Proof:</span> Executives using Starting Monday stay organized, sharpen narrative-to-role fit, and walk into interviews with role-specific evidence.
              </p>
            )}

            {isExecutivesPage && proofHighlights && proofHighlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6" data-emi-proof="executive_outcomes_grid">
                {proofHighlights.map((item) => (
                  <article key={item.metric} className="rounded-md border border-slate-700 bg-slate-900/70 p-4">
                    <p className="text-[12px] font-semibold text-emerald-200 mb-2 leading-snug">{item.metric}</p>
                    <p className="text-[12px] text-slate-300 leading-relaxed">{item.detail}</p>
                  </article>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-5 mb-6" data-emi-proof="landing_clarity_panel">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">At a glance</p>
              <p className="text-[15px] sm:text-[16px] text-slate-200 leading-relaxed mb-4 [text-wrap:pretty]">
                Connect with the right relationships at the right time and get to the front of the line before the role is obvious to the market.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <article className="p-3 sm:p-4">
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">Opportunity Timing Gap</p>
                  <div className="overflow-x-auto pb-1">
                    <svg viewBox="0 0 520 252" className="w-[680px] max-w-none h-[236px] sm:w-full sm:max-w-full sm:h-[246px]" role="img" aria-label="Opportunity timing gap chart preview">
                    <line x1="34" y1="138" x2="490" y2="138" stroke="#334155" strokeWidth="2.5" />
                    <circle cx="44" cy="138" r="4.5" fill="#64748b" />
                    <circle cx="116" cy="138" r="4.5" fill="#64748b" />
                    <circle cx="188" cy="138" r="4.5" fill="#64748b" />
                    <circle cx="260" cy="138" r="4.5" fill="#64748b" />
                    <circle cx="332" cy="138" r="4.5" fill="#64748b" />
                    <circle cx="404" cy="138" r="4.5" fill="#64748b" />
                    <circle cx="476" cy="138" r="4.5" fill="#64748b" />

                    <text x="24" y="168" fill="#cbd5e1" fontSize="13">Signal</text>
                    <text x="94" y="182" fill="#cbd5e1" fontSize="13">Shape</text>
                    <text x="160" y="168" fill="#cbd5e1" fontSize="13">Outreach</text>
                    <text x="242" y="182" fill="#cbd5e1" fontSize="13">Open</text>
                    <text x="302" y="168" fill="#cbd5e1" fontSize="13">Interviews</text>
                    <text x="384" y="182" fill="#cbd5e1" fontSize="13">Selection</text>
                    <text x="450" y="168" fill="#cbd5e1" fontSize="13">Start</text>

                    <text x="70" y="30" fill="#86efac" fontSize="14" fontWeight="700">Starting Monday enters here</text>
                    <line x1="116" y1="42" x2="116" y2="122" stroke="#22c55e" strokeWidth="4" />
                    <polygon points="116,133.5 109,121.5 123,121.5" fill="#22c55e" />

                    <text x="206" y="50" fill="#fdba74" fontSize="14" fontWeight="700">Typical candidates enter here</text>
                    <line x1="260" y1="60" x2="260" y2="122" stroke="#f97316" strokeWidth="4" />
                    <polygon points="260,133.5 253,121.5 267,121.5" fill="#f97316" />

                    <text x="16" y="228" fill="#cbd5e1" fontSize="14" fontWeight="700">Entering before the role opens materially improves shortlist odds.</text>
                  </svg>
                  </div>
                </article>

                <article className="p-3 sm:p-4">
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">Role Landing Probability</p>
                  <div className="overflow-x-auto pb-1">
                    <svg viewBox="0 0 600 292" className="w-[700px] max-w-none h-[260px] sm:w-full sm:max-w-full sm:h-[278px]" role="img" aria-label="Role landing probability chart comparing Starting Monday and typical paths">
                    <line x1="56" y1="32" x2="56" y2="214" stroke="#334155" strokeWidth="2" />
                    <line x1="56" y1="214" x2="492" y2="214" stroke="#334155" strokeWidth="2" />

                    <rect x="56" y="138" width="436" height="76" fill="#2b1c2a" opacity="0.32" />
                    <rect x="248" y="32" width="244" height="106" fill="#0f3a2f" opacity="0.26" />
                    <line x1="56" y1="178" x2="492" y2="178" stroke="#1f2f4a" strokeWidth="1" />
                    <line x1="56" y1="142" x2="492" y2="142" stroke="#1f2f4a" strokeWidth="1" />
                    <line x1="56" y1="106" x2="492" y2="106" stroke="#1f2f4a" strokeWidth="1" />
                    <line x1="56" y1="70" x2="492" y2="70" stroke="#1f2f4a" strokeWidth="1" />

                    <text x="18" y="218" fill="#94a3b8" fontSize="12">0%</text>
                    <text x="14" y="182" fill="#94a3b8" fontSize="12">25%</text>
                    <text x="14" y="146" fill="#94a3b8" fontSize="12">50%</text>
                    <text x="14" y="110" fill="#94a3b8" fontSize="12">75%</text>
                    <text x="10" y="74" fill="#94a3b8" fontSize="12">100%</text>

                    <text x="20" y="24" fill="#cbd5e1" fontSize="12" fontWeight="700">Probability of landing role</text>

                    <line x1="84" y1="214" x2="84" y2="220" stroke="#475569" strokeWidth="1.5" />
                    <line x1="138" y1="214" x2="138" y2="220" stroke="#475569" strokeWidth="1.5" />
                    <line x1="194" y1="214" x2="194" y2="220" stroke="#475569" strokeWidth="1.5" />
                    <line x1="248" y1="214" x2="248" y2="220" stroke="#475569" strokeWidth="1.5" />
                    <line x1="302" y1="214" x2="302" y2="220" stroke="#475569" strokeWidth="1.5" />
                    <line x1="356" y1="214" x2="356" y2="220" stroke="#475569" strokeWidth="1.5" />
                    <line x1="410" y1="214" x2="410" y2="220" stroke="#475569" strokeWidth="1.5" />
                    <line x1="468" y1="214" x2="468" y2="220" stroke="#475569" strokeWidth="1.5" />

                    <text x="84" y="234" fill="#cbd5e1" fontSize="12" textAnchor="middle">Signal</text>
                    <text x="138" y="248" fill="#cbd5e1" fontSize="12" textAnchor="middle">Shape</text>
                    <text x="194" y="234" fill="#cbd5e1" fontSize="12" textAnchor="middle">Outreach</text>
                    <text x="248" y="248" fill="#cbd5e1" fontSize="12" textAnchor="middle">Open</text>
                    <text x="302" y="234" fill="#cbd5e1" fontSize="12" textAnchor="middle">Prep</text>
                    <text x="356" y="248" fill="#cbd5e1" fontSize="12" textAnchor="middle">Interviews</text>
                    <text x="410" y="234" fill="#cbd5e1" fontSize="12" textAnchor="middle">Selection</text>
                    <text x="468" y="248" fill="#cbd5e1" fontSize="12" textAnchor="middle">Start</text>

                    <circle cx="84" cy="198" r="5.6" fill="#64748b" />
                    <circle cx="138" cy="190" r="5.6" fill="#64748b" />
                    <circle cx="194" cy="178" r="5.6" fill="#64748b" />
                    <circle cx="248" cy="164" r="5.6" fill="#64748b" />
                    <circle cx="302" cy="154" r="5.6" fill="#64748b" />
                    <circle cx="356" cy="144" r="5.6" fill="#64748b" />

                    <circle cx="84" cy="188" r="6.5" fill="#38bdf8" />
                    <circle cx="138" cy="170" r="6.5" fill="#38bdf8" />
                    <circle cx="194" cy="150" r="6.5" fill="#38bdf8" />
                    <circle cx="248" cy="128" r="6.5" fill="#38bdf8" />
                    <circle cx="302" cy="106" r="6.5" fill="#38bdf8" />
                    <circle cx="356" cy="84" r="6.5" fill="#38bdf8" />
                    <circle cx="410" cy="62" r="6.5" fill="#38bdf8" />
                    <circle cx="468" cy="40" r="6.5" fill="#38bdf8" />

                    <polyline points="84,188 138,170 194,150 248,128 302,106 356,84 410,62 468,40" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" opacity="0.95" />
                    <polyline points="84,198 138,190 194,178 248,164 302,154 356,144" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 4" opacity="0.9" />

                    <text x="16" y="274" fill="#cbd5e1" fontSize="14" fontWeight="700">Without structure, momentum stalls at interviews. Starting Monday carries you through selection to day one.</text>

                    <rect x="504" y="36" width="86" height="52" rx="6" fill="#0f1a2e" stroke="#1e3a5f" strokeWidth="1" />
                    <circle cx="516" cy="52" r="5" fill="#38bdf8" />
                    <text x="526" y="56" fill="#cbd5e1" fontSize="11">With SM</text>
                    <circle cx="516" cy="74" r="5" fill="#64748b" />
                    <text x="526" y="78" fill="#94a3b8" fontSize="11">Typical</text>
                  </svg>
                  </div>
                </article>
              </div>
              <Link
                href="/demo/executive-brief"
                className="inline-flex items-center mt-4 text-[13px] font-semibold text-orange-300 hover:text-orange-200 transition-colors"
              >
                See how an interview brief works in 60 seconds →
              </Link>
            </div>

            <p className="text-xs font-bold tracking-[0.08em] uppercase text-green-400 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              Private by default
            </p>
            <p className="text-sm text-slate-500 mb-2 leading-relaxed [text-wrap:pretty]">
              Your search stays private. We never share your identity, targets, or activity with employers or recruiters.
            </p>
          </div>
        </section>

        <section id="next-step" data-emi-section="next_step_block" className="bg-slate-800 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-700">
          <div className="max-w-5xl mx-auto">
            {isManagerToolsPage ? (
              <>
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-3">Manager Tools next step</p>
                <h2 className="text-[22px] font-bold text-white mb-6 leading-snug">
                  For managers and executives in transition.
                </h2>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <TrackLink
                    href="/for-executives"
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'next_step_manager_tools_audience',
                      source_page: sourcePage,
                    }}
                    className="block rounded-md border border-slate-700 bg-slate-900 px-4 py-3 hover:border-orange-500 transition-colors"
                  >
                    <p className="text-[13px] font-semibold text-white">Managers and Executives</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">Built for active or near-term leadership transitions in the Manager Tools community.</p>
                  </TrackLink>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <TrackLink
                    href={MANAGERTOOLS_SIGNUP_URL}
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'next_step_manager_tools_signup',
                      source_page: sourcePage,
                    }}
                    className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
                  >
                    Start 90-day free access
                  </TrackLink>
                  <TrackLink
                    href="/feedback"
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'next_step_manager_tools_feedback',
                      source_page: sourcePage,
                    }}
                    className="inline-flex items-center justify-center border border-orange-400 text-orange-300 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-500/10 transition-colors"
                  >
                    Submit feedback
                  </TrackLink>
                </div>
              </>
            ) : isExecutivesPage ? (
              <>
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-3">Executive outcomes</p>
                <h2 className="text-[22px] font-bold text-white mb-2 leading-snug">
                  Build momentum in the first 30 days.
                </h2>
                <p className="text-[14px] text-slate-300 mb-6 max-w-3xl leading-relaxed">
                  Use your trial to sharpen narrative quality, improve conversation conversion, and create a weekly operating cadence you can keep through offer-stage decisions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="rounded-md border border-slate-700 bg-slate-900 px-4 py-3">
                    <p className="text-[12px] font-semibold text-white">Week 1</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">Mandate narrative, role filter, and priority relationship map.</p>
                  </div>
                  <div className="rounded-md border border-slate-700 bg-slate-900 px-4 py-3">
                    <p className="text-[12px] font-semibold text-white">Week 2</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">Signal tracking and audience-specific prep for recruiter and board conversations.</p>
                  </div>
                  <div className="rounded-md border border-slate-700 bg-slate-900 px-4 py-3">
                    <p className="text-[12px] font-semibold text-white">Week 3-4</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">Consistent outreach rhythm and clearer conversion into high-quality next steps.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <TrackLink
                    href="/signup?utm_source=executives&utm_medium=landing&utm_campaign=executive-page"
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'next_step_executive_signup',
                      source_page: sourcePage,
                    }}
                    className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
                  >
                    Start 30-day free trial
                  </TrackLink>
                  <TrackLink
                    href="/demo/executive-brief"
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'next_step_executive_demo',
                      source_page: sourcePage,
                    }}
                    className="inline-flex items-center justify-center border border-orange-400 text-orange-300 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-500/10 transition-colors"
                  >
                    Preview executive brief
                  </TrackLink>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-3">Choose your next step</p>
                <h2 className="text-[22px] font-bold text-white mb-6 leading-snug">
                  Pick a channel, then take the next step.
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {CHANNEL_ROUTE_SPECS.map((spec) => (
                    <TrackLink
                      key={`next_${spec.channel}`}
                      href={spec.route}
                      event={EVENT_NAMES.channelEntryClicked}
                      logToUserEvents
                      properties={{
                        channel: spec.channel,
                        cta_label: 'next_step_channel_card',
                        source_page: sourcePage,
                      }}
                      className="block rounded-md border border-slate-700 bg-slate-900 px-4 py-3 hover:border-orange-500 transition-colors"
                    >
                      <p className="text-[13px] font-semibold text-white">{spec.label}</p>
                      <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{CHANNEL_BEST_FOR[spec.channel]}</p>
                    </TrackLink>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <HowStartingMondayHelpsModal sourcePage={sourcePage} />
                  <TrackLink
                    href="/concierge?program=beta&from=landing"
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'next_step_start_now',
                      source_page: sourcePage,
                    }}
                    className="inline-flex items-center justify-center border border-orange-400 text-orange-300 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-500/10 transition-colors"
                  >
                    Start Now
                  </TrackLink>
                </div>
              </>
            )}
            <p className="text-[12px] text-slate-400 mt-3">{hero.trialNote}</p>
          </div>
        </section>

        {faqs && faqs.length > 0 && (
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }} />
        )}

        <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-10">
          <div className="max-w-5xl mx-auto">
            <div className={isManagerToolsPage ? 'flex flex-col items-center gap-5' : 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'}>
              <span className={isManagerToolsPage ? 'text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 text-center' : 'text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400'}>
                <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
              </span>
              <div className={isManagerToolsPage ? 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3 text-[12px] text-slate-400 justify-items-center text-center' : 'flex items-center gap-4 sm:gap-5 flex-wrap text-[12px] text-slate-400'}>
                <Link href="/method-and-evidence" className="hover:text-slate-300 transition-colors">Method and evidence</Link>
                <Link href="/evidence-room" className="hover:text-slate-300 transition-colors">Evidence room</Link>
                <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
                <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
                <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
                <Link href="/optimize" className="hover:text-slate-300 transition-colors">Free Profile Grade</Link>
                <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">LinkedIn</a>
                <Link href="/security" className="hover:text-slate-300 transition-colors">Security</Link>
                <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              </div>
            </div>

            {isManagerToolsPage ? (
              <p className="text-[11px] text-slate-500 mt-5 text-center">
                Privacy-first by design. No sale of user data, ever. {' '}|{' '} &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.
              </p>
            ) : (
              <>
                <p className="text-[11px] text-slate-500 mt-5">Privacy-first by design. No sale of user data, ever.</p>
                <p className="text-[11px] text-slate-500 mt-2">&copy; {new Date().getFullYear()} Starting Monday. All rights reserved.</p>
              </>
            )}
          </div>
        </footer>
      </main>
    </div>
  )
}
