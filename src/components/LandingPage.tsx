import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
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
  experimentVariant?: 'control' | 'proof_first'
}

const CHANNEL_BEST_FOR: Record<string, string> = {
  executives: 'Best for active or near-term C-suite transitions',
  coaches: 'Best for coach-led execution between client sessions',
  outplacement: 'Best for cohort delivery and measurable 30-day momentum',
  search_firms: 'Best for retained-search kickoff quality and shortlist speed',
}

const MANAGERTOOLS_SIGNUP_URL = '/signup?utm_source=managertools&utm_medium=newsletter&utm_campaign=horstman-june2026'

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

export function LandingPage({ hero, faqs, rolePathPriorityByCtaKey, proofHighlights, sourcePage = '/', experimentVariant = 'control' }: LandingPageProps) {
  const isHomePage = sourcePage === '/'
  const isExecutivesPage = sourcePage === '/for-executives'
  const isManagerToolsPage = sourcePage === '/managertools'
  const useCenteredFooter = isManagerToolsPage || isExecutivesPage
  const heroPrimaryHref = isManagerToolsPage
    ? MANAGERTOOLS_SIGNUP_URL
    : isExecutivesPage
      ? '/signup?utm_source=executives&utm_medium=landing&utm_campaign=executive-page'
      : '/concierge?program=beta&from=landing'
  const heroPrimaryLabel = isManagerToolsPage
    ? 'Start 90-day free access'
    : isExecutivesPage
      ? 'Start your free trial'
      : 'Start Now'
  void rolePathPriorityByCtaKey

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_34%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.95)_54%,_rgba(10,15,28,0.98)_100%)]" />
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/95 transition-opacity hover:opacity-80" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/features" className="text-[12px] font-semibold text-slate-300 hover:text-white transition-colors" aria-label="Open docs hub">
              Docs
            </Link>
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

      <main className="relative">
        <section id="core-clarity" data-emi-section="clarity_block" className="px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <div className="mx-auto max-w-5xl">
            {isHomePage ? (
              <div className="mb-8 rounded-[2rem] border border-white/12 bg-slate-950/82 p-6 shadow-[0_38px_130px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:p-8 lg:p-10">
                <p className="max-w-3xl text-[1.15rem] font-semibold leading-[1.18] tracking-tight text-orange-200/90 sm:text-[1.35rem] lg:text-[1.55rem]">
                  {hero.eyebrow}
                </p>
                <h1 className="mt-4 max-w-4xl text-[2rem] font-bold leading-[1.04] tracking-tight text-white sm:text-[2.6rem] lg:text-[3.4rem]">
                  {hero.h1Lines.map((line, i) => (
                    <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
                  ))}
                </h1>
                <p className="mt-5 max-w-4xl text-[1.35rem] font-semibold leading-[1.12] tracking-tight text-slate-100/95 sm:text-[1.7rem] lg:text-[2.24rem]">
                  {hero.body}
                </p>
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

            {proofHighlights && proofHighlights.length > 0 && (
              <p className="mb-6 text-[14px] leading-relaxed text-slate-100 sm:text-[15px]" data-emi-proof="landing_micro_proof">
                <span className="font-semibold text-orange-200">Proof:</span> Executives maintain disciplined narratives and enter conversations grounded in company context.
              </p>
            )}

            {experimentVariant !== 'proof_first' && proofHighlights && proofHighlights.length > 0 && (
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3" data-emi-proof="executive_outcomes_grid">
                {proofHighlights.map((item) => (
                  <article key={item.metric} className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
                    <p className="mb-2 text-[12px] font-semibold leading-snug text-orange-100">{item.metric}</p>
                    <p className="text-[12px] leading-relaxed text-slate-200/90">{item.detail}</p>
                  </article>
                ))}
              </div>
            )}

            {proofHighlights && proofHighlights.length > 0 && (
              <p className="mb-6 text-[12px] leading-relaxed text-slate-200">
                Source: Jan-May 2026 pilot cohorts with published method notes and attribution controls.
              </p>
            )}

            <div className="mb-6 rounded-[1.75rem] border border-white/12 bg-slate-950/64 p-5 shadow-[0_24px_78px_rgba(15,23,42,0.24)] backdrop-blur-md" data-emi-proof="landing_clarity_panel">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">At a glance</p>
              <p className="mb-4 text-[15px] leading-relaxed text-slate-100/90 sm:text-[16px] [text-wrap:pretty]">
                Build relationships during signal windows before mandate announcements concentrate competition.
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
                className="inline-flex items-center mt-4 text-[13px] font-semibold text-orange-300 hover:text-orange-200 transition-colors"
              >
                See prep brief in 60 seconds
              </Link>
            </div>

            {isExecutivesPage && (
              <section className="mb-6 rounded-[1.75rem] border border-white/12 bg-slate-950/64 p-5 shadow-[0_24px_78px_rgba(15,23,42,0.24)] backdrop-blur-md sm:p-6" aria-labelledby="executive-differentiation-title">
                <div className="flex flex-col gap-2 mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Executive platform capabilities</p>
                  <h2 id="executive-differentiation-title" className="text-[22px] font-bold leading-snug text-white sm:text-[24px]">
                    All essentials in one operating view.
                  </h2>
                  <p className="max-w-3xl text-[14px] leading-relaxed text-slate-200/90">
                    Starting Monday is designed for executive-transition behavior: earlier timing, sharper mandate narrative, and disciplined weekly execution.
                  </p>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {EXECUTIVE_FEATURE_MATRIX.map((item) => (
                    <article key={item.feature} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                      <p className="mb-2 text-[13px] font-semibold text-white">{item.feature}</p>
                      <p className="mb-2 text-[12px] leading-relaxed text-slate-200/90">{item.whatYouGet}</p>
                      <p className="text-[12px] leading-relaxed text-emerald-100">{item.whyItMatters}</p>
                    </article>
                  ))}
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
                      <p className="border-t border-white/10 px-4 py-3 text-[12px] leading-relaxed text-slate-200/90 sm:border-t-0 sm:border-l">{row.startingMonday}</p>
                      <p className="border-t border-white/10 px-4 py-3 text-[12px] leading-relaxed text-slate-400 sm:border-t-0 sm:border-l">{row.otherTools}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              Private by default
            </p>
            <p className="mb-2 text-sm leading-relaxed text-slate-300/85 [text-wrap:pretty]">
              Your search stays private. We never share your identity, targets, or activity with employers or recruiters.
            </p>
          </div>
        </section>

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
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Executive outcomes</p>
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
                    Preview executive brief
                  </TrackLink>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-200">Choose your next step</p>
                <h2 className="mb-6 text-[22px] font-bold leading-snug text-white">
                  Pick a channel, then take the next step.
                </h2>
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CHANNEL_ROUTE_SPECS.map((spec) => (
                    <article
                      key={`next_${spec.channel}`}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-orange-300/60 hover:bg-white/10"
                    >
                      <p className="text-[13px] font-semibold text-white">{spec.label}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-300">{CHANNEL_BEST_FOR[spec.channel]}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <TrackLink
                          href={spec.route}
                          event={EVENT_NAMES.channelEntryClicked}
                          logToUserEvents
                          properties={{
                            channel: spec.channel,
                            cta_label: 'next_step_channel_card',
                            source_page: sourcePage,
                          }}
                          className="inline-flex items-center rounded bg-orange-400 px-3 py-1.5 text-[12px] font-semibold text-slate-950 transition-colors hover:bg-orange-300"
                        >
                          Open {spec.label}
                        </TrackLink>
                        <TrackLink
                          href={`/channels/feature-map?channel=${spec.channel}`}
                          event={EVENT_NAMES.channelEntryClicked}
                          logToUserEvents
                          properties={{
                            channel: spec.channel,
                            cta_label: 'next_step_channel_timeline',
                            source_page: sourcePage,
                            destination: '/channels/feature-map',
                          }}
                          className="text-[12px] font-semibold text-slate-200 underline underline-offset-2 transition-colors hover:text-white"
                        >
                          Preview {spec.label} timeline
                        </TrackLink>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <DeferredHowStartingMondayHelpsModal sourcePage={sourcePage} />
                  <TrackLink
                    href="/concierge?program=beta&from=landing"
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: 'executives',
                      cta_label: 'next_step_start_now',
                      source_page: sourcePage,
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-orange-300/70 px-6 py-3 text-[14px] font-bold text-orange-200 transition-colors hover:bg-orange-400/10"
                  >
                    Start Now
                  </TrackLink>
                </div>
              </>
            )}
            <p className={isManagerToolsPage ? 'mt-3 text-[12px] whitespace-pre-line text-slate-400' : 'mt-3 text-[12px] text-slate-400'}>{hero.trialNote}</p>
          </div>
        </section>

        {faqs && faqs.length > 0 && (
          <section className="border-b border-white/10 bg-slate-950/80 px-4 py-12 sm:px-6" aria-labelledby="faq-heading">
            <div className="max-w-5xl mx-auto">
              <h2 id="faq-heading" className="text-[22px] font-bold text-white mb-6">Common questions</h2>
              <div className="space-y-3">
                {faqs.map((f) => (
                  <details key={f.question} className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 group">
                    <summary className="list-none cursor-pointer text-[14px] font-semibold text-white flex justify-between items-start gap-3">
                      <span>{f.question}</span>
                      <span className="mt-0.5 shrink-0 text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <p className="mt-3 text-[13px] leading-relaxed text-slate-200 [text-wrap:pretty]">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

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

        <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-10 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className={useCenteredFooter ? 'flex flex-col items-center gap-5' : 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'}>
              <span className={useCenteredFooter ? 'text-[12px] font-bold tracking-[0.18em] uppercase text-slate-400 text-center' : 'text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400'}>
                <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
              </span>
              <div className={useCenteredFooter ? 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3 text-[12px] text-slate-400 justify-items-center text-center' : 'flex items-center gap-4 sm:gap-5 flex-wrap text-[12px] text-slate-400'}>
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

            {useCenteredFooter ? (
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
