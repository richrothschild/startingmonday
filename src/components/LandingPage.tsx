import Link from 'next/link'
import Image from 'next/image'
import { TrackLink } from '@/components/TrackLink'
import { HomepageBriefTeaser } from '@/components/HomepageBriefTeaser'
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
    feature: 'Leadership signal intelligence',
    whatYouGet: 'Track role-shaping movement before your dream role is publicly obvious.',
    whyItMatters: 'You enter while the role is still being defined, not after the shortlist is crowded.',
  },
  {
    feature: 'Audience-specific narrative system',
    whatYouGet: 'One core story adapted for board members, search partners, CHROs, and leadership peers.',
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
    startingMonday: 'Role-level narrative tuned for multiple leadership audiences.',
    otherTools: 'Resume/profile optimization oriented toward broad applicant pools.',
  },
  {
    category: 'Execution model',
    startingMonday: 'Weekly operating system with accountability to outcomes.',
    otherTools: 'Task lists and alerts without a strategic leadership cadence.',
  },
  {
    category: 'Conversation readiness',
    startingMonday: 'Preparation workflows for recruiter, board, and C-suite dialogue.',
    otherTools: 'Generic interview tips that rarely map to leadership-level role discussions.',
  },
]

function OpportunityTimingGapChart({ className = 'h-auto w-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 280" className={className} role="img" aria-label="Opportunity timing gap: when you enter vs typical candidates">
      {/* Subtle background gradient definition */}
      <defs>
        <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#0f172a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="startingMondayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac" stopOpacity="1" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="typicalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="1" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Main timeline with subtle background */}
      <rect x="40" y="125" width="480" height="36" fill="url(#timelineGradient)" rx="4" />
      <line x1="40" y1="143" x2="520" y2="143" stroke="#475569" strokeWidth="1.5" />

      {/* Timeline dots - more refined */}
      <circle cx="55" cy="143" r="5.5" fill="#64748b" opacity="0.8" />
      <circle cx="130" cy="143" r="5.5" fill="#64748b" opacity="0.8" />
      <circle cx="205" cy="143" r="5.5" fill="#64748b" opacity="0.8" />
      <circle cx="280" cy="143" r="5.5" fill="#64748b" opacity="0.8" />
      <circle cx="355" cy="143" r="5.5" fill="#64748b" opacity="0.8" />
      <circle cx="430" cy="143" r="5.5" fill="#64748b" opacity="0.8" />
      <circle cx="505" cy="143" r="5.5" fill="#64748b" opacity="0.8" />

      {/* Phase labels - refined typography */}
      <text x="55" y="175" fill="#cbd5e1" fontSize="12" fontWeight="500" textAnchor="middle" letterSpacing="0.3">Signal</text>
      <text x="130" y="190" fill="#cbd5e1" fontSize="12" fontWeight="500" textAnchor="middle" letterSpacing="0.3">Shape</text>
      <text x="205" y="175" fill="#cbd5e1" fontSize="12" fontWeight="500" textAnchor="middle" letterSpacing="0.3">Outreach</text>
      <text x="280" y="190" fill="#cbd5e1" fontSize="12" fontWeight="500" textAnchor="middle" letterSpacing="0.3">Open</text>
      <text x="355" y="175" fill="#cbd5e1" fontSize="12" fontWeight="500" textAnchor="middle" letterSpacing="0.3">Interviews</text>
      <text x="430" y="190" fill="#cbd5e1" fontSize="12" fontWeight="500" textAnchor="middle" letterSpacing="0.3">Selection</text>
      <text x="505" y="175" fill="#cbd5e1" fontSize="12" fontWeight="500" textAnchor="middle" letterSpacing="0.3">Start</text>

      {/* Starting Monday entry point - refined */}
      <g>
        <line x1="130" y1="110" x2="130" y2="127" stroke="url(#startingMondayGradient)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="130" cy="105" r="6.5" fill="#86efac" stroke="#4ade80" strokeWidth="1.5" />
        <text x="130" y="32" fill="#86efac" fontSize="13" fontWeight="600" textAnchor="middle" letterSpacing="0.5">Starting Monday</text>
        <text x="130" y="49" fill="#9ca3af" fontSize="11" textAnchor="middle">enters before</text>
        <text x="130" y="62" fill="#9ca3af" fontSize="11" textAnchor="middle">decision-makers</text>
        <text x="130" y="75" fill="#9ca3af" fontSize="11" textAnchor="middle">form shortlist</text>
      </g>

      {/* Typical candidates entry point - refined */}
      <g>
        <line x1="280" y1="110" x2="280" y2="127" stroke="url(#typicalGradient)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="280" cy="105" r="6.5" fill="#fb923c" stroke="#f97316" strokeWidth="1.5" />
        <text x="280" y="32" fill="#fb923c" fontSize="13" fontWeight="600" textAnchor="middle" letterSpacing="0.5">Typical candidates</text>
        <text x="280" y="49" fill="#9ca3af" fontSize="11" textAnchor="middle">enter when role</text>
        <text x="280" y="62" fill="#9ca3af" fontSize="11" textAnchor="middle">is publicly posted</text>
        <text x="280" y="75" fill="#9ca3af" fontSize="11" textAnchor="middle">& widely known</text>
      </g>

      {/* Advantage callout - refined */}
      <rect x="40" y="225" width="480" height="1" fill="#475569" opacity="0.4" />
      <text x="280" y="250" fill="#cbd5e1" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="0.3">
        Starting early: when role is still taking shape • Better odds: fewer qualified candidates
      </text>
      <text x="280" y="268" fill="#cbd5e1" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="0.3">
        Advantage: already known and trusted
      </text>
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

export function LandingPage({ hero, faqs, proofHighlights, sourcePage = '/', experimentVariant = 'control' }: LandingPageProps) {
  const isManagerToolsPage = sourcePage === '/managertools'
  const isHomePage = sourcePage === '/' || isManagerToolsPage
  const isExecutivesPage = sourcePage === '/for-executives' || sourcePage.startsWith('/for-executives/')
  const isRisingLeadersPage = sourcePage === '/for-vp-technology' || sourcePage === '/for-leaders'
  const useCenteredFooter = isManagerToolsPage || isExecutivesPage
  const executiveLaneBrand = executiveLaneFromSource(sourcePage)
  const isLeadershipLanePage = executiveLaneBrand?.key === 'leadership'
  const heroPrimaryHref = isManagerToolsPage
    ? MANAGERTOOLS_SIGNUP_URL
    : isExecutivesPage
      ? '/shortlist-sprint?utm_source=executives&utm_medium=landing&utm_campaign=shortlist-sprint'
      : '/concierge?program=beta&from=landing'
  const heroPrimaryLabel = isManagerToolsPage
    ? 'Try free for 60 days'
    : isExecutivesPage
      ? 'Start 7-day shortlist sprint'
      : 'Start Now'

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_34%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.95)_54%,_rgba(10,15,28,0.98)_100%)]" />
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-white/95 transition-opacity hover:opacity-80 inline-flex items-center min-h-[48px]" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href={isManagerToolsPage ? MANAGERTOOLS_SIGNUP_URL : '/signup'}
              className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[13px] font-bold px-3.5 min-h-[48px] rounded hover:bg-orange-600 transition-colors"
              aria-label={isManagerToolsPage ? 'Try free for 60 days' : isHomePage ? 'Try free' : 'Sign up'}
            >
              {isManagerToolsPage ? 'Try free for 60 days' : isHomePage ? 'Try free' : 'Sign Up'}
            </Link>
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors inline-flex items-center min-h-[48px] px-3" aria-label="Log in">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        <section id="core-clarity" data-emi-section="clarity_block" className="px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <div className="mx-auto max-w-5xl">
            {isManagerToolsPage && (
              <p className="mb-5 text-[1.4rem] font-semibold leading-tight tracking-tight text-orange-100 sm:text-[1.75rem]">
                Welcome Manager Tools
              </p>
            )}
            {isHomePage ? (
              <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_390px] lg:items-start">
                <div className="rounded-[2rem] border border-white/12 bg-slate-950/82 p-6 shadow-[0_38px_130px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:p-8 lg:p-10">
                  <p className="max-w-3xl text-[1.15rem] font-semibold leading-[1.18] tracking-tight text-orange-200/90 sm:text-[1.35rem] lg:text-[1.55rem]">
                    {hero.eyebrow}
                  </p>
                  <h1 className="mt-4 max-w-4xl text-[2rem] font-bold leading-[1.04] tracking-tight text-white sm:text-[2.6rem] lg:text-[3.4rem]">
                    {hero.h1Lines.map((line, i) => (
                      <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
                    ))}
                  </h1>
                  {hero.bodyPreamble && !isHomePage && (
                    <p className="mt-4 max-w-3xl text-[12px] font-semibold uppercase tracking-[0.12em] text-orange-200/90 sm:text-[13px]">
                      {hero.bodyPreamble}
                    </p>
                  )}
                  <p className="mt-5 max-w-4xl text-[1.35rem] font-semibold leading-[1.12] tracking-tight text-slate-100/95 sm:text-[1.7rem] lg:text-[2.24rem]">
                    {hero.body}
                  </p>
                  {hero.competitiveEdge && (
                    <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-slate-300/90 sm:text-[15px] [text-wrap:pretty]">
                      {hero.competitiveEdge}
                    </p>
                  )}
                </div>
                <div className="relative mx-auto h-[480px] w-full max-w-[390px] overflow-hidden rounded-[1.6rem] border border-white/12 shadow-[0_30px_72px_rgba(2,6,23,0.42)] lg:mx-0 lg:justify-self-end">
                  <Image
                    src="/hero-previews/hero-final-locked.png"
                    alt="Stylized leadership sketch visual"
                    fill
                    sizes="(max-width: 640px) 92vw, 390px"
                    preload
                    fetchPriority="high"
                    quality={60}
                    className="object-cover object-top [filter:brightness(1.08)_contrast(0.95)_saturate(0.9)]"
                  />
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
              <p className="mt-6 mb-10 max-w-3xl text-[18px] font-semibold leading-relaxed text-slate-300 [text-wrap:pretty] sm:text-[20px]">
                The posting is public. The decision is usually not. Move earlier, with the right relationships already in motion.
              </p>
            )}

            {isHomePage && (
              <section
                className="mb-12"
                aria-labelledby="homepage-path-title"
              >
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Choose your path</p>
                <h2 id="homepage-path-title" className="mb-2 text-[24px] font-bold leading-snug text-white sm:text-[28px]">
                  Start with the search strategy built to win.
                </h2>
                <p className="mb-5 max-w-3xl text-[14px] leading-relaxed text-slate-200/90">Select the leader track or partner workflow aligned to your next move.</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Link
                    href="/for-executives"
                    className="inline-flex items-center rounded-full border border-orange-300/60 px-4 py-2 text-[12px] font-semibold text-orange-100 transition-colors hover:bg-orange-400/10 hover:text-white"
                  >
                    Leaders
                  </Link>
                  <Link
                    href="/partners"
                    className="inline-flex items-center rounded-full border border-orange-300/60 px-4 py-2 text-[12px] font-semibold text-orange-100 transition-colors hover:bg-orange-400/10 hover:text-white"
                  >
                    Partners
                  </Link>
                  <Link
                    href="/learn-more"
                    className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold text-slate-200 transition-colors hover:border-orange-300/70 hover:text-white"
                  >
                    Learn how early-role signals work
                  </Link>
                </div>
                <p className="text-[12px] text-slate-300">Free for 30 days. No credit card required.</p>
              </section>
            )}



            {isExecutivesPage && (
              <section className="mb-6 rounded-[1.75rem] border border-white/12 bg-slate-950/64 p-5 shadow-[0_24px_78px_rgba(15,23,42,0.24)] backdrop-blur-md sm:p-6" aria-labelledby="executive-differentiation-title">
                <div className="flex flex-col gap-2 mb-5">
                  {executiveLaneBrand && (
                    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${executiveLaneBrand.badgeClass}`}>
                      {executiveLaneBrand.label}
                    </span>
                  )}
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">{isLeadershipLanePage ? 'Leadership platform capabilities' : 'Leader platform capabilities'}</p>
                  <h2 id="executive-differentiation-title" className="text-[22px] font-bold leading-snug text-white sm:text-[24px]">
                    All essentials in one operating view.
                  </h2>
                  <p className="max-w-3xl text-[14px] leading-relaxed text-slate-200/90">
                    {isLeadershipLanePage
                      ? 'Starting Monday is designed for leadership transitions that require earlier timing, sharper narrative control, and disciplined weekly execution.'
                      : 'Starting Monday is designed for leadership-transition behavior: earlier timing, sharper role narrative, and disciplined weekly execution.'}
                  </p>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {EXECUTIVE_FEATURE_MATRIX.map((item) => {
                    const featureTitle = isLeadershipLanePage && item.feature === 'Leadership signal intelligence'
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
                      <Link href="/method-and-evidence" className="underline underline-offset-2 hover:text-white">Method and evidence</Link>
                      {' · '}
                      <Link href="/evidence-room" className="underline underline-offset-2 hover:text-white">Evidence room</Link>
                    </p>
                  </div>
                )}
              </section>
            )}


          </div>
        </section>

        {isHomePage && (
          <>
            {/* SIGNAL SECTION: Market opportunity and timing advantage */}
            <section className="border-b border-white/10 bg-slate-950/80 px-4 py-16 sm:px-6 sm:py-24 [content-visibility:auto] [contain-intrinsic-size:1px_840px]">
              <div className="mx-auto max-w-5xl">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">The Signal</p>
                <p className="mb-6 text-[14px] leading-relaxed text-slate-300">The best opportunities are decided in private before they are posted in public.</p>
                <p className="mb-12 max-w-3xl text-[16px] leading-relaxed text-slate-200">
                  By the time a role is posted, the internal conversation has already advanced. Most senior leaders already have deep networks and proven reputations. Starting Monday helps you convert that foundation into action at the exact right moment.
                </p>

                <div className="mb-12">
                  <h3 className="font-serif text-[22px] sm:text-[26px] leading-tight text-white mb-8">Entering before the role opens materially improves your odds.</h3>
                  <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden p-6 sm:p-8 animate-in fade-in duration-700">
                    <OpportunityTimingGapChart />
                  </div>
                </div>

                <p className="mb-10 text-[14px] leading-relaxed text-slate-300">
                  <span className="font-semibold text-white">Why this matters:</span> Instead of competing in the posted job window with dozens of other qualified candidates, you're already in the conversation when decision-makers are shaping your dream role. That's not a disadvantage. That's your entire advantage.
                </p>

                <Link
                  href="/evidence-hub#early-signals"
                  className="inline-flex items-center rounded-full bg-orange-500 px-6 py-3 text-[14px] font-semibold text-slate-950 transition-colors hover:bg-orange-600"
                >
                  Explore the evidence →
                </Link>
              </div>
            </section>

            {/* ADVOCATES SECTION: Create advocates to get on shortlist */}
            <section className="border-b border-white/10 bg-slate-950/80 px-4 py-16 sm:px-6 sm:py-24 [content-visibility:auto] [contain-intrinsic-size:1px_900px]">
              <div className="mx-auto max-w-5xl">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Create Advocates</p>
                <h2 className="mb-2 text-[24px] font-bold leading-snug text-white sm:text-[28px]">
                  Get on the shortlist through relationships, not job boards.
                </h2>
                <p className="mb-4 max-w-3xl text-[14px] leading-relaxed text-slate-300">Once you see a role taking shape, do not start by applying. Start by building advocates inside the company, before the process formalizes.</p>
                <p className="mb-8 max-w-3xl text-[15px] leading-relaxed text-slate-200/90">
                  Most senior leaders already have strong networks and earned credibility. The difference is direction and timing. Starting Monday helps you identify the people shaping the mandate, engage with relevance, and compound trust before the shortlist hardens.
                </p>

                <div className="mb-8 space-y-4">
                  <div className="text-[14px] leading-relaxed text-slate-200 space-y-3">
                    <div className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">01</span>
                      <span><span className="font-semibold text-white">Map mandate influence, not job titles.</span> Find budget owners, strategic operators, and trusted advisors shaping the decision before hiring opens.</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">02</span>
                      <span><span className="font-semibold text-white">Engage early with problem-level context.</span> Show you understand the business pressure behind the role, not just the title.</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">03</span>
                      <span><span className="font-semibold text-white">Run weekly advocate momentum.</span> Track who is championing you, where conversations are advancing, and which relationship needs the next high-value touch.</span>
                    </div>
                  </div>
                </div>

                <p className="text-[13px] leading-relaxed text-slate-300">
                  <span className="font-semibold text-white">Why it works:</span> The shortlist is often shaped before the posting goes live. With the right advocates engaged early, you are not entering late. You are already inside the decision.
                </p>
              </div>
            </section>

            {/* MONDAY SECTION: Start Monday - cadence and execution */}
            <section className="border-b border-white/10 bg-slate-950/80 px-4 py-16 sm:px-6 sm:py-24 animate-in fade-in duration-1000 delay-100 [content-visibility:auto] [contain-intrinsic-size:1px_900px]">
              <div className="mx-auto max-w-5xl">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Start Monday</p>
                <h2 className="mb-2 text-[24px] font-bold leading-snug text-white sm:text-[28px]">
                  Momentum is not random. It is scheduled.
                </h2>
                <p className="mb-4 max-w-3xl text-[14px] leading-relaxed text-slate-300">Most searches stall between strong conversations. Starting Monday keeps momentum moving so progress does not reset each week.</p>
                <p className="mb-4 max-w-3xl text-[13px] leading-relaxed text-slate-300">
                  Want a concrete walkthrough?{' '}
                  <Link href="#example-walkthrough" className="underline underline-offset-2 hover:text-white">
                    See one example
                  </Link>
                  .
                </p>
                <p className="mb-8 max-w-3xl text-[15px] leading-relaxed text-slate-200/90">
                  Starting Monday gives you a repeatable rhythm. Revisit priorities weekly, sharpen your message from real feedback, and move key relationships forward with intent.
                </p>

                <div className="mb-8 space-y-4">
                  <div className="text-[14px] leading-relaxed text-slate-200 space-y-3">
                    <div className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">01</span>
                      <span><span className="font-semibold text-white">Weekly momentum map.</span> See where conversations are advancing and where action is needed now.</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">02</span>
                      <span><span className="font-semibold text-white">Narrative precision loop.</span> Refine proof points so each conversation is clearer than the last.</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">03</span>
                      <span><span className="font-semibold text-white">Sponsorship engine.</span> Convert warm interest into active internal support through consistent follow-through.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[13px] leading-relaxed text-slate-300">
                    <span className="font-semibold text-white">The outcome:</span> Your progress becomes cumulative, not cyclical.
                  </p>
                </div>
              </div>
            </section>

            {/* STORY SECTION: Tell your narrative */}
            <HomepageBriefTeaser />

            <section className="px-4 pb-12 sm:px-6 sm:pb-14">
              <div className="mx-auto max-w-5xl">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 shadow-[0_10px_30px_rgba(2,6,23,0.12)] sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">Try free</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-slate-200/85">
                        See if the flow fits your search.
                      </p>
                    </div>
                  <Link
                    href={isManagerToolsPage ? MANAGERTOOLS_SIGNUP_URL : '/signup?utm_source=homepage&utm_medium=landing&utm_campaign=homepage_bottom_cta'}
                    className="inline-flex min-w-[8.75rem] items-center justify-center rounded-full border border-orange-300/70 bg-orange-400 px-6 py-2.5 text-center text-[13px] font-semibold tracking-[0.01em] text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-orange-300"
                  >
                    {isManagerToolsPage ? 'Try free for 60 days' : 'Try free'}
                  </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {!isHomePage && (
          <section id="next-step" data-emi-section="next_step_block" className="border-b border-white/10 bg-slate-950/80 px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-5xl mx-auto">
              {isManagerToolsPage ? (
                <>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Manager Tools next step</p>
                  <h2 className="mb-6 text-[22px] font-bold leading-snug text-white">
                    For managers and leaders in transition.
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
                      <p className="text-[13px] font-semibold text-white">Managers and Leaders</p>
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
                        Start 60-day free access
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
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Leader outcomes</p>
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
                    Preview leader brief
                  </TrackLink>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Why it feels different</p>
                <h2 className="mb-4 text-[24px] font-bold leading-tight text-white sm:text-[28px]">
                  Most leaders search in isolation. Starting Monday helps you build the relationships that matter.
                </h2>
                <p className="mb-8 max-w-3xl text-[15px] leading-relaxed text-slate-200/90">
                  You're not casting nets into crowded windows. You're having targeted conversations with decision-makers before the market even knows the role exists. Starting Monday gives you clarity on who shapes real outcomes, focus on genuine relationships over noise, and control over timing when mandates crystallize. The difference feels immediate: by week one, you've moved from overwhelm to confidence, from scattered outreach to relationship leadership that converts.
                </p>
                <div className="mb-8 space-y-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-200">What shifts</p>
                  <ol className="space-y-3 text-[14px] leading-relaxed text-slate-200">
                    <li className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">01</span>
                      <span>From isolated searching to strategic relationship building. You know who matters.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">02</span>
                      <span>From scattered outreach to one refined narrative. Your authentic story, consistently delivered.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="font-semibold text-orange-300 shrink-0">03</span>
                      <span>From hoping for outcomes to tracking real progress weekly. Relationships that convert.</span>
                    </li>
                  </ol>
                </div>
              </>
            )}
            <p className="mt-3 text-[12px] text-slate-400">{hero.trialNote}</p>
            </div>
          </section>
        )}

        <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-10 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className={useCenteredFooter ? 'flex flex-col items-center gap-5' : 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'}>
              <span className={useCenteredFooter ? 'text-[15px] font-bold tracking-[0.14em] uppercase text-slate-400 text-center' : 'text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400'}>
                <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
              </span>
              <div className={useCenteredFooter ? 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3 text-[12px] text-slate-400 justify-items-center text-center' : 'flex items-center gap-4 sm:gap-5 flex-wrap text-[12px] text-slate-400'}>
                <Link href="/evidence-hub" className="hover:text-slate-300 transition-colors py-2.5">Evidence hub</Link>
                <Link href="/blog" className="hover:text-slate-300 transition-colors py-2.5">Blog</Link>
                <Link href="/about" className="hover:text-slate-300 transition-colors py-2.5">About</Link>
                <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors py-2.5">LinkedIn</a>
                <Link href="/security" className="hover:text-slate-300 transition-colors py-2.5">Security</Link>
                <Link href="/privacy" className="hover:text-slate-300 transition-colors py-2.5">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-slate-300 transition-colors py-2.5">Terms</Link>
              </div>
            </div>

            {useCenteredFooter ? (
              <p className="text-[11px] text-slate-500 mt-5 text-center">
                Privacy-first by design. No sale of user data, ever. {' '}|{' '} &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-5">Privacy-first by design. No sale of user data, ever. {' '}|{' '} &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.</p>
            )}
          </div>
        </footer>
      </main>
    </div>
  )
}
