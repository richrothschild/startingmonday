import { BrandIcon } from '@/components/BrandIcon'
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { TrackLink } from '@/components/TrackLink'
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
  void rolePathPriorityByCtaKey
  const heroLines = [hero.eyebrow, ...hero.h1Lines, hero.body]

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
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
          </div>
        </div>
      </nav>

      <main>
        <section id="core-clarity" data-emi-section="clarity_block" className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
          <div className="max-w-5xl mx-auto">
            {isHomePage ? (
              <div className="mb-6">
                {heroLines.map((line) => (
                  <p key={line} className="text-white text-[1.9rem] sm:text-[2.05rem] lg:text-[2.9rem] font-bold leading-[1.07] tracking-tight mb-3 sm:mb-4 sm:whitespace-nowrap">
                    {line}
                  </p>
                ))}
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
            <div className="mb-6">
              <TrackLink
                href="/concierge?program=beta&from=landing"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{
                  channel: 'executives',
                  cta_label: 'hero_apply_beta',
                  source_page: sourcePage,
                }}
                className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
              >
                Start Now
              </TrackLink>
            </div>

            {proofHighlights && proofHighlights.length > 0 && (
              <p className="text-[14px] sm:text-[15px] text-emerald-200 leading-relaxed mb-6 sm:whitespace-nowrap" data-emi-proof="landing_micro_proof">
                <span className="font-semibold text-emerald-100">Proof:</span> Executives using Starting Monday stay organized, sharpen narrative-to-role fit, and walk into interviews with role-specific evidence.
              </p>
            )}

            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-5 mb-6" data-emi-proof="landing_clarity_panel">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">At a glance</p>
              <p className="text-[15px] sm:text-[16px] text-slate-200 leading-relaxed mb-4 [text-wrap:pretty]">
                Connect with the right relationships at the right time and get to the front of the line before the role is obvious to the market.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <article className="rounded-md border border-slate-700 bg-slate-900/70 p-3">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2">Opportunity Timing Gap Chart</p>
                  <svg viewBox="0 0 320 190" className="w-full h-[180px]" role="img" aria-label="Opportunity timing gap chart preview">
                    <rect x="0" y="0" width="320" height="190" rx="8" fill="#0b1428" />
                    <line x1="24" y1="106" x2="300" y2="106" stroke="#334155" strokeWidth="2" />
                    <circle cx="32" cy="106" r="3.5" fill="#64748b" />
                    <circle cx="76" cy="106" r="3.5" fill="#64748b" />
                    <circle cx="116" cy="106" r="3.5" fill="#64748b" />
                    <circle cx="156" cy="106" r="3.5" fill="#64748b" />
                    <circle cx="196" cy="106" r="3.5" fill="#64748b" />
                    <circle cx="236" cy="106" r="3.5" fill="#64748b" />
                    <circle cx="276" cy="106" r="3.5" fill="#64748b" />

                    <g transform="translate(26 136) rotate(-34)">
                      <text fill="#cbd5e1" fontSize="9">Signal appears</text>
                    </g>
                    <g transform="translate(70 136) rotate(-34)">
                      <text fill="#cbd5e1" fontSize="9">Role shaped</text>
                    </g>
                    <g transform="translate(106 136) rotate(-34)">
                      <text fill="#cbd5e1" fontSize="9">Quiet outreach</text>
                    </g>
                    <g transform="translate(150 136) rotate(-34)">
                      <text fill="#cbd5e1" fontSize="9">Role opens</text>
                    </g>
                    <g transform="translate(190 136) rotate(-34)">
                      <text fill="#cbd5e1" fontSize="9">Interviews</text>
                    </g>
                    <g transform="translate(228 136) rotate(-34)">
                      <text fill="#cbd5e1" fontSize="9">Selection</text>
                    </g>
                    <g transform="translate(264 136) rotate(-34)">
                      <text fill="#cbd5e1" fontSize="9">Start date</text>
                    </g>

                    <line x1="78" y1="44" x2="78" y2="98" stroke="#22c55e" strokeWidth="3" />
                    <polygon points="78,106 72,96 84,96" fill="#22c55e" />
                    <text x="20" y="26" fill="#86efac" fontSize="9.5" fontWeight="700">Starting Monday enters here</text>

                    <line x1="194" y1="58" x2="194" y2="98" stroke="#f97316" strokeWidth="3" />
                    <polygon points="194,106 188,96 200,96" fill="#f97316" />
                    <text x="162" y="44" fill="#fdba74" fontSize="9.5" fontWeight="700">Typical candidates enter here</text>

                    <text x="16" y="178" fill="#cbd5e1" fontSize="10" fontWeight="600">Key takeaway: entering before roles open materially improves shortlist odds.</text>
                  </svg>
                  <p className="text-[12px] sm:text-[13px] text-slate-100 mt-2 leading-relaxed font-semibold">
                    <span className="text-slate-400 uppercase tracking-[0.08em] text-[10px] mr-1.5">Takeaway:</span>
                    <span>Most executives enter too late. This system helps you engage sooner, while role scope is still being shaped.</span>
                  </p>
                </article>

                <article className="rounded-md border border-slate-700 bg-slate-900/70 p-3">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2">Weekly Operating Rhythm Board</p>
                  <svg viewBox="0 0 320 188" className="w-full h-[178px]" role="img" aria-label="Weekly operating rhythm board preview">
                    <rect x="0" y="0" width="320" height="188" rx="8" fill="#0b1428" />
                    <rect x="16" y="24" width="288" height="36" rx="6" fill="#0ea5e9" />
                    <rect x="16" y="68" width="288" height="36" rx="6" fill="#22c55e" />
                    <rect x="16" y="112" width="288" height="36" rx="6" fill="#f59e0b" />
                    <text x="28" y="40" fill="#0b1428" fontSize="9.5" fontWeight="700">
                      <tspan x="28" dy="0">MON-TUE: Prioritize target accounts</tspan>
                      <tspan x="28" dy="12">and confirm role signals</tspan>
                    </text>
                    <text x="28" y="84" fill="#0b1428" fontSize="9.5" fontWeight="700">
                      <tspan x="28" dy="0">WED: Send focused outreach with</tspan>
                      <tspan x="28" dy="12">audience-specific narrative</tspan>
                    </text>
                    <text x="28" y="128" fill="#0b1428" fontSize="9.5" fontWeight="700">
                      <tspan x="28" dy="0">THU-FRI: Prepare briefs and advance</tspan>
                      <tspan x="28" dy="12">next-step conversations</tspan>
                    </text>
                    <text x="16" y="172" fill="#94a3b8" fontSize="10">Clear weekly actions replace reactive searching and lost momentum.</text>
                  </svg>
                  <p className="text-[12px] sm:text-[13px] text-slate-100 mt-2 leading-relaxed font-semibold">
                    <span className="text-slate-400 uppercase tracking-[0.08em] text-[10px] mr-1.5">Takeaway:</span>
                    <span>A structured weekly cadence reduces drift and keeps search momentum moving toward decision-ready conversations.</span>
                  </p>
                </article>

                <article className="rounded-md border border-slate-700 bg-slate-900/70 p-3">
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2">Interview Brief Anatomy</p>
                  <svg viewBox="0 0 320 182" className="w-full h-[172px]" role="img" aria-label="Interview brief anatomy preview">
                    <rect x="0" y="0" width="320" height="182" rx="8" fill="#0b1428" />
                    <rect x="20" y="24" width="280" height="132" rx="8" fill="#0f172a" stroke="#334155" />
                    <line x1="20" y1="56" x2="300" y2="56" stroke="#334155" />
                    <line x1="20" y1="88" x2="300" y2="88" stroke="#334155" />
                    <line x1="20" y1="120" x2="300" y2="120" stroke="#334155" />
                    <text x="32" y="44" fill="#e2e8f0" fontSize="11">Role Thesis</text>
                    <text x="32" y="76" fill="#e2e8f0" fontSize="11">Likely Objections</text>
                    <text x="32" y="108" fill="#e2e8f0" fontSize="11">Proof Points</text>
                    <text x="32" y="140" fill="#e2e8f0" fontSize="11">Calibrated Questions</text>
                    <defs>
                      <linearGradient id="briefFlow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <line x1="250" y1="40" x2="250" y2="146" stroke="url(#briefFlow)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="250" cy="40" r="7" fill="#38bdf8" />
                    <circle cx="250" cy="72" r="7" fill="#60a5fa" />
                    <circle cx="250" cy="104" r="7" fill="#f59e0b" />
                    <circle cx="250" cy="136" r="7" fill="#22c55e" />
                    <text x="20" y="172" fill="#94a3b8" fontSize="10">Flow from thesis to calibrated questions keeps interviews role-specific.</text>
                  </svg>
                  <p className="text-[12px] sm:text-[13px] text-slate-100 mt-2 leading-relaxed font-semibold">
                    <span className="text-slate-400 uppercase tracking-[0.08em] text-[10px] mr-1.5">Takeaway:</span>
                    <span>Strong interview performance comes from one brief that aligns thesis, objections, proof, and calibrated questions.</span>
                  </p>
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
              <TrackLink
                href="/concierge?program=beta&from=landing"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{
                  channel: 'executives',
                  cta_label: 'next_step_start_now',
                  source_page: sourcePage,
                }}
                className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
              >
                Start Now
              </TrackLink>
            </div>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">
                <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
              </span>
              <div className="flex items-center gap-4 sm:gap-5 flex-wrap text-[12px] text-slate-400">
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

            <p className="text-[11px] text-slate-500 mt-5">Privacy-first by design. No sale of user data, ever.</p>
            <p className="text-[11px] text-slate-500 mt-2">&copy; {new Date().getFullYear()} Starting Monday. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
