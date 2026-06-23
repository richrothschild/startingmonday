import Link from 'next/link'
import Image from 'next/image'
import { JsonLd } from '@/components/JsonLd'
import { SiteFooter } from '@/components/SiteFooter'
import { TrackLink } from '@/components/TrackLink'
import { DeferredHowStartingMondayHelpsModal } from '@/components/DeferredHowStartingMondayHelpsModal'
import { ChartZoomModal } from '@/components/home/ChartZoomModal'
import { CHANNEL_ROUTE_SPECS } from '@/lib/channel-ia'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

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
  competitiveEdge?: string
  steps?: string[]
  trialNote: string
  testimonial?: {
    quote: string
    source: string
    result: string
  }
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
  showFooter?: boolean
  rolePathPriorityByCtaKey?: Record<string, number>
  proofHighlights?: ProofHighlight[]
  sourcePage?: string
  experimentVariant?: 'control' | 'proof_first'
}

type ExecutiveLaneBrand = {
  key: 'leadership' | 'technical-leadership' | 'delivery-leadership'
  label: string
  badgeClass: string
  borderClass: string
  panelClass: string
  proofToneClass: string
}

const MANAGERTOOLS_SIGNUP_URL = '/signup?utm_source=managertools&utm_medium=newsletter&utm_campaign=horstman-june2026'

const EXECUTIVE_LANE_BRANDS: Record<ExecutiveLaneBrand['key'], ExecutiveLaneBrand> = {
  leadership: {
    key: 'leadership',
    label: 'Leadership lane',
    badgeClass: 'bg-amber-300/20 text-amber-100 border-amber-300/40',
    borderClass: 'border-amber-300/35',
    panelClass: 'bg-amber-300/10',
    proofToneClass: 'text-amber-100',
  },
  'technical-leadership': {
    key: 'technical-leadership',
    label: 'Technical leadership lane',
    badgeClass: 'bg-cyan-300/20 text-cyan-100 border-cyan-300/40',
    borderClass: 'border-cyan-300/35',
    panelClass: 'bg-cyan-300/10',
    proofToneClass: 'text-cyan-100',
  },
  'delivery-leadership': {
    key: 'delivery-leadership',
    label: 'Delivery leadership lane',
    badgeClass: 'bg-emerald-300/20 text-emerald-100 border-emerald-300/40',
    borderClass: 'border-emerald-300/35',
    panelClass: 'bg-emerald-300/10',
    proofToneClass: 'text-emerald-100',
  },
}

function executiveLaneFromSource(sourcePage: string): ExecutiveLaneBrand | null {
  const lane = sourcePage.startsWith('/for-executives/')
    ? sourcePage.replace('/for-executives/', '')
    : null

  if (!lane) return null
  if (lane === 'leadership' || lane === 'technical-leadership' || lane === 'delivery-leadership') {
    return EXECUTIVE_LANE_BRANDS[lane]
  }
  return null
}

const EXECUTIVE_FEATURE_MATRIX = [
  {
    feature: 'Executive signal intelligence',
    whatYouGet: 'Track role-shaping movement before a mandate is publicly obvious.',
    whyItMatters: 'You enter while the role is still being defined, not after the shortlist is crowded.',
  },
  {
    feature: 'Audience-specific narrative system',
    whatYouGet: 'One core story adapted for board members, search partners, CHROs, and executive peers.',
    whyItMatters: 'You stay consistent while still sounding precise for each decision-maker.',
  },
  {
    feature: 'Interview and objection preparation',
    whatYouGet: 'Role-specific prep prompts, risk framing, and likely objection rehearsal.',
    whyItMatters: 'You reduce unforced errors in high-stakes conversations and increase next-step conversion.',
  },
  {
    feature: 'Weekly operating cadence',
    whatYouGet: 'A repeatable weekly loop for targets, outreach, follow-up, and decision review.',
    whyItMatters: 'Sustained momentum replaces the stop-start pattern inherent in ad hoc scheduling.',
  },
]

