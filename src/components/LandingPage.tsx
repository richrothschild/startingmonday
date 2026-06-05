import { BrandIcon } from '@/components/BrandIcon'
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { TrackLink } from '@/components/TrackLink'
import { TrackedAccordionItem } from '@/components/TrackedAccordionItem'
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
          <div className="max-w-3xl mx-auto">
            <p className={`text-slate-300 font-semibold leading-relaxed mb-5 sm:mb-7 whitespace-pre-line [text-wrap:balance] ${isHomePage ? 'text-2xl sm:text-[2.05rem]' : 'text-lg sm:text-xl'}`}>
              {hero.eyebrow}
            </p>
            <h1 className={`font-bold text-white tracking-tight mb-5 [text-wrap:balance] ${isHomePage ? 'text-[2.28rem] leading-[1.03] sm:text-[4rem] sm:leading-[1.08]' : 'text-4xl sm:text-5xl leading-[1.1]'}`}>
              {hero.h1Lines.map((line, i) => (
                <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
              ))}
            </h1>
            <p className={`text-slate-200 leading-relaxed max-w-xl mb-4 [text-wrap:pretty] ${isHomePage ? 'text-2xl sm:text-[1.7rem] font-medium' : 'text-base'}`}>
              {hero.body}
            </p>
            {hero.bodyPreamble && (
              <p className={`text-slate-400 leading-relaxed max-w-xl mb-3 whitespace-pre-line [text-wrap:pretty] ${isHomePage ? 'text-[15px]' : 'text-sm'}`}>
                {hero.bodyPreamble}
              </p>
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
              <p className="text-[12px] sm:text-[13px] text-emerald-200 leading-relaxed mb-6 whitespace-nowrap" data-emi-proof="landing_micro_proof">
                <span className="font-semibold text-emerald-100">Proof:</span> {proofHighlights[0]?.detail}
              </p>
            )}

            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-5 mb-6" data-emi-proof="landing_clarity_panel">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">At a glance</p>
              <p className="text-[13px] text-slate-200 leading-relaxed mb-4 [text-wrap:pretty]">
                Connect with the right relationships at the right time and get to the front of the line before the role is obvious to the market.
              </p>
              <div className="space-y-2.5">
                {HOME_BLUF_SECTIONS.map((section) => (
                  <TrackedAccordionItem
                    key={section.title}
                    title={section.title}
                    summary={section.summary}
                    detail={section.detail}
                    href={section.href}
                    channel="executives"
                    route="/"
                    blockId={`home_bluf_${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`}
                  />
                ))}
              </div>
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

        <section id="executive-why" data-emi-section="executive_why_block" className="bg-slate-800 px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-700">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-4">Why it matters to executives</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXECUTIVE_WHY.map((item) => (
                <div key={item} className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-4">
                  <p className="text-[14px] text-slate-100 leading-relaxed font-medium">{item}</p>
                </div>
              ))}
            </div>
            {hero.competitiveEdge && (
              <p className="text-sm text-orange-300 leading-relaxed mt-6 font-medium inline-flex items-start gap-1.5">
                <BrandIcon name="performance" className="h-4 w-4 text-orange-400 mt-[1px] shrink-0" />
                <span>{hero.competitiveEdge}</span>
              </p>
            )}
          </div>
        </section>

        <section id="what-you-get" data-emi-section="what_you_get_block" className="bg-white px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-100">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">What you get</p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-2 max-w-3xl leading-snug">
              Four execution advantages for senior search outcomes.
            </h2>
            <p className="text-[14px] text-slate-600 mb-8 max-w-3xl leading-relaxed">
              Position for the right room, control the conversation, run a weekly system, and adapt from evidence.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl">
              {EXECUTIVE_GETS.map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[12px] font-bold tracking-[0.12em] uppercase text-orange-500 mb-2">Outcome</p>
                  <p className="text-[18px] font-semibold text-slate-900 leading-snug mb-2">{item.title}</p>
                  <p className="text-[14px] text-slate-600 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>

            {proofHighlights && proofHighlights.length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:p-5 mt-10" data-emi-proof="landing_proof_highlights">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-700 mb-3">Proof snapshot</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proofHighlights.map((item) => (
                    <div key={item.metric} className="rounded-md border border-emerald-200 bg-white p-3">
                      <p className="text-[13px] font-semibold text-emerald-900">{item.metric}</p>
                      <p className="text-[12px] text-slate-700 leading-relaxed mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