const EXECUTIVE_DIFFERENTIATORS = [
  {
    category: 'Timing advantage',
    startingMonday: 'Built for pre-posting signal detection and early relationship entry.',
    otherTools: 'Optimized for posted jobs after demand is already concentrated.',
  },
  {
    category: 'Narrative quality',
    startingMonday: 'Mandate-level narrative tuned for multiple executive audiences.',
    otherTools: 'Resume/profile optimization oriented toward broad applicant pools.',
  },
  {
    category: 'Execution model',
    startingMonday: 'Weekly operating system with accountability to outcomes.',
    otherTools: 'Task lists and alerts without a strategic executive cadence.',
  },
  {
    category: 'Conversation readiness',
    startingMonday: 'Preparation workflows for recruiter, board, and C-suite dialogue.',
    otherTools: 'Generic interview tips that rarely map to executive mandate discussions.',
  },
]

function OpportunityTimingGapChart({ className = 'h-auto w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 252" className={className} role="img" aria-label="Opportunity timing gap chart preview">
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
  )
}

function RoleLandingProbabilityChart({ className = 'h-auto w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 292" className={className} role="img" aria-label="Role landing probability chart comparing Starting Monday and typical paths">
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
      <circle cx="138" cy="171" r="6.5" fill="#38bdf8" />
      <circle cx="194" cy="154" r="6.5" fill="#38bdf8" />
      <circle cx="248" cy="137" r="6.5" fill="#38bdf8" />
      <circle cx="302" cy="120" r="6.5" fill="#38bdf8" />
      <circle cx="356" cy="103" r="6.5" fill="#38bdf8" />
      <circle cx="410" cy="86" r="6.5" fill="#38bdf8" />
      <circle cx="468" cy="70" r="6.5" fill="#38bdf8" />

      <polyline points="84,188 138,171 194,154 248,137 302,120 356,103 410,86 468,70" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" opacity="0.95" />
      <polyline points="84,198 138,190 194,178 248,164 302,154 356,144" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 4" opacity="0.9" />

      <text x="16" y="274" fill="#cbd5e1" fontSize="14" fontWeight="700">Without structure, momentum stalls at interviews. Starting Monday carries you through selection to day one.</text>

      <rect x="504" y="36" width="86" height="52" rx="6" fill="#0f1a2e" stroke="#1e3a5f" strokeWidth="1" />
      <circle cx="516" cy="52" r="5" fill="#38bdf8" />
      <text x="526" y="56" fill="#cbd5e1" fontSize="11">With SM</text>
      <circle cx="516" cy="74" r="5" fill="#64748b" />
      <text x="526" y="78" fill="#94a3b8" fontSize="11">Typical</text>
    </svg>
  )
}

export function LandingPage({ hero, faqs, showFooter = true, rolePathPriorityByCtaKey, proofHighlights, sourcePage = '/', experimentVariant = 'control' }: LandingPageProps) {
  const isHomePage = sourcePage === '/'
  const isPrimaryExecutivesPage = sourcePage === '/for-executives'
  const isExecutivesPage = sourcePage === '/for-executives' || sourcePage.startsWith('/for-executives/')
  const isRisingLeadersPage = sourcePage === '/for-vp-technology'
  const isSecondaryLanePage = sourcePage === '/for-vp-technology' || sourcePage === '/individuals' || sourcePage === '/partner-firm'
  const isManagerToolsPage = sourcePage === '/managertools'
  const useCenteredFooter = isManagerToolsPage || isExecutivesPage
  const executiveLaneBrand = executiveLaneFromSource(sourcePage)
  const isLeadershipLanePage = executiveLaneBrand?.key === 'leadership'
  const heroPrimaryHref = isManagerToolsPage
    ? MANAGERTOOLS_SIGNUP_URL
    : isExecutivesPage
      ? '/signup?utm_source=executives&utm_medium=landing&utm_campaign=executive-page'
      : isSecondaryLanePage
        ? '/signup'
        : '/concierge?program=beta&from=landing'
  const heroPrimaryLabel = isManagerToolsPage
    ? 'Start 90-day free access'
    : isExecutivesPage || isSecondaryLanePage
      ? 'Start your free trial'
      : 'Start Now'

  const secondaryNextStep = sourcePage === '/individuals'
    ? {
      title: 'Choose a lane, then start your first week.',
      body: 'Select executive or rising-leader path first. Then use the same disciplined weekly rhythm shown on home.',
      href: '/for-executives',
      ctaLabel: 'Open executive lane',
      channel: 'individuals',
    }
    : sourcePage === '/partner-firm'
      ? {
        title: 'Pick your delivery model and move fast.',
        body: 'Start in the lane that matches your partner workflow, then standardize timing, briefs, and momentum tracking.',
        href: '/for-coaches',
        ctaLabel: 'Open partner lanes',
        channel: 'partner_firm',
      }
      : sourcePage === '/for-vp-technology'
        ? {
          title: 'Run this as a weekly operating cadence.',
          body: 'Use this structure every week: prioritize targets, prepare role-fit narrative, and convert conversations into concrete steps.',
          href: '/individuals',
          ctaLabel: 'Back to lane selector',
          channel: 'vp_technology',
        }
        : {
          title: 'Start with the feeling, then read the detail.',
          body: 'The homepage now leads with a clearer path and a lighter hand. If someone wants the operating detail, the next page carries it.',
          href: '/method-and-evidence',
          ctaLabel: 'Learn more',
          channel: 'executives',
        }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_34%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.95)_54%,_rgba(10,15,28,0.98)_100%)]" />
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/95 transition-opacity hover:opacity-80 inline-flex items-center min-h-[48px]" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
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
                  className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[13px] font-bold px-3.5 min-h-[48px] rounded hover:bg-orange-600 transition-colors"
                  aria-label="Sign up"
                >
                  Sign Up
                </Link>
                <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors inline-flex items-center min-h-[48px] px-3" aria-label="Log in">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative">
        <section id="core-clarity" data-emi-section="clarity_block" className="px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <div className="mx-auto max-w-6xl">
            {isHomePage ? (
              <div className="mb-10 py-2">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.82fr)] lg:gap-12">
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-slate-300/90 sm:text-[14px]">Starting Monday</p>
                    <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-300/95 sm:text-[14px]">
                      The private operating system for executive and leadership moves.
                    </p>
                    <h1 className="mt-4 max-w-4xl font-serif text-[2.6rem] font-medium leading-[0.97] tracking-[-0.02em] text-white sm:text-[3.2rem] lg:text-[4.35rem]">
                      The shortlist is defined before the role is public.
                      <br />
                      <span className="mt-2 block text-orange-200 sm:mt-3">
                        Be the shortlist.
                        <a
                          href="#citation-1"
                          aria-label="Jump to citation 1"
                          className="ml-1 align-super text-[0.5em] font-semibold text-orange-100/90 hover:text-white"
                        >
                          <sup>1</sup>
                        </a>
                      </span>
                    </h1>
                    <div className="mt-5 h-[2px] w-16 rounded-full bg-orange-300/65" />
                    <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-200/92 sm:text-[16px]">
                      Find roles first. Talk to the right people. Follow a clear plan.
                    </p>

                  </div>
                  <div className="relative mx-auto h-[480px] w-full max-w-[390px] overflow-hidden rounded-[1.6rem] border border-white/12 shadow-[0_30px_72px_rgba(2,6,23,0.42)] lg:mx-0 lg:justify-self-end">
                    <Image
                      src="/hero-previews/hero-final-locked.png"
                      alt="Stylized executive sketch visual"
                      fill
                      sizes="(max-width: 640px) 92vw, 390px"
                      priority
                      className="object-cover object-top [filter:brightness(1.08)_contrast(0.95)_saturate(0.9)]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="max-w-3xl text-base font-semibold leading-relaxed text-orange-200/90 sm:text-xl sm:leading-relaxed whitespace-pre-line [text-wrap:balance]">
                  {hero.eyebrow}
                </p>
                <h1 className="mt-4 max-w-4xl text-[2.6rem] font-bold leading-[1.06] tracking-tight text-white sm:text-5xl [text-wrap:balance]">
                  {hero.h1Lines.map((line, i) => (
                    <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
                  ))}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90 [text-wrap:pretty]">
                  {hero.body}
                </p>
              </>
            )}
            {experimentVariant === 'proof_first' && proofHighlights && proofHighlights.length > 0 && (
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3" data-emi-proof="executive_outcomes_grid">
                {proofHighlights.map((item) => (
                  <article key={item.metric} className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
                    <p className="mb-2 text-[12px] font-semibold leading-snug text-orange-100">{item.metric}</p>
                    <p className="text-[12px] leading-relaxed text-slate-200/90">{item.detail}</p>
                  </article>
                ))}
              </div>
            )}

            {!isHomePage && (
              <div className="mt-8 mb-8 flex flex-col gap-3 sm:flex-row">
                <TrackLink
                  href={heroPrimaryHref}
                  event={EVENT_NAMES.channelEntryClicked}
                  logToUserEvents
                  properties={{
                    channel: 'executives',
                    cta_label: isManagerToolsPage ? 'hero_manager_tools_signup' : 'hero_apply_beta',
                    source_page: sourcePage,
                    variant_key: `landing_${experimentVariant}`,
                    experiment_variant: experimentVariant,
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-orange-300/70 bg-orange-400 px-6 py-3 text-[14px] font-bold text-slate-950 shadow-[0_10px_30px_rgba(193,127,59,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-orange-300"
                >
                  {heroPrimaryLabel}
                </TrackLink>
              </div>
            )}

            {isHomePage && (
              <>
                <div className="mb-8 flex flex-col gap-3 sm:flex-row">
                  <TrackLink
                    href="/learn-more"
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'homepage_learn_more',
                      source_page: '/',
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-white/16 px-5 py-2.5 text-[13px] font-semibold tracking-[0.01em] text-slate-100 transition-colors hover:border-orange-300/60 hover:bg-orange-400/10 hover:text-white"
                  >
                    Learn more
                  </TrackLink>
                </div>
                <section
                  className="mb-8 border-t border-white/10 pt-8"
                  aria-labelledby="homepage-path-title"
                >
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">Choose your path</p>
                  <h2 id="homepage-path-title" className="mb-3 max-w-3xl text-[22px] font-semibold leading-[1.14] tracking-tight text-white sm:text-[25px]">
                    Start with the lane that matches your moment.
                  </h2>
                  <p className="mb-6 max-w-3xl text-[14px] leading-relaxed text-slate-200/90 sm:text-[15px]">
                    Pick your lane first. Then see the exact signal and briefing experience.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <TrackLink
                      href="/individuals"
                      event={EVENT_NAMES.channelEntryClicked}
                      logToUserEvents
                      properties={{
                        channel: 'executives',
                        cta_label: 'homepage_individuals_path',
                        source_page: '/',
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-orange-300/70 bg-orange-400 px-6 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-slate-950 shadow-[0_10px_24px_rgba(234,146,71,0.24)] transition-colors hover:bg-orange-300"
                    >
                      Individuals
                    </TrackLink>
                    <TrackLink
                      href="/partner-firm"
                      event={EVENT_NAMES.channelEntryClicked}
                      logToUserEvents
                      properties={{
                        channel: 'executives',
                        cta_label: 'homepage_partner_firm_path',
                        source_page: '/',
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-orange-400/10"
                    >
                      Partners / Firms
                    </TrackLink>
                  </div>
                </section>
              </>
            )}

            {proofHighlights && proofHighlights.length > 0 && !isHomePage && !isPrimaryExecutivesPage && (
              <p className="mb-6 text-[14px] leading-relaxed text-slate-100 sm:text-[15px]" data-emi-proof="landing_micro_proof">
                <span className="font-semibold text-orange-200">Proof:</span> {isLeadershipLanePage
                  ? 'Leaders maintain disciplined narratives and enter conversations grounded in company context.'
                  : 'Executives maintain disciplined narratives and enter conversations grounded in company context.'}
              </p>
            )}

            {experimentVariant !== 'proof_first' && proofHighlights && proofHighlights.length > 0 && !isHomePage && !isPrimaryExecutivesPage && (
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3" data-emi-proof="executive_outcomes_grid">
                {proofHighlights.map((item) => (
                  <article key={item.metric} className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
                    <p className="mb-2 text-[12px] font-semibold leading-snug text-orange-100">{item.metric}</p>
                    <p className="text-[12px] leading-relaxed text-slate-200/90">{item.detail}</p>
                  </article>
                ))}
              </div>
            )}

            {proofHighlights && proofHighlights.length > 0 && !isHomePage && !isPrimaryExecutivesPage && (
              <p className="mb-6 text-[12px] leading-relaxed text-slate-200">
                Source: Jan-May 2026 pilot cohorts with published method notes and attribution controls.
              </p>
            )}

            {isExecutivesPage && !isPrimaryExecutivesPage && (
              <div className="mb-6 rounded-[1.75rem] border border-white/12 bg-slate-950/64 p-5 shadow-[0_24px_78px_rgba(15,23,42,0.24)] backdrop-blur-md" data-emi-proof="landing_clarity_panel">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">At a glance</p>
                <p className="mb-4 text-[15px] leading-relaxed text-slate-100/90 sm:text-[16px] [text-wrap:pretty]">
                  Build relationships during signal windows before mandate announcements.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <article className="rounded-2xl border border-white/12 bg-white/[0.07] p-3 sm:p-4 shadow-[0_16px_54px_rgba(15,23,42,0.2)]">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Opportunity Timing Gap</p>
                    <div className="pb-1">
                      <OpportunityTimingGapChart />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <ChartZoomModal buttonLabel="Open full chart" title="Opportunity Timing Gap">
                        <OpportunityTimingGapChart className="h-auto w-full max-w-[900px]" />
                      </ChartZoomModal>
                    </div>
                  </article>

                  <article className="rounded-2xl border border-white/12 bg-white/[0.07] p-3 sm:p-4 shadow-[0_16px_54px_rgba(15,23,42,0.2)]">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Role Landing Probability</p>
                    <div className="pb-1">
                      <RoleLandingProbabilityChart />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <ChartZoomModal buttonLabel="Open full chart" title="Role Landing Probability">
                        <RoleLandingProbabilityChart className="h-auto w-full max-w-[980px]" />
                      </ChartZoomModal>
                    </div>
                  </article>
                </div>
                <Link
                  href="/demo/executive-brief"
                  className="inline-flex items-center mt-4 text-[13px] font-semibold text-orange-300 hover:text-orange-200 transition-colors py-2.5"
                >
                  See prep brief in 60 seconds
                </Link>
              </div>
            )}

            {isExecutivesPage && !isPrimaryExecutivesPage && (
              <section className="mb-6 rounded-[1.75rem] border border-white/12 bg-slate-950/64 p-5 shadow-[0_24px_78px_rgba(15,23,42,0.24)] backdrop-blur-md sm:p-6" aria-labelledby="executive-differentiation-title">
                <div className="flex flex-col gap-2 mb-5">
                  {executiveLaneBrand && (
                    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${executiveLaneBrand.badgeClass}`}>
                      {executiveLaneBrand.label}
                    </span>
                  )}
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">{isLeadershipLanePage ? 'Leadership platform capabilities' : 'Executive platform capabilities'}</p>
                  <h2 id="executive-differentiation-title" className="text-[22px] font-bold leading-snug text-white sm:text-[24px]">
                    All essentials in one operating view.
                  </h2>
                  <p className="max-w-3xl text-[14px] leading-relaxed text-slate-200/90">
                    {isLeadershipLanePage
                      ? 'Starting Monday is designed for leadership transitions that require earlier timing, sharper narrative control, and disciplined weekly execution.'
                      : 'Starting Monday is designed for executive-transition behavior: earlier timing, sharper mandate narrative, and disciplined weekly execution.'}
                  </p>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {EXECUTIVE_FEATURE_MATRIX.map((item) => {
                    const featureTitle = isLeadershipLanePage && item.feature === 'Executive signal intelligence'
                      ? 'Leadership signal intelligence'
                      : item.feature
                    const whatYouGet = isLeadershipLanePage && item.feature === 'Audience-specific narrative system'
                      ? 'One core story adapted for board members, search partners, CHROs, and leadership peers.'
                      : item.whatYouGet
                    const whyItMatters = isLeadershipLanePage && item.feature === 'Weekly operating cadence'
                      ? 'Sustained momentum replaces the stop-start pattern common in ad hoc leadership searches.'
                      : item.whyItMatters

                    return (
                    <article key={item.feature} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                      <p className="mb-2 text-[13px] font-semibold text-white">{featureTitle}</p>
                      <p className="mb-2 text-[12px] leading-relaxed text-slate-200/90">{whatYouGet}</p>
                      <p className="text-[12px] leading-relaxed text-emerald-100">{whyItMatters}</p>
                    </article>
                    )
                  })}
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <div className="grid grid-cols-1 border-b border-white/10 text-[11px] font-bold uppercase tracking-[0.1em] sm:grid-cols-[1.2fr_1fr_1fr]">
                    <p className="px-4 py-3 text-slate-300">Decision area</p>
                    <p className="border-t border-white/10 px-4 py-3 text-emerald-100 sm:border-t-0 sm:border-l">Starting Monday</p>
                    <p className="border-t border-white/10 px-4 py-3 text-slate-400 sm:border-t-0 sm:border-l">Typical job products</p>
                  </div>
                  {EXECUTIVE_DIFFERENTIATORS.map((row) => (
                    <div key={row.category} className="grid grid-cols-1 border-b border-white/10 last:border-b-0 sm:grid-cols-[1.2fr_1fr_1fr]">
                      <p className="px-4 py-3 text-[12px] font-semibold text-white">{row.category}</p>
                      <p className="border-t border-white/10 px-4 py-3 text-[12px] leading-relaxed text-slate-200/90 sm:border-t-0 sm:border-l">{isLeadershipLanePage && row.category === 'Conversation readiness' ? 'Preparation workflows for recruiter, board, and leadership dialogue.' : row.startingMonday}</p>
                      <p className="border-t border-white/10 px-4 py-3 text-[12px] leading-relaxed text-slate-400 sm:border-t-0 sm:border-l">{row.otherTools}</p>
                    </div>
                  ))}
                </div>

                {executiveLaneBrand && (
                  <div className={`mt-5 rounded-2xl border ${executiveLaneBrand.borderClass} ${executiveLaneBrand.panelClass} p-4 sm:p-5`}>
                    <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${executiveLaneBrand.proofToneClass} mb-2`}>
                      Trust and proof guardrails
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <article className="rounded-xl border border-white/15 bg-slate-950/55 p-3">
                        <p className="text-[12px] font-semibold text-white mb-1">Confidential by design</p>
                        <p className="text-[12px] leading-relaxed text-slate-300">Your identity, targets, and activity are not shared with employers or recruiters.</p>
                      </article>
                      <article className="rounded-xl border border-white/15 bg-slate-950/55 p-3">
                        <p className="text-[12px] font-semibold text-white mb-1">Claim discipline</p>
                        <p className="text-[12px] leading-relaxed text-slate-300">Numeric statements are denominator-aware and directional unless explicitly audited.</p>
                      </article>
                      <article className="rounded-xl border border-white/15 bg-slate-950/55 p-3">
                        <p className="text-[12px] font-semibold text-white mb-1">Evidence path</p>
                        <p className="text-[12px] leading-relaxed text-slate-300">Review method, references, and source notes before any decision gate.</p>
                      </article>
                    </div>
                    <p className="mt-3 text-[12px] leading-relaxed text-slate-200">
                      Source: Jan-May 2026 pilot cohorts with denominator and timeframe controls.{' '}
                      <Link href="/evidence-hub#coaching-effectiveness" className="underline underline-offset-2 hover:text-white">Evidence Hub</Link>
                    </p>
                  </div>
                )}
              </section>
            )}

            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              Private by default
            </p>
            <p className="mb-2 max-w-3xl text-sm leading-relaxed text-slate-300/85 [text-wrap:pretty]">
              Your search stays private by design. We never share your identity, targets, or activity with employers or recruiters, and your outreach planning remains visible only to you and explicitly invited collaborators.
            </p>
          </div>
        </section>

        {!isHomePage && !isPrimaryExecutivesPage && (
          <section id="next-step" data-emi-section="next_step_block" className="border-b border-white/10 bg-slate-950/80 px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-5xl mx-auto">
            {isManagerToolsPage ? (
              <>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Manager Tools next step</p>
                <h2 className="mb-6 text-[22px] font-bold leading-snug text-white">
                  For managers and executives in transition.
                </h2>
                <div className="mb-6 grid grid-cols-1 gap-3">
                  <TrackLink
                    href="/for-executives"
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'next_step_manager_tools_audience',
                      source_page: sourcePage,
                    }}
                    className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-orange-300/60 hover:bg-white/10"
                  >
                    <p className="text-[13px] font-semibold text-white">Managers and Executives</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-300">Built for active or near-term leadership transitions in the Manager Tools community.</p>
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
                    className="inline-flex items-center justify-center rounded-full bg-orange-400 px-6 py-3 text-[14px] font-bold text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-orange-300"
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
                    className="inline-flex items-center justify-center rounded-full border border-orange-300/70 px-6 py-3 text-[14px] font-bold text-orange-200 transition-colors hover:bg-orange-400/10"
                  >
                    Submit feedback
                  </TrackLink>
                </div>
              </>
            ) : isExecutivesPage ? (
              <>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">{isLeadershipLanePage ? 'Leader outcomes' : 'Executive outcomes'}</p>
                <h2 className="mb-2 text-[22px] font-bold leading-snug text-white">
                  Build momentum in the first 30 days.
                </h2>
                <p className="mb-6 max-w-3xl text-[14px] leading-relaxed text-slate-200/90">
                  Use your trial to sharpen narrative quality, improve conversation conversion, and create a weekly operating cadence you can keep through offer-stage decisions.
                </p>
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[12px] font-semibold text-white">Week 1</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-300">Mandate narrative, role filter, and priority relationship map.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[12px] font-semibold text-white">Week 2</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-300">Signal tracking and audience-specific prep for recruiter and board conversations.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[12px] font-semibold text-white">Week 3-4</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-300">Consistent outreach rhythm and clearer conversion into high-quality next steps.</p>
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
                    className="inline-flex items-center justify-center rounded-full bg-orange-400 px-6 py-3 text-[14px] font-bold text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-orange-300"
                  >
                    Start your free trial
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
                    className="inline-flex items-center justify-center rounded-full border border-orange-300/70 px-6 py-3 text-[14px] font-bold text-orange-200 transition-colors hover:bg-orange-400/10"
                  >
                    {isLeadershipLanePage ? 'Preview leader brief' : 'Preview executive brief'}
                  </TrackLink>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Learn more</p>
                <h2 className="mb-2 text-[22px] font-bold leading-snug text-white">
                  {secondaryNextStep.title}
                </h2>
                <p className="mb-6 max-w-3xl text-[14px] leading-relaxed text-slate-200/90">
                  {secondaryNextStep.body}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <TrackLink
                    href={secondaryNextStep.href}
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: secondaryNextStep.channel,
                      cta_label: 'next_step_learn_more',
                      source_page: sourcePage,
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-orange-300/70 px-6 py-3 text-[14px] font-bold text-orange-200 transition-colors hover:bg-orange-400/10"
                  >
                    {secondaryNextStep.ctaLabel}
                  </TrackLink>
                </div>
              </>
            )}
              <p className={isManagerToolsPage ? 'mt-3 text-[12px] whitespace-pre-line text-slate-400' : 'mt-3 text-[12px] text-slate-400'}>{hero.trialNote}</p>
            </div>
          </section>
        )}

        {isPrimaryExecutivesPage && (
          <>
            <section className="border-b border-white/10 bg-slate-950/80 px-4 py-14 sm:px-6">
              <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">The Starting Monday difference</p>
                  <h2 className="mt-3 max-w-2xl text-[28px] font-semibold leading-[1.1] text-white sm:text-[36px]">
                    A calmer executive search feels better and performs better.
                  </h2>
                  <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-200/90">
                    You deserve a process that is private, composed, and easier to manage. We keep relationship management visible, reduce cognitive load, and make the next move feel obvious.
                  </p>

                  <div className="mt-8 border-y border-white/10 text-[13px] leading-relaxed text-slate-200/90">
                    <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <span>Area</span>
                      <span>Starting Monday</span>
                      <span>Typical search</span>
                    </div>
                    {[
                      ['Role timing', 'Start before the role is public.', 'React after demand is already crowded.'],
                      ['Narrative', 'Keep one clear story for boards, partners, and recruiters.', 'Rewrite the pitch for every conversation.'],
                      ['Relationship management', 'See who matters, who is warming, and what to do next.', 'Track contacts without a clear operating rhythm.'],
                      ['Feeling', 'Composed, private, and easier to keep moving.', 'Noisy, urgent, and mentally expensive.'],
                    ].map(([label, withUs, typical]) => (
                      <div key={label} className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 border-t border-white/10 py-4">
                        <span className="font-semibold text-white">{label}</span>
                        <span>{withUs}</span>
                        <span className="text-slate-300">{typical}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:pt-2">
                  <figure className="mx-auto w-[66%] max-w-[320px] rounded-[18px] border border-[#d9ccbc]/70 bg-[#f4ede2] p-1.5 shadow-[0_16px_30px_rgba(15,23,42,0.14)] sm:w-[58%] sm:max-w-[340px] lg:mr-0 lg:ml-auto lg:w-[52%] lg:max-w-[360px]">
                    <img
                      src="/executive-reference.png"
                      alt="Executive seated at a desk reviewing documents in a refined home office"
                      className="block w-full rounded-[14px]"
                      loading="eager"
                    />
                  </figure>
                </div>
              </div>
            </section>

            <section className="border-b border-white/10 bg-slate-950/80 px-4 py-14 sm:px-6">
              <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">Starting Monday difference</p>
                  <h2 className="mt-3 max-w-2xl text-[28px] font-semibold leading-[1.1] text-white sm:text-[34px]">
                    Click into the briefs that reduce the work, not the signal.
                  </h2>
                  <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-200/90">
                    Open the parts that matter most: the brief, the onboarding flow, the relationship momentum layer, and the weekly operating rhythm.
                  </p>
                  <div className="mt-8">
                    <TrackLink
                      href="/learn-more"
                      event={EVENT_NAMES.channelEntryClicked}
                      logToUserEvents
                      properties={{
                        channel: 'executives',
                        cta_label: 'executive_learn_more',
                        source_page: sourcePage,
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-orange-300/70 bg-orange-400 px-6 py-3 text-[14px] font-bold text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-orange-300"
                    >
                      Learn more
                    </TrackLink>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: 'Executive brief',
                      body: 'A concise view of timing, role clarity, and the first conversation shape.',
                    },
                    {
                      title: 'Onboarding ease',
                      body: 'See how the first setup step stays short so you can move without friction.',
                    },
                    {
                      title: 'Relationship momentum',
                      body: 'Track the people, touches, and next steps that keep the search warm.',
                    },
                    {
                      title: 'Weekly cadence',
                      body: 'Review the rhythm that keeps the process calm enough to sustain.',
                    },
                  ].map((item) => (
                    <details key={item.title} className="group border-b border-white/10 pb-4 pt-4">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-semibold text-white">
                        <span>{item.title}</span>
                        <span className="mt-0.5 shrink-0 text-slate-400 transition-transform group-open:rotate-180">â–¾</span>
                      </summary>
                      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-200/90">
                        {item.body}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {faqs && faqs.length > 0 && !isHomePage && !isPrimaryExecutivesPage && (
          <section className="border-b border-white/10 bg-slate-950/80 px-4 py-12 sm:px-6" aria-labelledby="faq-heading">
            <div className="max-w-5xl mx-auto">
              <h2 id="faq-heading" className="text-[22px] font-bold text-white mb-6">Common questions</h2>
              <div className="space-y-3">
                {faqs.map((f) => (
                  <details key={f.question} className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 group">
                    <summary className="list-none cursor-pointer text-[14px] font-semibold text-white flex justify-between items-start gap-3">
                      <span>{f.question}</span>
                      <span className="mt-0.5 shrink-0 text-slate-400 group-open:rotate-180 transition-transform">â–¾</span>
                    </summary>
                    <p className="mt-3 text-[13px] leading-relaxed text-slate-200 [text-wrap:pretty]">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {isPrimaryExecutivesPage && (
          <section className="border-b border-white/10 bg-slate-950/80 px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">Common questions</p>
              <h2 className="mt-3 max-w-2xl text-[24px] font-semibold leading-[1.12] text-white sm:text-[28px]">
                If you want the details, start with Learn more.
              </h2>
              <div className="mt-6">
                <TrackLink
                  href="/learn-more"
                  event={EVENT_NAMES.channelEntryClicked}
                  logToUserEvents
                  properties={{
                    channel: 'executives',
                    cta_label: 'executive_common_questions_learn_more',
                    source_page: sourcePage,
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-white/16 px-5 py-2.5 text-[13px] font-semibold tracking-[0.01em] text-slate-100 transition-colors hover:border-orange-300/60 hover:bg-orange-400/10 hover:text-white"
                >
                  Learn more
                </TrackLink>
              </div>
            </div>
          </section>
        )}

        {faqs && faqs.length > 0 && !isHomePage && (
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

        {isHomePage && (
          <section aria-label="Homepage citation" className="border-t border-white/10 bg-slate-950/80 px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <p id="citation-1" className="scroll-mt-24 text-[11px] leading-relaxed text-slate-300/85 sm:text-[12px]">
                <span className="font-semibold text-slate-100">1.</span>{' '}
                Burks SV, Cowgill B, Hoffman M, Housman M.{' '}
                <em>The Value of Hiring through Employee Referrals.</em>{' '}
                <span className="text-slate-400">The Quarterly Journal of Economics</span>, 2015;130(2):805-839. DOI:{' '}
                <a
                  href="https://doi.org/10.1093/qje/qjv010"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-white"
                >
                  10.1093/qje/qjv010
                </a>
              </p>
            </div>
          </section>
        )}

        {showFooter && <SiteFooter centered={useCenteredFooter} />}
      </main>
    </div>
  )
}

